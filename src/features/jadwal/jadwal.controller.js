import * as jadwalService from './jadwal.service.js'

// Handler: Menambahkan matkul (Khusus staff)
export const createMataKuliah = async (req, res, next) => {
    try {
        const { kode_mk, nama_mk, sks } = req.body

        if (!kode_mk || !nama_mk || !sks) {
            return res.status(400).json({
                success: false,
                message: 'Semua data wajib diisi!'
            })
        }

        const data = await jadwalService.createMataKuliah({ kode_mk, nama_mk, sks: Number(sks) })
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
        const { mata_kuliah_id, dosen_id, ruang_id, kelas, hari, jam_mulai, jam_selesai } = req.body

        if (!mata_kuliah_id || !dosen_id || !ruang_id || !kelas || !hari || !jam_mulai || !jam_selesai) {
            return res.status(400).json({
                success: false,
                message: 'Semua data wajib diisi!'
            })
        }

        const data = await jadwalService.createJadwal({
            mata_kuliah_id: Number(mata_kuliah_id),
            dosen_id: Number(dosen_id),
            ruang_id: Number(ruang_id),
            kelas,
            hari,
            jam_mulai,
            jam_selesai
        })

        res.status(201).json({
            success: true,
            message: 'Data jadwal berhasil ditambahkan',
            data
        })
    } catch (error) {
        next(error)
    }
}

// Handler : Pencarian dan filter jadwal harian
export const getJadwal = async (req, res, next) => {
    try {
        const { hari, ruang_id, kelas, dosen_id } = req.query


        const data = await jadwalService.getJadwalFiltered({
            hari,
            ruang_id,
            kelas,
            dosen_id
        })

        if (!data || data.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Data tidak ditemukan'
            })
        }
        res.status(200).json({
            success: true,
            message: 'Berhasil mengambil data jadwal perkuliahan',
            data
        })
    } catch (error) {
        next(error)
    }
}