import multer from 'multer'

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('/image')) {
        cb(null, true)
    } else {
        cb(new Error('File yang diunggah harus berupa gambar(JPG/PNG/JPEG)'), false)
    }
}

export const uploadFoto = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // Batas file maksimal 5mb
    }
})