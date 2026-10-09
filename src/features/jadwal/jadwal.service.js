import { and, eq } from "drizzle-orm"
import { db } from "../../db/index.js"
import { jadwal, mataKuliah, ruang, users } from "../../db/schema.js"

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
    const [newJadwal] = await db
        .insert(jadwal)
        .values(payload)
        .returning()

    return newJadwal
}

// Mengambil jadwal harian / Filter dgn JOIN data lengkap
export const getJadwalFiltered = async (filter) => {
    const { hari, ruang_id, kelas, dosen_id } = filter

    // menyiapkan array kondisi query
    const condition = []
    if (hari) condition.push(eq(jadwal.hari, hari.toUpperCase()));
    if (ruang_id) condition.push(eq(jadwal.ruang_id, Number(ruang_id)));
    if (kelas) condition.push(eq(jadwal.kelas, kelas));
    if (dosen_id) condition.push(eq(jadwal.dosen_id, Number(dosen_id)));

    // query join table mata_kuliah, dosen, dan ruang
    return await db
        .select({
            jadwal_id: jadwal.id,
            kelas: jadwal.kelas,
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
                nama_dosen: users.nama,
                email_dosen: users.email
            }
        })
        .from(jadwal)
        .innerJoin(mataKuliah, eq(jadwal.mata_kuliah_id, mataKuliah.id))
        .innerJoin(ruang, eq(jadwal.ruang_id, ruang.id))
        .innerJoin(users, eq(jadwal.dosen_id, users.id))
        .where(condition.length > 0 ? and(...condition) : undefined)
}