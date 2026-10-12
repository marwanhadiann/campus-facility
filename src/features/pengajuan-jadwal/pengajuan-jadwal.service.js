import { eq, and, or, lte, gte } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { pengajuanJadwal, jadwal, ruang, users, mataKuliah } from '../../db/schema.js';

// Helper custom error untuk memicu statusCode pada middleware errorHandler
const createCustomError = (message, statusCode = 400) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

// 1. Dosen Mengajukan Perubahan Jadwal Baru
export const createPengajuan = async (payload) => {
    const { jadwal_id, dosen_id, tanggal_baru, jam_mulai_baru, jam_selesai_baru, ruang_baru_id, alasan } = payload;

    // Pastikan jadwal perkuliahan asli ada dan memang milik dosen yang bersangkutan
    const [existingJadwal] = await db
        .select()
        .from(jadwal)
        .where(and(eq(jadwal.id, Number(jadwal_id)), eq(jadwal.dosen_id, Number(dosen_id))));

    if (!existingJadwal) {
        throw createCustomError('Jadwal perkuliahan tidak ditemukan atau bukan milik Anda', 404);
    }

    // Insert pengajuan baru (Status default: PENDING)
    const [newPengajuan] = await db
        .insert(pengajuanJadwal)
        .values({
            jadwal_id: Number(jadwal_id),
            dosen_id: Number(dosen_id),
            tanggal_baru,
            jam_mulai_baru,
            jam_selesai_baru,
            ruang_baru_id: ruang_baru_id ? Number(ruang_baru_id) : existingJadwal.ruang_id,
            alasan,
            status: 'PENDING',
        })
        .returning();

    return newPengajuan;
};

// 2. Mengambil Daftar Pengajuan Jadwal (Dengan Join Detail)
export const getPengajuanList = async (user) => {
    const conditions = [];

    // Jika yang mengakses adalah DOSEN, tampilkan pengajuan miliknya saja
    if (user.role === 'DOSEN') {
        conditions.push(eq(pengajuanJadwal.dosen_id, Number(user.id)));
    }

    return await db
        .select({
            id: pengajuanJadwal.id,
            tanggal_baru: pengajuanJadwal.tanggal_baru,
            jam_mulai_baru: pengajuanJadwal.jam_mulai_baru,
            jam_selesai_baru: pengajuanJadwal.jam_selesai_baru,
            alasan: pengajuanJadwal.alasan,
            status: pengajuanJadwal.status,
            catatan_staff: pengajuanJadwal.catatan_staff,
            dosen: {
                nama: users.nama,
                email: users.email,
            },
            ruang_baru: {
                nama_ruang: ruang.nama_ruang,
                kode_ruang: ruang.kode_ruang,
            },
        })
        .from(pengajuanJadwal)
        .innerJoin(users, eq(pengajuanJadwal.dosen_id, users.id))
        .leftJoin(ruang, eq(pengajuanJadwal.ruang_baru_id, ruang.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined);
};

// 3. Evaluasi Keputusan Staff (APPROVED / REJECTED)
export const evaluatePengajuan = async (id, staffId, payload) => {
    const { status, catatan_staff } = payload;

    // ATURAN BISNIS 3: Wajib melampirkan catatan saat menolak pengajuan
    if (status === 'REJECTED' && !catatan_staff) {
        throw createCustomError('Catatan penjelasan dari staff wajib diisi saat menolak pengajuan ganti jadwal', 400);
    }

    // Ambil detail data pengajuan jadwal
    const [pengajuan] = await db
        .select()
        .from(pengajuanJadwal)
        .where(eq(pengajuanJadwal.id, Number(id)));

    if (!pengajuan) {
        throw createCustomError('Data pengajuan jadwal tidak ditemukan', 404);
    }

    if (pengajuan.status !== 'PENDING') {
        throw createCustomError('Pengajuan ini sudah pernah dievaluasi sebelumnya', 400);
    }

    // ATURAN BISNIS 2 (ZERO ROOM CONFLICT): Pengecekan Bentrok Ruangan jika disetujui (APPROVED)
    if (status === 'APPROVED') {
        const targetRuangId = pengajuan.ruang_baru_id;

        // Cek apakah ada pengajuan lain yang SUDAH DISATUKAN pada ruangan, tanggal, dan rentang jam yang sama
        const roomConflict = await db
            .select()
            .from(pengajuanJadwal)
            .where(
                and(
                    eq(pengajuanJadwal.ruang_baru_id, targetRuangId),
                    eq(pengajuanJadwal.tanggal_baru, pengajuan.tanggal_baru),
                    eq(pengajuanJadwal.status, 'APPROVED'),
                    // Logika Irisan Jam (Overlapping Time Window)
                    lte(pengajuanJadwal.jam_mulai_baru, pengajuan.jam_selesai_baru),
                    gte(pengajuanJadwal.jam_selesai_baru, pengajuan.jam_mulai_baru)
                )
            );

        if (roomConflict.length > 0) {
            throw createCustomError('Persetujuan ditolak: Ruangan tersebut sudah terpakai oleh jadwal perkuliahan lain pada tanggal dan jam tersebut (Room Conflict)', 400);
        }
    }

    // Update status keputusan staff
    const [updated] = await db
        .update(pengajuanJadwal)
        .set({
            status,
            catatan_staff,
            staff_id: Number(staffId),
            updated_at: new Date(),
        })
        .where(eq(pengajuanJadwal.id, Number(id)))
        .returning();

    return updated;
};