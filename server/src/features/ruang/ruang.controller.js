import * as ruangService from "../ruang/ruang.service.js";


//Handler : ambil semua data ruangan
export const getRuangList = async (req, res, next) => {
    try {
        const data = await ruangService.getAllRuang()
        res.status(200).json({
            success: true,
            message: 'Berhasil mengambil data ruangan',
            data
        })
    } catch (error) {
        next(error)
    }
}

// Handler : menambah ruangan baru
export const createRuang = async (req, res, next) => {
    try {
        const { kode_ruang, nama_ruang, lantai, status_ruang } = req.body

        //validasi field wajib isi
        if (!kode_ruang || !nama_ruang || !lantai === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Semua data wajib diisi'
            })
        }

        const data = await ruangService.createRuang({
            kode_ruang,
            nama_ruang,
            lantai,
            status_ruang
        })

        res.status(201).json({
            success: true,
            message: 'Data berhasil ditambahkan',
            data
        })
    } catch (error) {
        next(error)
    }
}

// Handler : Update data ruang
export const updateRuang = async (req, res, next) => {
    try {
        const { id } = req.params
        const updated = await ruangService.updateRuang(id, req.body)

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Ruangan tidak ditemukan'
            })
        }

        res.status(200).json({
            success: true,
            message: 'Ruangan berhasil diperbarui',
            data: updated
        })
    } catch (error) {
        next(error)
    }
}

// Handler : delete ruangan
export const deleteRuangan = async (req, res, next) => {
    try {
        const { id } = req.params
        const deleted = await ruangService.deleteRuang(id)

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'ruangan tidak ditemukan'
            })
        }

        res.status(200).json({
            success: true,
            message: 'ruangan berhasil dihapus',
        })
    } catch (error) {
        next(error)
    }
}