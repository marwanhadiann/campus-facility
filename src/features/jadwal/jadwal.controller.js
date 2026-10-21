import * as jadwalService from './jadwal.service.js'

// Handler: Menambahkan matkul (Khusus staff)
export const createMataKuliah = async (req, res, next) => {
    try {
        const data = await jadwalService.createMataKuliah(req.body)
        res.status(201).json({
            success: true,
            message: 'Mata Kuliah berhasil ditambahkan!',
            data
        })
    } catch (error) {
        next(error)
    }
}

// Handler: Menambahkan jadwal (khusus staff)
export const createJadwal = async (req, res, next) => {
    try {
        const data = await jadwalService.createJadwal(req.body)

        res.status(201).json({
            success: true,
            message: 'Jadwal perkuliahan berhasil ditambahkan',
            data
        })
    } catch (error) {
        next(error)
    }
}

export const getJadwalOptions = async (req, res, next) => {
    try {
        const data = await jadwalService.getJadwalOptions()
        res.status(200).json({ success: true, data })
    } catch (error) {
        next(error)
    }
}

// Handler : Pencarian dan filter jadwal harian
export const getJadwal = async (req, res, next) => {
    try {
        const data = await jadwalService.getJadwalFiltered(req.query)

        res.status(200).json({
            success: true,
            message: 'Berhasil mengambil data jadwal perkuliahan',
            data
        })
    } catch (error) {
        next(error)
    }
}
