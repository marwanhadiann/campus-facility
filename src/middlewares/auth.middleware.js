import { verifyToken } from "../utils/jwt.js"

// Middleware memeriksa token jwt khusus rout terproteksi wajib login
export const authenticateToken = (req, res, next) => {
    const token = req.cookies?.token
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Akses ditolak, Silahkan login terlebih dahulu!'
        })
    }

    try {
        const decoded = verifyToken(token)
        req.user = decoded
        next()
    } catch (error) {
        // Hapus cookie token di browser karna sudah tidak valid
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
        })

        // Deteksi spesifik ketika token sudah expire
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Sesi login anda sudah habis. Silahkan Login ulang'
            })
        }

        // Deteksi jika token tidak valid
        return res.status(403).json({
            success: false,
            message: 'Token tidak valid. Silahkan Login ulang'
        })
    }
}

//Middleware untuk validasi login (khusus rute regist dan login, wajib belum login)
export const guestOnly = (req, res, next) => {
    const token = req.cookies?.token

    if (token) {
        try {
            // cek token masih hidup atau tidak 
            verifyToken(token)
            return res.status(400).json({
                success: false,
                message: 'Anda sudah login'
            })
        } catch (error) {
            // jika token expired verifyToken akan melempar kesini,
            // menghapus cookie usang supaya user bisa login kembali
            res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/'
            })
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
            return res.status(403).json({
                success: false,
                message: 'Akses ditolak, Anda tidak memiliki akses untuk melakukan tindakan ini'
            })
        }
        next()
    }
}