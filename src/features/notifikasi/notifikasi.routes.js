import { Router } from 'express';
import * as notifikasiController from './notifikasi.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { validate, idParamSchema, getNotifikasiListQuerySchema } from '../../middlewares/validate.middleware.js';

const router = Router();

// Menerapkan autentikasi token global untuk seluruh endpoint di router ini
router.use(authenticateToken);

/**
 * @route   GET /api/notifikasi
 * @desc    Melihat daftar notifikasi milik pengguna yang sedang login
 * @access  Private (MAHASISWA, DOSEN, STAFF)
 * @query   page, limit, is_read (true|false)
 */
router.get(
    '/',
    validate(getNotifikasiListQuerySchema),
    notifikasiController.getNotifikasiList
);

/**
 * @route   PATCH /api/notifikasi/read-all
 * @desc    Menandai seluruh notifikasi milik pengguna sebagai sudah dibaca
 * @access  Private (MAHASISWA, DOSEN, STAFF)
 */
router.patch(
    '/read-all',
    notifikasiController.markAllNotifikasiAsRead
);

/**
 * @route   PATCH /api/notifikasi/:id/read
 * @desc    Menandai satu notifikasi spesifik berdasarkan ID sebagai sudah dibaca
 * @access  Private (MAHASISWA, DOSEN, STAFF)
 */
router.patch(
    '/:id/read',
    validate(idParamSchema),
    notifikasiController.markNotifikasiAsRead
);

export default router;