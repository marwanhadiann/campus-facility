import { throwError } from "../../utils/error.utils.js"


// Memproses berkas yang diunggah dan menghasilkan relative path
export const processUploadFoto = (file) => {
    if (!file) {
        throwError('Berkas foto wajib diunggah', 400)
    }

    return {
        url: `/uploads/${file.filename}`
    }
}