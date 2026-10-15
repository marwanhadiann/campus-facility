import * as uploadService from './upload.service.js'

export const uploadFoto = async (req, res, next) => {
    try {
        const data = uploadService.processUploadFoto(req.file)

        res.status(200).json({
            success: true,
            message: 'Berkas foto berhasil diunggah',
            data
        })
    } catch (error) {
        next(error)
    }
}