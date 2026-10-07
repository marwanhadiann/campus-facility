import { Router } from "express";
import { authenticateToken, authorizeRole } from "../../middlewares/auth.middleware.js";
import * as ruangController from "./ruang.controller.js";

const router = Router();

//semua rute dibawah wajib memiliki token jwt yg valid
router.use(authenticateToken)

/**
 * @route   GET /api/ruang
 * @desc    Mendapatkan daftar seluruh ruang
 * @access  Public (Mahasiswa, Dosen, Staff)
 */
router.get('/', ruangController.getRuangList)

/**
 * @route   POST /api/ruang
 * @desc    Menambahkan data ruang baru
 * @access  Private (Khusus Staff)
 */
router.post('/', authorizeRole('STAFF'), ruangController.createRuang)

/**
 * @route   PUT /api/ruang/:id
 * @desc    Memperbarui data ruang berdasarkan ID
 * @access  Private (Khusus Staff)
 */
router.put('/:id', authorizeRole('STAFF'), ruangController.updateRuang)

/**
 * @route   DELETE /api/ruang/:id
 * @desc    Menghapus data ruang berdasarkan ID
 * @access  Private (Khusus Staff)
 */
router.delete('/:id', authorizeRole('STAFF'), ruangController.deleteRuangan)

export default router