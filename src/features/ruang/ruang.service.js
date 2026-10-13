import { desc, eq } from "drizzle-orm"
import { db } from "../../db/index.js"
import { ruang } from "../../db/schema.js"
import { throwError } from "../../utils/error.utils.js"

// Mengambil data semua ruang
export const getAllRuang = async () => {
    return await db
        .select()
        .from(ruang)
        .orderBy(desc(ruang.updated_at))
}

// Mengambil data ruang berdasarkan id
export const getRuangById = async (id) => {
    const [data] = await db
        .select()
        .from(ruang)
        .where(eq(ruang.id, Number(id)))

    if (!data) throwError('Ruangan tidak ditemukan', 404)
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