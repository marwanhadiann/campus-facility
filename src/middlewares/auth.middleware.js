import { verifyToken } from "../utils/jwt.js"

// Middleware memeriksa token jwt khusus rout terproteksi wajib login
export const authenticateToken = (req, res, next) => {
    const token = req.cookies?.token
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Token tidak ditemukan'
        })
    }

    try {
        const decoded = verifyToken(token)
        req.user = decoded
        next()
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Token tidak valid'
        })
    }
}

//Middleware untuk validasi login (khusus rute regist dan login, wajib belum login)
export const guestOnly = (req, res, next) => {
    const token = req.cookies?.token

    if (token) {
        try {
            return res.status(400).json({
                success: false,
                message: 'Anda sudah login'
            })
        } catch (error) {
            // jika cookie token sudah tidak valid/kadaluwarsa maka boleh login
            next()
        }
    } else {
        //jika tidak ada cookie token, maka boleh login
        next()
    }
}

// Middleware memeriksa hak akses
export const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(400).json({
                success: false,
                message: 'Akses ditolak, Anda tidak memiliki akses untuk melakukan tindakan ini'
            })
        }
        next()
    }
}