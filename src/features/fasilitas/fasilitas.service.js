import { and, eq, inArray } from "drizzle-orm"
import { db } from "../../db/index.js"
import { fasilitasRuang, pengaduan, ruang } from "../../db/schema.js"
import { throwError } from "../../utils/error.utils.js"
import { assertRuangAccess } from '../ruang/ruang.service.js'

// Mengambil daftar fasilitas berdasarkan id ruangan
export const getFasilitasByRuangId = async (ruangId, user) => {
    // pengecekan id ruangan ke database
    const [existingRuang] = await db
        .select()
        .from(ruang)
        .where(eq(ruang.id, Number(ruangId)))

    //jika tidak ada kembalikan null
    if (!existingRuang) throwError('Data ruangan tidak ditemukan', 404)
    await assertRuangAccess(ruangId, user)

    // ambil data fasilitas
    const fasilitas = await db
        .select()
        .from(fasilitasRuang)
        .where(eq(fasilitasRuang.ruang_id, Number(ruangId)))

    if (fasilitas.length === 0) return []

    const fasilitasId = fasilitas.map(f => f.id)

    const activeReport = await db
        .select({ fasilitas_ruang_id: pengaduan.fasilitas_ruang_id })
        .from(pengaduan)
        .where(
            and(
                inArray(pengaduan.fasilitas_ruang_id, fasilitasId),
                inArray(pengaduan.status, ['OPEN', 'VERIFIED', 'IN_PROGRESS'])
            )
        )

    const activeReportId = new Set(activeReport.map(r => r.fasilitas_ruang_id))

    return fasilitas.map(f => ({
        ...f,
        is_reported: activeReportId.has(f.id)
    }))
}

// Menambahkan fasilitas ruangan (Khusus staff)
export const createFasilitas = async (payload) => {
    const { ruang_id, nama_fasilitas, kategori, jumlah, kondisi } = payload

    const [newFasilitas] = await db
        .insert(fasilitasRuang)
        .values({
            ruang_id: Number(ruang_id),
            nama_fasilitas,
            kategori,
            jumlah: jumlah ? Number(jumlah) : 1,
            kondisi: kondisi || 'NORMAL'
        })
        .returning()

    return newFasilitas
}

// Update data fasilitas (Khusus staff)
export const updateFasilitas = async (id, payload) => {
    const [updated] = await db
        .update(fasilitasRuang)
        .set({
            ...payload,
            updated_at: new Date(),
        })
        .where(eq(fasilitasRuang.id, Number(id)))
        .returning()

    if (!updated) throwError('Fasilitas tidak ditemukan', 404)

    return updated
}

// hapus data fasilitas (Khusus staff)
export const deleteFasilitas = async (id) => {
    const [deleted] = await db
        .delete(fasilitasRuang)
        .where(eq(fasilitasRuang.id, Number(id)))
        .returning()

    if (!deleted) throwError('Fasilitas tidak ditemukan', 404)

    return deleted
}
