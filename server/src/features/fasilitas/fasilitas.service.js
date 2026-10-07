import { eq } from "drizzle-orm"
import { db } from "../../db/index.js"
import { fasilitasRuang, ruang } from "../../db/schema.js"

// Mengambil daftar fasilitas berdasarkan id ruangan
export const getFasilitasByRuangId = async (ruangId) => {
    // pengecekan id ruangan ke database
    const [existingRuang] = await db
        .select()
        .from(ruang)
        .where(eq(ruang.id, Number(ruangId)))

    //jika tidak ada kembalikan null
    if (!existingRuang) return null

    // jika id ruagan yang dicari ada ambil data fasilitas nya
    const fasilitas = await db
        .select()
        .from(fasilitasRuang)
        .where(eq(fasilitasRuang.ruang_id, Number(ruangId)))

    return fasilitas
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