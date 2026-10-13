import { Router } from 'express';
import * as pengajuanController from './pengajuan-jadwal.controller.js';
import { authenticateToken, authorizeRole } from '../../middlewares/auth.middleware.js';
import { validate, createPengajuanSchema, evaluatePengajuanSchema } from '../../middlewares/validate.middleware.js';

const router = Router();

// Menerapkan autentikasi token global untuk seluruh endpoint di router ini
router.use(authenticateToken);

/**
 * @route   POST /api/pengajuan-jadwal
 * @desc    Mengajukan perubahan atau penggantian jadwal perkuliahan baru
 * @access  Private (DOSEN)
 */
router.post(
    '/',
    authorizeRole('DOSEN'),
    validate(createPengajuanSchema),
    pengajuanController.createPengajuan);

/**
 * @route   GET /api/pengajuan-jadwal
 * @desc    Melihat daftar seluruh pengajuan perubahan jadwal
 * @access  Private (DOSEN, STAFF)
 */
router.get(
    '/',
    authorizeRole('DOSEN', 'STAFF'),
    pengajuanController.getPengajuanList);

/**
 * @route   PATCH /api/pengajuan-jadwal/:id/approval
 * @desc    Mengevaluasi, menyetujui, atau menolak pengajuan perubahan jadwal
 * @access  Private (STAFF)
 */
router.patch(
    '/:id/approval',
    authorizeRole('STAFF'),
    validate(evaluatePengajuanSchema),
    pengajuanController.evaluatePengajuan);

export default router;