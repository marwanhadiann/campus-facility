import { and, eq, lte, gte, ne, lt, gt } from 'drizzle-orm';
import { db } from '../db/index.js';
import { jadwal, pengajuanJadwal } from '../db/schema.js';

/**
 * Helper untuk mengecek ketersediaan / bentrok ruangan (Zero Room Conflict)
 */
export const checkRoomConflict = async ({ ruangId, tanggal, jamMulai, jamSelesai, currentPengajuanId = null }) => {
    // 1. Konversi tanggal (YYYY-MM-DD) menjadi nama hari dalam enum (SENIN, SELASA, dll)
    const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
    const dateObj = new Date(tanggal);
    const targetDay = days[dateObj.getDay()];

    // 2. Jalankan kedua query secara paralel menggunakan Promise.all (Optimal & Cepat)
    const [conflictJadwalReguler, conflictPengajuanLain] = await Promise.all([
        // Query A: Cek Bentrok ke Tabel Jadwal Reguler (Berdasarkan Hari)
        db
            .select()
            .from(jadwal)
            .where(
                and(
                    eq(jadwal.ruang_id, Number(ruangId)),
                    eq(jadwal.hari, targetDay),
                    // Overlapping Time Window
                    lte(jadwal.jam_mulai, jamSelesai),
                    gte(jadwal.jam_selesai, jamMulai)
                )
            ),

        // Query B: Cek Bentrok ke Tabel Pengajuan Jadwal lain yang APPROVED (Berdasarkan Tanggal Spesifik)
        db
            .select()
            .from(pengajuanJadwal)
            .where(
                and(
                    eq(pengajuanJadwal.ruang_baru_id, Number(ruangId)),
                    eq(pengajuanJadwal.tanggal_baru, tanggal),
                    eq(pengajuanJadwal.status, 'APPROVED'),
                    currentPengajuanId ? ne(pengajuanJadwal.id, Number(currentPengajuanId)) : undefined,
                    // Overlapping Time Window
                    lte(pengajuanJadwal.jam_mulai_baru, jamSelesai),
                    gte(pengajuanJadwal.jam_selesai_baru, jamMulai)
                )
            )
    ]);

    // 3. Evaluasi Hasil
    if (conflictJadwalReguler.length > 0) {
        return {
            hasConflict: true,
            message: `Persetujuan ditolak: Ruangan tersebut sedang dipakai oleh jadwal kuliah reguler pada hari ${targetDay} (Room Conflict)`
        };
    }

    if (conflictPengajuanLain.length > 0) {
        return {
            hasConflict: true,
            message: `Persetujuan ditolak: Ruangan tersebut sudah terpakai oleh pengajuan ganti jadwal lain yang disetujui (Room Conflict)`
        };
    }

    return { hasConflict: false };
};

/**
 * Cek Bentrok Jadwal Reguler (Create / Update Jadwal oleh Staff)
 * Memeriksa: Duplikasi Matkul Kelas, Bentrok Ruangan, Bentrok Dosen, Bentrok Jam Kelas
 */
export const checkJadwalRegulerConflict = async ({
    mataKuliahId,
    kelasId,
    dosenId,
    ruangId,
    hari,
    jamMulai,
    jamSelesai,
    currentJadwalId = null
}) => {
    // 1. Cek Duplikasi Mata Kuliah pada Kelas yang Sama
    const [existingMatkul] = await db
        .select({ id: jadwal.id })
        .from(jadwal)
        .where(
            and(
                eq(jadwal.mata_kuliah_id, Number(mataKuliahId)),
                eq(jadwal.kelas_id, Number(kelasId)),
                currentJadwalId ? ne(jadwal.id, Number(currentJadwalId)) : undefined
            )
        );

    if (existingMatkul) {
        return {
            hasConflict: true,
            message: 'Mata kuliah ini sudah memiliki jadwal pada kelas yang dipilih.'
        };
    }

    // 2. Cek Bentrok Ruangan & Waktu
    const [bentrokRuang] = await db
        .select({ id: jadwal.id })
        .from(jadwal)
        .where(
            and(
                eq(jadwal.hari, hari),
                eq(jadwal.ruang_id, Number(ruangId)),
                lt(jadwal.jam_mulai, jamSelesai),
                gt(jadwal.jam_selesai, jamMulai),
                currentJadwalId ? ne(jadwal.id, Number(currentJadwalId)) : undefined
            )
        );

    if (bentrokRuang) {
        return {
            hasConflict: true,
            message: 'Ruangan sudah terpakai oleh kelas lain pada hari dan jam tersebut.'
        };
    }

    // 3. Cek Bentrok Dosen & Waktu
    const [bentrokDosen] = await db
        .select({ id: jadwal.id })
        .from(jadwal)
        .where(
            and(
                eq(jadwal.hari, hari),
                eq(jadwal.dosen_id, Number(dosenId)),
                lt(jadwal.jam_mulai, jamSelesai),
                gt(jadwal.jam_selesai, jamMulai),
                currentJadwalId ? ne(jadwal.id, Number(currentJadwalId)) : undefined
            )
        );

    if (bentrokDosen) {
        return {
            hasConflict: true,
            message: 'Dosen pengampu sudah memiliki jadwal mengajar di tempat lain pada jam tersebut.'
        };
    }

    // 4. Cek Bentrok Jam Kelas
    const [bentrokKelas] = await db
        .select({ id: jadwal.id })
        .from(jadwal)
        .where(
            and(
                eq(jadwal.hari, hari),
                eq(jadwal.kelas_id, Number(kelasId)),
                lt(jadwal.jam_mulai, jamSelesai),
                gt(jadwal.jam_selesai, jamMulai),
                currentJadwalId ? ne(jadwal.id, Number(currentJadwalId)) : undefined
            )
        );

    if (bentrokKelas) {
        return {
            hasConflict: true,
            message: 'Kelas tersebut sudah memiliki jadwal perkuliahan lain pada jam tersebut.'
        };
    }

    return { hasConflict: false };
};