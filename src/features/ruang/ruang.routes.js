import { Router } from "express";
import { authenticateToken, authorizeRole } from "../../middlewares/auth.middleware.js";
import * as ruangController from "./ruang.controller.js";
import { validate, createRuangSchema, idParamSchema, updateRuangSchema } from "../../middlewares/validate.middleware.js";

const router = Router();

//semua rute dibawah wajib memiliki token jwt yg valid
router.use(authenticateToken)

/**
 * @route   GET /api/ruang
 * @desc    Mendapatkan daftar seluruh ruang
 * @access  Public (Mahasiswa, Dosen, Staff)
 */
router.get(
    '/',
    ruangController.getRuangList)

/**
 * @route   GET /api/ruang/:id
 * @desc    Mendapatkan detail ruang berdasarkan ID
 * @access  Private (Mahasiswa, Dosen, Staff)
 */
router.get(
    '/:id',
    validate(idParamSchema),
    ruangController.getRuangById)

/**
 * @route   POST /api/ruang
 * @desc    Menambahkan data ruang baru
 * @access  Private (Khusus Staff)
 */
router.post(
    '/',
    authorizeRole('STAFF'),
    validate(createRuangSchema),
    ruangController.createRuang)

/**
 * @route   PUT /api/ruang/:id
 * @desc    Memperbarui data ruang berdasarkan ID
 * @access  Private (Khusus Staff)
 */
router.put(
    '/:id',
    authorizeRole('STAFF'),
    validate(updateRuangSchema),
    ruangController.updateRuang)

/**
 * @route   DELETE /api/ruang/:id
 * @desc    Menghapus data ruang berdasarkan ID
 * @access  Private (Khusus Staff)
 */
router.delete(
    '/:id',
    authorizeRole('STAFF'),
    validate(idParamSchema),
    ruangController.deleteRuangan)

export default router