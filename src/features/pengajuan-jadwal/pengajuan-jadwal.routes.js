import { Router } from 'express';
import * as pengajuanController from './pengajuan-jadwal.controller.js';
import { authenticateToken, authorizeRole } from '../../middlewares/auth.middleware.js';
import { validate, createPengajuanSchema, evaluatePengajuanSchema, idParamSchema, getPengajuanListQuerySchema } from '../../middlewares/validate.middleware.js';

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
 * @desc    Melihat daftar seluruh pengajuan perubahan jadwal (dengan server-side pagination)
 * @access  Private (DOSEN, STAFF)
 * @query   page, limit, status (PENDING|APPROVED|REJECTED), search (nama dosen)
 */
router.get(
    '/',
    authorizeRole('DOSEN', 'STAFF', 'MAHASISWA'),
    validate(getPengajuanListQuerySchema),
    pengajuanController.getPengajuanList);

/**
 * @route   GET /api/pengajuan-jadwal/:id
 * @desc    Melihat detail tracking pengajuan perubahan jadwal spesifik
 * @access  Private (DOSEN, STAFF)
 */
router.get(
    '/:id',
    authorizeRole('DOSEN', 'STAFF'),
    validate(idParamSchema),
    pengajuanController.getPengajuanDetail
)

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