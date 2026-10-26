import * as ruangService from "./ruang.service.js";


//Handler : ambil semua data ruangan
export const getRuangList = async (req, res, next) => {
    try {
        const data = await ruangService.getAllRuang(req.user)
        res.status(200).json({
            success: true,
            message: 'Berhasil mengambil data ruangan',
            data
        })
    } catch (error) {
        next(error)
    }
}

// Handler : ambil detail ruangan berdasarkan ID
export const getRuangById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = await ruangService.getRuangById(id, req.user);

        res.status(200).json({
            success: true,
            message: 'Berhasil mengambil detail ruangan',
            data
        });
    } catch (error) {
        next(error);
    }
};

// Handler : menambah ruangan baru
export const createRuang = async (req, res, next) => {
    try {
        const data = await ruangService.createRuang(req.body)

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
        await ruangService.deleteRuang(id)

        res.status(200).json({
            success: true,
            message: 'Ruangan berhasil dihapus',
        })
    } catch (error) {
        next(error)
    }
}
