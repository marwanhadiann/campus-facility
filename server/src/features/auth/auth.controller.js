import * as authService from "./auth.service.js";

// Konfigurasi Keamanan
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
}

// handler register
export const register = async (req, res, next) => {
    try {
        const { nomor_induk, nama, email, password, role } = req.body

        // validasi input data
        if (!nomor_induk || !nama || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Semua data wajib diisi'
            })
        }

        const newUser = await authService.registerUser({
            nomor_induk,
            nama,
            email,
            password,
            role,
        })

        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil',
            data: newUser
        })
    } catch (error) {
        next(error)
    }
}

// Handler Login
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email dan Password wajib diisi!'
            })
        }

        const { user, token } = await authService.loginUser(email, password)
        res.cookie('token', token, COOKIE_OPTIONS)

        res.json({
            success: true,
            message: 'Berhasil Login',
            data: user
        })
    } catch (error) {
        next(error)
    }
}

// Handler Logout untuk menghapus cookie
export const logout = (req, res, next) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
        })

        return res.status(200).json({
            success: true,
            message: 'Berhasil Logout'
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Gagal Logout',
            error: error.message
        })
    }
}