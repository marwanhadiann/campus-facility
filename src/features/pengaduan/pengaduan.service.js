import { and, desc, eq, inArray } from "drizzle-orm"
import { fasilitasRuang, pengaduan, ruang } from "../../db/schema.js"
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

// Ambil seluruh pengaduan milik pelapor
export const getMyPengaduan = async (userId) => {
    return await db
        .select({
            id: pengaduan.id,
            judul: pengaduan.judul,
            deskripsi: pengaduan.deskripsi,
            foto_url: pengaduan.foto_url,
            status: pengaduan.status,
            prioritas: pengaduan.prioritas,
            catatan_staff: pengaduan.catatan_staff,
            created_at: pengaduan.created_at,
            updated_at: pengaduan.updated_at,
            nama_ruang: ruang.nama_ruang,
            nama_fasilitas: fasilitasRuang.nama_fasilitas
        })
        .from(pengaduan)
        .innerJoin(fasilitasRuang, eq(pengaduan.fasilitas_ruang_id, fasilitasRuang.id))
        .innerJoin(ruang, eq(fasilitasRuang.ruang_id, ruang.id))
        .where(eq(pengaduan.mahasiswa_id, Number(userId)))
        .orderBy(desc(pengaduan.created_at))
}

// Ambil data pengaduan detail berdasarkan ID
export const getPengaduanDetail = async (id, user) => {
    const [report] = await db
        .select({
            id: pengaduan.id,
            judul: pengaduan.judul,
            deskripsi: pengaduan.deskripsi,
            foto_url: pengaduan.foto_url,
            status: pengaduan.status,
            prioritas: pengaduan.prioritas,
            catatan_staff: pengaduan.catatan_staff,
            created_at: pengaduan.created_at,
            updated_at: pengaduan.updated_at,
            mahasiswa_id: pengaduan.mahasiswa_id,
            nama_ruang: ruang.nama_ruang,
            nama_fasilitas: fasilitasRuang.nama_fasilitas
        })
        .from(pengaduan)
        .innerJoin(fasilitasRuang, eq(pengaduan.fasilitas_ruang_id, fasilitasRuang.id))
        .innerJoin(ruang, eq(fasilitasRuang.ruang_id, ruang.id))
        .where(eq(pengaduan.id, Number(id)))

    if (!report) throwError('Data pengaduan tidak ditemukan', 404)

    // Mahasiswa/Dosen hanya boleh melihat laporan miliknya sendiri
    if (user.role !== 'STAFF' && report.mahasiswa_id !== user.id)
        throwError('Akses ditolak, anda tidak memiliki akses untuk melihat laporan ini', 403)

    return report
}