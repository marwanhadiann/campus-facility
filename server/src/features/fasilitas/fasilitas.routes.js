import { Router } from "express";
import { authenticateToken, authorizeRole } from "../../middlewares/auth.middleware.js";
import * as fasilitasController from './fasilitas.controller.js'

const router = Router()

router.use(authenticateToken)

/**
 * @route   GET /fasilitas/ruang/:ruangId
 * @desc    Mendapatkan seluruh daftar fasilitas berdasarkan ID ruangan
 * @access  Public (Mahasiswa, Dosen, Staff)
 */
router.get(
    '/ruang/:ruangId',
    fasilitasController.getFasilitasByRuang)

/**
 * @route   POST /fasilitas
 * @desc    Menambahkan data fasilitas baru ke dalam ruangan
 * @access  Private (Khusus Staff)
 */
router.post(
    '/',
    authorizeRole('STAFF'),
    fasilitasController.createFasilitas)

/**
* @route   PUT /fasilitas/:id
* @desc    Mengubah data atau memperbarui kondisi fasilitas berdasarkan ID fasilitas
* @access  Private (Khusus Staff)
*/
router.put(
    '/:id',
    authorizeRole('STAFF'),
    fasilitasController.updateFasilitas)

export default router