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
        const newUser = await authService.registerUser(req.body)

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

// Handler Current User
export const me = async (req, res, next) => {
    try {
        const user = await authService.getCurrentUser(req.user.id)

        res.json({
            success: true,
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
        next(error)
    }
}
