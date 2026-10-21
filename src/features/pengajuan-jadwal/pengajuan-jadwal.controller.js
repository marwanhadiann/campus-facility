import { success } from 'zod';
import * as pengajuanService from './pengajuan-jadwal.service.js';

// Handler: Dosen Mengajukan Ganti Jadwal
export const createPengajuan = async (req, res, next) => {
    try {
        const dosenId = req.user.id; // Diambil dari token JWT Dosen

        const data = await pengajuanService.createPengajuan({
            ...req.body,
            dosen_id: dosenId
        });

        res.status(201).json({
            success: true,
            message: 'Pengajuan perubahan jadwal berhasil dikirimkan',
            data,
        });
    } catch (error) {
        next(error); // Error otomatis diteruskan ke errorHandler
    }
};

// Handler: Ambil Daftar Pengajuan (Dosen & Staff) - dengan Server-Side Pagination
export const getPengajuanList = async (req, res, next) => {
    try {
        const { data, meta } = await pengajuanService.getPengajuanList(req.user, req.query);

        res.status(200).json({
            success: true,
            message: 'Berhasil mengambil daftar pengajuan jadwal',
            data,
            meta,
        });
    } catch (error) {
        next(error);
    }
};

// Handler: Staff Memberikan Keputusan (APPROVED / REJECTED)
export const evaluatePengajuan = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, catatan_staff } = req.body;
        const staffId = req.user.id;

        const updated = await pengajuanService.evaluatePengajuan(id, staffId, {
            status,
            catatan_staff,
        });

        res.status(200).json({
            success: true,
            message: `Pengajuan jadwal berhasil diubah menjadi ${status}`,
            data: updated,
        });
    } catch (error) {
        next(error); // Menangkap error penolakan bentrok ruangan/catatan kosong
    }
};

// Handler: Ambil Detail Tracking Pengajuan Jadwal
export const getPengajuanDetail = async (req, res, next) => {
    try {
        const { id } = req.params
        const data = await pengajuanService.getPengajuanDetail(id, req.user)

        res.status(200).json({
            success: true,
            message: 'Berhasil mengambil detail tracking pengajuan jadwal',
            data
        })
    } catch (error) {
        next(error)
    }
}