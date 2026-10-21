import * as kelasService from './kelas.service.js'

export const getKelasList = async (req, res, next) => {
    try {
        const data = await kelasService.getAllKelas()
        res.status(200).json({ success: true, data })
    } catch (error) {
        next(error)
    }
}

export const getKelasById = async (req, res, next) => {
    try {
        const data = await kelasService.getKelasById(req.params.id)
        res.status(200).json({ success: true, data })
    } catch (error) {
        next(error)
    }
}

export const createKelas = async (req, res, next) => {
    try {
        const data = await kelasService.createKelas(req.body)
        res.status(201).json({ success: true, data })
    } catch (error) {
        next(error)
    }
}

export const updateKelas = async (req, res, next) => {
    try {
        const data = await kelasService.updateKelas(req.params.id, req.body)
        res.status(200).json({ success: true, data })
    } catch (error) {
        next(error)
    }
}

export const deleteKelas = async (req, res, next) => {
    try {
        await kelasService.deleteKelas(req.params.id)
        res.status(200).json({ success: true, message: 'Kelas berhasil dihapus' })
    } catch (error) {
        next(error)
    }
}
