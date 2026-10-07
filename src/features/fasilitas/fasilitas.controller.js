import * as fasilitasService from './fasilitas.service.js'

// Mengambil fasilitas berdasarkan ruangan
export const getFasilitasByRuang = async (req, res, next) => {
    try {
        const { ruangId } = req.params
        const data = await fasilitasService.getFasilitasByRuangId(ruangId)

        if (data === null) {
            return res.status(404).json({
                success: false,
                message: 'Data ruangan tidak ditemukan'
            })
        }

        res.status(200).json({
            success: true,
            message: 'Berhasil mengambil data fasilitas ruangan',
            data
        })
    } catch (error) {
        next(error)
    }
}

// Menambah fasilitas ke dalam ruangan (Khusus staff)
export const createFasilitas = async (req, res, next) => {
    try {
        const { ruang_id, nama_fasilitas, kategori, jumlah, kondisi } = req.body

        if (!ruang_id || !nama_fasilitas) {
            return res.status(400).json({
                success: false,
                message: 'Ruang id dan Nama Fasilitas wajib diisi!'
            })
        }

        const data = await fasilitasService.createFasilitas({
            ruang_id,
            nama_fasilitas,
            kategori,
            jumlah,
            kondisi
        })

        res.status(200).json({
            success: true,
            message: 'Data fasilitas berhasil ditambahkan',
            data
        })
    } catch (error) {
        next(error)
    }
}

// Update data fasilitas (Khusus staff)
export const updateFasilitas = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updated = await fasilitasService.updateFasilitas(id, req.body)

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Fasilitas tidak ditemukan'
            })
        }

        res.status(200).json({
            success: true,
            message: 'Fasilitas berhasil diperbarui',
            data: updated
        })
    } catch (error) {
        next(error)
    }
}

// Hapus fasilitas (Khusus staff)
export const deleteFasilitas = async (req, res, next) => {
    try {
        const { id } = req.params
        const deleted = await fasilitasService.deleteFasilitas(id)

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Fasilitas tidak ditemukan'
            })
        }

        res.status(200).json({
            success: true,
            message: 'Fasilitas berhasil dihapus',
        })
    } catch (error) {
        next(error)
    }
}