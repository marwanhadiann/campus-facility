import * as fasilitasService from './fasilitas.service.js'

// Mengambil fasilitas berdasarkan ruangan
export const getFasilitasByRuang = async (req, res, next) => {
    try {
        const { ruangId } = req.params
        const data = await fasilitasService.getFasilitasByRuangId(ruangId, req.user)

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
        const data = await fasilitasService.createFasilitas(req.body)

        res.status(201).json({
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
        await fasilitasService.deleteFasilitas(id)

        res.status(200).json({
            success: true,
            message: 'Fasilitas berhasil dihapus',
        })
    } catch (error) {
        next(error)
    }
}
