import { desc, eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { kelas } from '../../db/schema.js'
import { throwError } from '../../utils/error.utils.js'

export const getAllKelas = () => db
    .select()
    .from(kelas)
    .orderBy(desc(kelas.updated_at))

export const getKelasById = async (id) => {
    const [data] = await db
        .select()
        .from(kelas)
        .where(eq(kelas.id, Number(id)))

    if (!data) throwError('Kelas tidak ditemukan', 404)
    return data
}

export const createKelas = async ({ nama_kelas }) => {
    const [data] = await db
        .insert(kelas)
        .values({ nama_kelas })
        .returning()

    return data
}

export const updateKelas = async (id, { nama_kelas }) => {
    const [data] = await db
        .update(kelas)
        .set({ nama_kelas, updated_at: new Date() })
        .where(eq(kelas.id, Number(id)))
        .returning()

    if (!data) throwError('Kelas tidak ditemukan', 404)
    return data
}

export const deleteKelas = async (id) => {
    const [data] = await db
        .delete(kelas)
        .where(eq(kelas.id, Number(id)))
        .returning()

    if (!data) throwError('Kelas tidak ditemukan', 404)
    return data
}
