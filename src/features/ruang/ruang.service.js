import { and, desc, eq } from "drizzle-orm"
import { db } from "../../db/index.js"
import { jadwal, ruang } from "../../db/schema.js"
import { throwError } from "../../utils/error.utils.js"

export const assertRuangAccess = async (ruangId, user) => {
    if (!['MAHASISWA', 'DOSEN'].includes(user.role)) return
    if (user.role === 'MAHASISWA' && !user.kelas) throwError('Akses ditolak, data kelas mahasiswa tidak valid', 403)

    const scheduleCondition = user.role === 'MAHASISWA'
        ? eq(jadwal.kelas_id, Number(user.kelas))
        : eq(jadwal.dosen_id, Number(user.id))
    const [scheduledRoom] = await db
        .select({ id: jadwal.id })
        .from(jadwal)
        .where(and(eq(jadwal.ruang_id, Number(ruangId)), scheduleCondition))
        .limit(1)

    if (!scheduledRoom) throwError('Akses ditolak, ruangan bukan bagian dari jadwal anda', 403)
}

// Mengambil data semua ruang
export const getAllRuang = async (user) => {
    if (user.role === 'MAHASISWA' || user.role === 'DOSEN') {
        if (user.role === 'MAHASISWA' && !user.kelas) throwError('Akses ditolak, data kelas mahasiswa tidak valid', 403)
        const scheduleCondition = user.role === 'MAHASISWA'
            ? eq(jadwal.kelas_id, Number(user.kelas))
            : eq(jadwal.dosen_id, Number(user.id))
        return db
            .selectDistinct({
                id: ruang.id,
                kode_ruang: ruang.kode_ruang,
                nama_ruang: ruang.nama_ruang,
                lantai: ruang.lantai,
                status_ruang: ruang.status_ruang,
                created_at: ruang.created_at,
                updated_at: ruang.updated_at,
            })
            .from(ruang)
            .innerJoin(jadwal, eq(jadwal.ruang_id, ruang.id))
            .where(scheduleCondition)
            .orderBy(desc(ruang.updated_at))
    }

    return await db
        .select()
        .from(ruang)
        .orderBy(desc(ruang.updated_at))
}

// Mengambil data ruang berdasarkan id
export const getRuangById = async (id, user) => {
    const [data] = await db
        .select()
        .from(ruang)
        .where(eq(ruang.id, Number(id)))

    if (!data) throwError('Ruangan tidak ditemukan', 404)
    await assertRuangAccess(id, user)
    return data
}

// Menambahkan ruang (Khusus STAFF)
export const createRuang = async (payload) => {
    const { kode_ruang, nama_ruang, lantai, status_ruang } = payload

    const [newRuang] = await db
        .insert(ruang)
        .values({
            kode_ruang,
            nama_ruang,
            lantai: Number(lantai),
            status_ruang: status_ruang || 'TERSEDIA'
        })
        .returning()

    return newRuang;
}

// Update data ruang khusus staff
export const updateRuang = async (id, payload) => {
    const [updated] = await db
        .update(ruang)
        .set({
            updated_at: new Date(),
            ...payload
        })
        .where(eq(ruang.id, Number(id)))
        .returning()

    if (!updated) throwError('Ruangan tidak ditemukan', 404)

    return updated
}

// Menghapus Ruangan (Khusus staff)
export const deleteRuang = async (id) => {
    const [deleted] = await db
        .delete(ruang)
        .where(eq(ruang.id, Number(id)))
        .returning()

    if (!deleted) throwError('Ruangan tidak ditemukan', 404)

    return deleted
}
