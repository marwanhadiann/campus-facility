import { Router } from "express";
import { authenticateToken, authorizeRole } from "../../middlewares/auth.middleware.js";
import * as jadwalController from './jadwal.controller.js'

const router = Router()

router.use(authenticateToken)

/**
 * @route   GET /api/jadwal
 * @desc    Melihat atau mencari daftar jadwal harian perkuliahan
 * @access  Private (Mahasiswa, Dosen, Staff)
 */
router.get('/', jadwalController.getJadwal)

/**
 * @route   POST /api/jadwal/mata-kuliah
 * @desc    Menambahkan data mata kuliah baru
 * @access  Private (Khusus Staff)
 */
router.post('/mata-kuliah', authorizeRole('STAFF'), jadwalController.createMataKuliah)

/**
 * @route   POST /api/jadwal
 * @desc    Menambahkan jadwal perkuliahan utama
 * @access  Private (Khusus Staff)
 */
router.post('/', authorizeRole('STAFF'), jadwalController.createJadwal)

export default router