import { Router } from "express";
import { authenticateToken, authorizeRole } from "../../middlewares/auth.middleware.js";
import { createPengaduanSchema, idParamSchema, updatePengaduanSchema, validate } from "../../middlewares/validate.middleware.js";
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
 * @route   GET /api/pengaduan/me
 * @desc    Menampilkan seluruh pengaduan yang pernah dilaporkan oleh user yang sedang login
 * @access  Private (Mahasiswa & Dosen)
 */
router.get(
    '/me',
    authorizeRole('MAHASISWA', 'DOSEN'),
    pengaduanController.getMyPengaduan
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
 * @route   GET /api/pengaduan/:id
 * @desc    Menampilkan detail tracking pengaduan spesifik berdasarkan ID
 * @access  Private (Seluruh User Terautentikasi)
 */
router.get(
    '/:id',
    validate(idParamSchema),
    pengaduanController.getPengaduanDetail
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