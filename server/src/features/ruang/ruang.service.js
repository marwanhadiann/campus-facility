import { eq } from "drizzle-orm"
import { db } from "../../db/index.js"
import { ruang } from "../../db/schema.js"

// Mengambil data semua ruang
export const getAllRuang = async () => {
    return await db
        .select()
        .from(ruang)
}

// Mengambil data ruang berdasarkan id
export const getRuangById = async () => {
    const [data] = await db
        .select()
        .from(ruang)
        .where(eq(ruang.id, Number(id)))
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

    return updated
}

// Menghapus Ruangan (Khusus staff)
export const deleteRuang = async (id) => {
    const [deleted] = await db
        .delete(ruang)
        .where(eq(ruang.id, Number(id)))
        .returning()

    return deleted
}