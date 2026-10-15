import { Router } from "express";
import { authenticateToken, authorizeRole } from "../../middlewares/auth.middleware.js";
import { createPengaduanSchema, updatePengaduanSchema, validate } from "../../middlewares/validate.middleware.js";
import * as pengaduanController from './pengaduan.controller.js'

const router = Router()

router.use(authenticateToken)

/**
 * @route   POST /api/pengaduan
 * @desc    Membuat pengaduan kerusakan fasilitas baru
 * @access  Private (Khusus Mahasiswa & Dosen)
 */
router.post(
    '/',
    authorizeRole('MAHASISWA', 'DOSEN'),
    validate(createPengaduanSchema),
    pengaduanController.createPengaduan
)

/**
 * @route   GET /api/pengaduan/riwayat
 * @desc    Menampilkan riwayat perbaikan fasilitas yang telah selesai (RESOLVED)
 * @access  Private (Seluruh User Terautentikasi)
 */
router.get(
    '/riwayat',
    pengaduanController.getRiwayat
)

/**
 * @route   PATCH /api/pengaduan/:id/status
 * @desc    Memperbarui status perbaikan pengaduan & otomasi kondisi fasilitas
 * @access  Private (Khusus Staff)
 */
router.patch(
    '/:id/status',
    authorizeRole('STAFF'),
    validate(updatePengaduanSchema),
    pengaduanController.updateStatus
)

export default router