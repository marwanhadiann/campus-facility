import fs from 'fs'
import multer from 'multer'
import path from 'path'
import { success } from 'zod'

// Memastikan direktori 'uploads/' otomatis dibuat jika belum ada
const uploadDir = 'uploads/'
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

// Konfigurasi penyimpanan file ke disk
const storage = multer.diskStorage({
    destination: (req, res, cb) => {
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        const ext = path.extname(file.originalname)
        cb(null, `foto-${uniqueSuffix}${ext}`)
    }
})

// Memfilter agar hanya menerima file gambar
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true)
    } else {
        cb(new Error('File yang diunggah harus berupa gambar (JPG/JPEG/PNG)'), false)
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 //Batas maksimal 5 mb
    }
})

// Middleware wrapper untuk penanganan error upload yang terisolasi

export const uploadFoto = (req, res, next) => {
    const uploadSingle = upload.single('foto')

    uploadSingle(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'Ukuran berkas terlalu besar, maksimal 5mb'
                })
            }
            return res.status(400).json({
                success: false,
                message: err.message
            })
        } else if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            })
        }
        next()
    })
}