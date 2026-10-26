import { and, eq } from "drizzle-orm"
import { db } from "../../db/index.js"
import { jadwal, kelas, mataKuliah, ruang, users } from "../../db/schema.js"
import { throwError } from '../../utils/error.utils.js'

// Untuk menambahkan matkul (khusus staff)
export const createMataKuliah = async (payload) => {
    const [newMK] = await db
        .insert(mataKuliah)
        .values(payload)
        .returning()

    return newMK
}

// untuk menambahkan jadwal (khusus staff)
export const createJadwal = async (payload) => {
    const { kode_mk, nomor_induk, ...scheduleData } = payload
    const [mk] = await db.select({ id: mataKuliah.id }).from(mataKuliah).where(eq(mataKuliah.kode_mk, kode_mk))
    if (!mk) throwError('Mata kuliah tidak ditemukan', 404)

    const [dosen] = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.nomor_induk, nomor_induk), eq(users.role, 'DOSEN')))
    if (!dosen) throwError('Dosen tidak ditemukan', 404)

    const [newJadwal] = await db
        .insert(jadwal)
        .values({ ...scheduleData, mata_kuliah_id: mk.id, dosen_id: dosen.id })
        .returning()

    return newJadwal
}

export const getJadwalOptions = async () => {
    const [mataKuliahList, dosenList] = await Promise.all([
        db.select({ kode_mk: mataKuliah.kode_mk, nama_mk: mataKuliah.nama_mk }).from(mataKuliah),
        db.select({ nomor_induk: users.nomor_induk, nama: users.nama }).from(users).where(eq(users.role, 'DOSEN')),
    ])

    return { mata_kuliah: mataKuliahList, dosen: dosenList }
}

// Mengambil jadwal harian / Filter dgn JOIN data lengkap
export const getJadwalFiltered = async (filter, user) => {
    const { hari, ruang_id, kelas: namaKelas, dosen_id } = filter

    // menyiapkan array kondisi query
    const condition = []
    if (user.role === 'MAHASISWA') {
        // Mahasiswa HANYA boleh melihat jadwal kelasnya sendiri.
        if (!user.kelas) throwError('Akses ditolak, Data kelas Mahasiswa tidak valid', 403)
        condition.push(eq(jadwal.kelas_id, Number(user.kelas)))
    } else if (user.role === 'DOSEN') {
        // Dosen HANYA boleh melihat jadwal yang diajarnya.
        condition.push(eq(jadwal.dosen_id, user.id))
    } else {
        // STAFF bebas melihat semuanya, sehingga filter dari query frontend tetap diaktifkan
        if (namaKelas) condition.push(eq(kelas.nama_kelas, namaKelas));
        if (dosen_id) condition.push(eq(jadwal.dosen_id, Number(dosen_id)));
    }

    //Filter umum (Hari dan Ruangan) yang aman dipakai untuk semua role
    if (hari) condition.push(eq(jadwal.hari, hari.toUpperCase()));
    if (ruang_id) condition.push(eq(jadwal.ruang_id, Number(ruang_id)));

    // query join table mata_kuliah, dosen, dan ruang
    return await db
        .select({
            jadwal_id: jadwal.id,
            kelas_id: jadwal.kelas_id,
            kelas: kelas.nama_kelas,
            hari: jadwal.hari,
            jam_mulai: jadwal.jam_mulai,
            jam_selesai: jadwal.jam_selesai,
            mata_kuliah: {
                kode_mk: mataKuliah.kode_mk,
                nama_mk: mataKuliah.nama_mk,
                sks: mataKuliah.sks
            },
            ruang: {
                kode_ruang: ruang.kode_ruang,
                nama_ruang: ruang.nama_ruang,
                lantai: ruang.lantai
            },
            dosen: {
                nomor_induk: users.nomor_induk,
                nama_dosen: users.nama,
                email_dosen: users.email
            }
        })
        .from(jadwal)
        .innerJoin(kelas, eq(jadwal.kelas_id, kelas.id))
        .innerJoin(mataKuliah, eq(jadwal.mata_kuliah_id, mataKuliah.id))
        .innerJoin(ruang, eq(jadwal.ruang_id, ruang.id))
        .innerJoin(users, eq(jadwal.dosen_id, users.id))
        .where(condition.length > 0 ? and(...condition) : undefined)
}
