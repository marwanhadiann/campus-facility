import { and, desc, eq, inArray } from "drizzle-orm"
import { fasilitasRuang, pengaduan } from "../../db/schema.js"
import { throwError } from "../../utils/error.utils.js"
import { db } from "../../db/index.js"


// 1. Endpoint POST /pengaduan (Mahasiswa/Dosen)
export const createPengaduan = async (payload) => {
    const { fasilitas_ruang_id, pelapor_id, judul, deskripsi, foto_url, prioritas } = payload


    // Validasi Keberadaan Fasilitas Ruang di Database
    const existingFasilitas = await db
        .select()
        .from(fasilitasRuang)
        .where(eq(fasilitasRuang.id, Number(fasilitas_ruang_id)));

    if (existingFasilitas.length === 0) {
        throwError('Data fasilitas ruang tidak ditemukan', 404);
    }

    // Validasi cek duplikasi laporan aktif
    const activeReport = await db
        .select()
        .from(pengaduan)
        .where(
            and(
                eq(pengaduan.fasilitas_ruang_id, Number(fasilitas_ruang_id)),
                inArray(pengaduan.status, ['OPEN', 'IN_PROGRESS', 'VERIFIED'])
            )
        )
    if (activeReport > 0) {
        throwError('Fasilitas pada ruangan ini sedang dalam laporan kerusakan aktif yang diproses', 400)
    }

    const [newPengaduan] = await db
        .insert(pengaduan)
        .values({
            fasilitas_ruang_id: Number(fasilitas_ruang_id),
            mahasiswa_id: Number(pelapor_id),
            judul,
            deskripsi,
            foto_url,
            prioritas: prioritas || 'MEDIUM',
            status: 'OPEN'
        })
        .returning()

    return newPengaduan
}


// Endpoint PATCH /pengaduan/{id}/status (Staff)
export const updateStatusPengaduan = async (id, payload) => {
    const { status, catatan_staff, staff_id } = payload

    if (status === 'RESOLVED' && (!catatan_staff || catatan_staff.trim() === '')) {
        throwError('Catatan penjelasan teknis dari staff wajib diisi saat menyelesaikan laporan (RESOLVED)', 400)
    }

    const currentReport = await db
        .select()
        .from(pengaduan)
        .where(eq(pengaduan.id, Number(id)))

    if (currentReport.length === 0) {
        throwError('Data pengaduan tidak ditemukan', 404)
    }

    const [updatePengaduan] = await db
        .update(pengaduan)
        .set({
            status,
            catatan_staff: catatan_staff || currentReport[0].catatan_staff,
            staff_id: Number(staff_id)
        })
        .where(eq(pengaduan.id, Number(id)))
        .returning()

    //Mengembalikan kondisi fasilitas ke NORMAL jika status RESOLVED
    if (status === 'RESOLVED') {
        await db
            .update(fasilitasRuang)
            .set({
                kondisi: 'NORMAL',
            })
            .where(eq(fasilitasRuang.id, updatePengaduan.fasilitas_ruang_id))
    }
    return updatePengaduan
}

// Historical Tracking / Riwayat Perbaikan
export const getRiwayatPerbaikan = async () => {
    return await db
        .select()
        .from(pengaduan)
        .where(eq(pengaduan.status, 'RESOLVED'))
        .orderBy(desc(pengaduan.updated_at))
}