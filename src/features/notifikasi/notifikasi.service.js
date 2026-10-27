import { eq, and, or, count, ilike, sql } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { notifikasi, kelas, users } from '../../db/schema.js';
import { throwError } from '../../utils/error.utils.js';

// 1. Ambil Daftar Notifikasi Pengguna Berdasarkan Token & Role
export const getNotifikasiList = async (user, query) => {
    const { page = 1, limit = 20, is_read } = query || {};

    const safePage = Math.max(1, Number(page));
    const safeLimit = Math.min(100, Math.max(1, Number(limit)));
    const offset = (safePage - 1) * safeLimit;

    // Condition 1: Notifikasi personal bertarget user_id
    const userConditions = [eq(notifikasi.user_id, Number(user.id))];

    // Condition 2: Filter Mahasiswa berdasarkan kelas dari tabel users
    if (user.role === 'MAHASISWA') {
        const [studentData] = await db
            .select({ nama_kelas: kelas.nama_kelas })
            .from(users)
            .leftJoin(kelas, eq(users.kelas_id, kelas.id))
            .where(eq(users.id, Number(user.id)))
            .limit(1);

        if (studentData?.nama_kelas) {
            userConditions.push(ilike(notifikasi.kelas_target, studentData.nama_kelas.trim()));
        }
    }

    const recipientCondition = or(...userConditions);
    const conditions = [recipientCondition];

    if (is_read !== undefined && is_read !== '') {
        const boolIsRead = is_read === 'true' || is_read === true;
        conditions.push(eq(notifikasi.dibaca, boolIsRead));
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
        .where(and(recipientCondition, eq(notifikasi.dibaca, false)));

    // Data Notifikasi (Alias dibaca menjadi is_read untuk kompatibilitas FE)
    const data = await db
        .select({
            id: notifikasi.id,
            user_id: notifikasi.user_id,
            kelas_target: notifikasi.kelas_target,
            judul: notifikasi.judul,
            pesan: notifikasi.pesan,
            is_read: notifikasi.dibaca,
            created_at: notifikasi.created_at,
        })
        .from(notifikasi)
        .where(whereClause)
        .orderBy(sql`${notifikasi.created_at} DESC`)
        .limit(safeLimit)
        .offset(offset);

    const totalItems = Number(total);
    const totalPages = Math.ceil(totalItems / safeLimit) || 1;

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

    if (notif.user_id && notif.user_id !== Number(user.id)) {
        throwError('Akses ditolak, Anda tidak memiliki akses ke notifikasi ini', 403);
    }

    const [updated] = await db
        .update(notifikasi)
        .set({ dibaca: true })
        .where(eq(notifikasi.id, Number(id)))
        .returning();

    return updated;
};

// 3. Tandai Semua Notifikasi Milik Pengguna Sebagai Sudah Dibaca
export const markAllAsRead = async (user) => {
    const userConditions = [eq(notifikasi.user_id, Number(user.id))];

    if (user.role === 'MAHASISWA') {
        const [studentData] = await db
            .select({ nama_kelas: kelas.nama_kelas })
            .from(users)
            .leftJoin(kelas, eq(users.kelas_id, kelas.id))
            .where(eq(users.id, Number(user.id)))
            .limit(1);

        if (studentData?.nama_kelas) {
            userConditions.push(eq(notifikasi.kelas_target, studentData.nama_kelas));
        }
    }

    const targetCondition = and(or(...userConditions), eq(notifikasi.dibaca, false));

    const updated = await db
        .update(notifikasi)
        .set({ dibaca: true })
        .where(targetCondition)
        .returning();

    return {
        updated_count: updated.length,
    };
};