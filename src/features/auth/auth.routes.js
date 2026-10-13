import { Router } from 'express';
import * as authController from './auth.controller.js'
import { authenticateToken, authorizeRole, guestOnly } from '../../middlewares/auth.middleware.js';
import { loginSchema, registerSchema, validate } from '../../middlewares/validate.middleware.js';

const router = Router()

/**
 * @route   POST /api/auth/register
 * @desc    Registrasi pengguna baru (Mahasiswa / Dosen / Staff)
 * @access  Private(STAFF)
*/
router.post(
    '/register',
    authenticateToken,
    authorizeRole('STAFF'),
    validate(registerSchema),
    authController.register)

/**
 * @route   POST /api/auth/login
 * @desc    Login pengguna & dapatkan JWT Token
 * @access  Public
 */
router.post(
    '/login',
    guestOnly,
    validate(loginSchema),
    authController.login)

/**
 * @route   POST /api/auth/logout
 * @desc    Logout pengguna & hapus token JWT dari HttpOnly Cookie
 * @access  Private / Protected
 */
router.post(
    '/logout',
    authenticateToken,
    authController.logout)

export default router