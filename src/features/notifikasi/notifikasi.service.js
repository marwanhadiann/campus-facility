import { eq, and, or, count, ilike, sql } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { notifikasi, kelas, mahasiswa } from '../../db/schema.js';
import { throwError } from '../../utils/error.utils.js';

// 1. Ambil Daftar Notifikasi Pengguna Berdasarkan Token & Role
export const getNotifikasiList = async (user, query) => {
    const { page = 1, limit = 10, is_read } = query;

    const safePage = Math.max(1, Number(page));
    const safeLimit = Math.min(100, Math.max(1, Number(limit)));
    const offset = (safePage - 1) * safeLimit;

    // 1. Kondisi Dasar: Notifikasi khusus bertarget user_id pengguna ini
    const userConditions = [eq(notifikasi.user_id, Number(user.id))];

    // 2. Filter Khusus Mahasiswa: Ambil notifikasi kelas yang hanya dimiliki mahasiswa tersebut
    if (user.role === 'MAHASISWA') {
        const studentClasses = await db
            .select({ nama_kelas: kelas.nama_kelas })
            .from(mahasiswa)
            .leftJoin(kelas, eq(mahasiswa.kelas_id, kelas.id))
            .where(eq(mahasiswa.user_id, Number(user.id)));

        // Tambahkan filter kelas_target sesuai kelas aktif mahasiswa
        studentClasses.forEach((item) => {
            if (item.nama_kelas) {
                userConditions.push(ilike(notifikasi.kelas_target, item.nama_kelas.trim()));
            }
        });
    }

    const recipientCondition = or(...userConditions);

    // Filter status dibaca (is_read)
    const conditions = [recipientCondition];
    if (is_read !== undefined && is_read !== '') {
        const boolIsRead = is_read === 'true' || is_read === true;
        conditions.push(eq(notifikasi.is_read, boolIsRead));
    }

    const whereClause = and(...conditions);

    // Total Data & Unread Count
    const [{ total }] = await db
        .select({ total: count() })
        .from(notifikasi)
        .where(whereClause);

    const [{ unread_count }] = await db
        .select({ unread_count: count() })
        .from(notifikasi)
        .where(and(recipientCondition, eq(notifikasi.is_read, false)));

    // Data Notifikasi
    const data = await db
        .select({
            id: notifikasi.id,
            user_id: notifikasi.user_id,
            kelas_target: notifikasi.kelas_target,
            judul: notifikasi.judul,
            pesan: notifikasi.pesan,
            is_read: notifikasi.is_read,
            created_at: notifikasi.created_at,
        })
        .from(notifikasi)
        .where(whereClause)
        .orderBy(sql`${notifikasi.created_at} DESC`)
        .limit(safeLimit)
        .offset(offset);

    const totalItems = Number(total);
    const totalPages = Math.ceil(totalItems / safeLimit);

    return {
        data,
        meta: {
            page: safePage,
            limit: safeLimit,
            total_items: totalItems,
            total_pages: totalPages,
            unread_count: Number(unread_count),
            has_next_page: safePage < totalPages,
            has_prev_page: safePage > 1,
        },
    };
};

// 2. Tandai 1 Notifikasi Sebagai Sudah Dibaca
export const markAsRead = async (id, user) => {
    const [notif] = await db
        .select()
        .from(notifikasi)
        .where(eq(notifikasi.id, Number(id)));

    if (!notif) {
        throwError('Notifikasi tidak ditemukan', 404);
    }

    // Validasi Hak Akses: Hanya penerima asli yang dapat mengubah status notifikasi
    if (notif.user_id && notif.user_id !== Number(user.id)) {
        throwError('Akses ditolak, Anda tidak memiliki akses ke notifikasi ini', 403);
    }

    const [updated] = await db
        .update(notifikasi)
        .set({
            is_read: true,
        })
        .where(eq(notifikasi.id, Number(id)))
        .returning();

    return updated;
};

// 3. Tandai Semua Notifikasi Milik Pengguna Sebagai Sudah Dibaca
export const markAllAsRead = async (user) => {
    const userConditions = [eq(notifikasi.user_id, Number(user.id))];

    if (user.role === 'MAHASISWA') {
        const [mahasiswaData] = await db
            .select({ nama_kelas: kelas.nama_kelas })
            .from(mahasiswa)
            .leftJoin(kelas, eq(mahasiswa.kelas_id, kelas.id))
            .where(eq(mahasiswa.user_id, Number(user.id)))
            .limit(1);

        if (mahasiswaData?.nama_kelas) {
            userConditions.push(eq(notifikasi.kelas_target, mahasiswaData.nama_kelas));
        }
    }

    const targetCondition = and(or(...userConditions), eq(notifikasi.is_read, false));

    const updated = await db
        .update(notifikasi)
        .set({
            is_read: true,
        })
        .where(targetCondition)
        .returning();

    return {
        updated_count: updated.length,
    };
};