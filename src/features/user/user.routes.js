import { Router } from "express";
import { authenticateToken, authorizeRole } from "../../middlewares/auth.middleware.js";
import * as userController from './user.controller.js';
import { getUsersQuerySchema, idParamSchema, updateUserSchema, validate } from "../../middlewares/validate.middleware.js";

const router = Router();

// Semua rute di bawah wajib login
router.use(authenticateToken);

/**
 * @route   GET /api/users
 * @desc    Mendapatkan daftar pengguna berdasarkan filter (role, search)
 * @access  Private (Khusus Staff)
 */
router.get(
    '/',
    authorizeRole('STAFF'),
    validate(getUsersQuerySchema),
    userController.getUsers
);

/**
 * @route   GET /api/users/:id
 * @desc    Mendapatkan detail spesifik satu pengguna
 * @access  Private (Khusus Staff)
 */
router.get(
    '/:id',
    authorizeRole('STAFF'),
    validate(idParamSchema),
    userController.getUserById
);

/**
 * @route   PUT /api/users/:id
 * @desc    Mengubah data pengguna (nama, email, role, kelas)
 * @access  Private (Khusus Staff)
 */
router.put(
    '/:id',
    authorizeRole('STAFF'),
    validate(updateUserSchema),
    userController.updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Menghapus akun pengguna dari sistem
 * @access  Private (Khusus Staff)
 */
router.delete(
    '/:id',
    authorizeRole('STAFF'),
    validate(idParamSchema),
    userController.deleteUser
);

export default router;