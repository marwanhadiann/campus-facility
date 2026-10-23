import * as userService from './user.service.js'

// Handler: Mengambil seluruh pengguna dengan filter
export const getUsers = async (req, res, next) => {
    try {
        const data = await userService.getUsersFiltered(req.query)

        res.status(200).json({
            success: true,
            message: 'Berhasil mengambil daftar pengguna',
            data
        })
    } catch (error) {
        next(error)
    }
}

// Handler: Mengambil detail satu pengguna berdasarkan ID
export const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params
        const data = await userService.getUserById(id)

        res.status(200).json({
            success: true,
            message: 'Berhasil mengambil detail pengguna',
            data
        })
    } catch (error) {
        next(error)
    }
}

// Handler: Update data pengguna (Khusus Staff)
export const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params
        const data = await userService.updateUser(id, req.body)

        res.status(200).json({
            success: true,
            message: 'Data pengguna berhasil diperbarui',
            data
        })
    } catch (error) {
        next(error)
    }
}

// Handler: Menghapus data pengguna (Khusus Staff)
export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params
        await userService.deleteUser(id)

        res.status(200).json({
            success: true,
            message: 'Pengguna berhasil dihapus'
        })
    } catch (error) {
        next(error)
    }
}