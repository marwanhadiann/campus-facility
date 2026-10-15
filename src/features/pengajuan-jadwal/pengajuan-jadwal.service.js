import { eq, and, or, lte, gte, aliasedTable } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { pengajuanJadwal, jadwal, ruang, users, mataKuliah, notifikasi } from '../../db/schema.js';
import { throwError } from '../../utils/error.utils.js';
import { checkRoomConflict } from '../../utils/schedule.utils.js';


// 1. Dosen Mengajukan Perubahan Jadwal Baru
export const createPengajuan = async (payload) => {
    const { jadwal_id, dosen_id, tanggal_baru, jam_mulai_baru, jam_selesai_baru, ruang_baru_id, alasan } = payload;

    // Pastikan jadwal perkuliahan asli ada dan memang milik dosen yang bersangkutan
    const [existingJadwal] = await db
        .select()
        .from(jadwal)
        .where(and(eq(jadwal.id, Number(jadwal_id)), eq(jadwal.dosen_id, Number(dosen_id))));

    if (!existingJadwal) {
        throwError('Jadwal perkuliahan tidak ditemukan atau bukan milik Anda', 404);
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

    // ATURAN BISNIS : Wajib melampirkan catatan saat menolak pengajuan
    if (status === 'REJECTED' && !catatan_staff) {
        throwError('Catatan penjelasan dari staff wajib diisi saat menolak pengajuan ganti jadwal', 400);
    }

    // Ambil detail data pengajuan jadwal
    const [pengajuan] = await db
        .select()
        .from(pengajuanJadwal)
        .where(eq(pengajuanJadwal.id, Number(id)));

    if (!pengajuan) throwError('Data pengajuan jadwal tidak ditemukan', 404);

    if (pengajuan.status !== 'PENDING') throwError('Pengajuan ini sudah pernah dievaluasi sebelumnya', 400);

    // ATURAN BISNIS 2 (ZERO ROOM CONFLICT): Pengecekan Bentrok Ruangan jika disetujui (APPROVED)
    if (status === 'APPROVED') {
        const conflictCheck = await checkRoomConflict({
            ruangId: pengajuan.ruang_baru_id,
            tanggal: pengajuan.tanggal_baru,
            jamMulai: pengajuan.jam_mulai_baru,
            jamSelesai: pengajuan.jam_selesai_baru,
            currentPengajuanId: pengajuan.id
        })

        if (conflictCheck.hasConflict) throwError(conflictCheck.message, 400)
    }

    const [jadwalLama] = await db
        .select()
        .from(jadwal)
        .where(eq(jadwal.id, pengajuan.jadwal_id))

    return await db.transaction(async (tx) => {
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

        if (status === 'APPROVED') {
            // Notif personal untuk DOSEN
            await tx.insert(notifikasi).values({
                user_id: pengajuan.dosen_id,
                judul: 'Pengajuan jadwal disetujui',
                pesan: `Pengajuan ganti jadwal Anda untuk kelas ${jadwalLama?.kelas || ''} pada tanggal ${pengajuan.tanggal_baru} (${pengajuan.jam_mulai_baru} - ${pengajuan.jam_selesai_baru}) telah disetujui oleh Staff`
            })

            // Notif untuk mahasiswa di kelas terkait
            await tx.insert(notifikasi).values({
                kelas_target: jadwalLama?.kelas || null,
                judul: 'Pengumuman perubahan jadwal perkuliahan',
                pesan: `Perhatian untuk mahasiswa kelas ${jadwalLama?.kelas || ''}: Perkuliahan mengalami perubahan jadwal ke tanggal ${pengajuan.tanggal_baru} jam ${pengajuan.jam_mulai_baru} - ${pengajuan.jam_selesai_baru}.`
            })
        } else if (status === 'REJECTED') {
            await tx.insert(notifikasi).values({
                user_id: pengajuan.dosen_id,
                judul: 'Pengajuan jadwal ditolak',
                pesan: `Pengajuan jadwal pengganti untuk kelas ${jadwalLama?.kelas || ''} ditolak oleh Staff. Catatan ${catatan_staff}`
            })
        }

        return updated;
    })
};

// 4. Ambil Detail Tracking Pengajuan Jadwal Berdasarkan ID
export const getPengajuanDetail = async (id, user) => {
    const ruangLama = aliasedTable(ruang, 'ruang_lama')
    const ruangBaru = aliasedTable(ruang, 'ruang_baru')

    const [report] = await db
        .select({
            id: pengajuanJadwal.id,
            status: pengajuanJadwal.status,
            alasan: pengajuanJadwal.alasan,
            catatan_staff: pengajuanJadwal.catatan_staff,
            tanggal_baru: pengajuanJadwal.tanggal_baru,
            jam_mulai_baru: pengajuanJadwal.jam_mulai_baru,
            jam_selesai_baru: pengajuanJadwal.jam_selesai_baru,
            created_at: pengajuanJadwal.created_at,
            updated_at: pengajuanJadwal.updated_at,
            dosen_id: pengajuanJadwal.dosen_id,
            dosen: {
                nama: users.nama,
                email: users.email,
            },
            jadwal_asal: {
                hari: jadwal.hari,
                jam_mulai: jadwal.jam_mulai,
                jam_selesai: jadwal.jam_selesai,
                mata_kuliah: mataKuliah.nama_mk,
                kode_mk: mataKuliah.kode_mk,
                nama_ruang: ruangLama.nama_ruang,
            },
            ruang_baru: {
                nama_ruang: ruangBaru.nama_ruang,
                kode_ruang: ruangBaru.kode_ruang,
            },
        })
        .from(pengajuanJadwal)
        .innerJoin(users, eq(pengajuanJadwal.dosen_id, users.id))
        .innerJoin(jadwal, eq(pengajuanJadwal.jadwal_id, jadwal.id))
        .innerJoin(mataKuliah, eq(jadwal.mata_kuliah_id, mataKuliah.id))
        .leftJoin(ruangLama, eq(jadwal.ruang_id, ruangLama.id))
        .leftJoin(ruangBaru, eq(pengajuanJadwal.ruang_baru_id, ruangBaru.id))
        .where(eq(pengajuanJadwal.id, Number(id)))

    if (!report) throwError('Data pengajuan jadwal tidak ditemukan', 404)

    // Hak Akses: Dosen hanya bisa melihat pengajuan miliknya sendiri
    if (user.role === 'DOSEN' && report.dosen_id !== Number(user.id))
        throwError('Akses ditolak, Anda tidak memiliki akses ke pengajuan data ini', 403)

    return report
}