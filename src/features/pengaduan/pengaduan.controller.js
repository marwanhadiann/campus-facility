import { success } from 'zod';
import * as pengaduanService from './pengaduan.service.js';

// Handler: Mahasiswa/Dosen membuat pengaduan kerusakan fasilitas
export const createPengaduan = async (req, res, next) => {
    try {
        const pelaporId = req.user.id;

        const data = await pengaduanService.createPengaduan({
            ...req.body,
            pelapor_id: pelaporId,
        });

        res.status(201).json({
            success: true,
            message: 'Pengaduan kerusakan berhasil dibuat',
            data,
        });
    } catch (error) {
        next(error);
    }
};

// Handler: Staff memperbarui status perbaikan pengaduan
export const updateStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const staffId = req.user.id;

        const updated = await pengaduanService.updateStatusPengaduan(id, {
            ...req.body,
            staff_id: staffId,
        });

        res.status(200).json({
            success: true,
            message: `Status pengaduan berhasil diperbarui menjadi ${req.body.status}`,
            data: updated,
        });
    } catch (error) {
        next(error);
    }
};

// Handler: Ambil riwayat perbaikan fasilitas yang telah selesai
export const getRiwayat = async (req, res, next) => {
    try {
        const data = await pengaduanService.getRiwayatPerbaikan();

        res.status(200).json({
            success: true,
            message: 'Berhasil mengambil riwayat perbaikan fasilitas',
            data,
        });
    } catch (error) {
        next(error);
    }
};

// Handler: Ambil daftar pengaduan milik user yang sedang login
export const getMyPengaduan = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const data = await pengaduanService.getMyPengaduan(userId)

        res.status(200).json({
            success: true,
            message: 'Berhasil mengambil data pengaduan anda',
            data
        })
    } catch (error) {
        next(error)
    }
}

// Handler: Ambil detail tracking pengaduan spesifik
export const getPengaduanDetail = async (req, res, next) => {
    try {
        const { id } = req.params
        const data = await pengaduanService.getPengaduanDetail(id, req.user)

        res.status(200).json({
            success: true,
            message: 'Berhasil mengambil detail tracking pengaduan',
            data
        })
    } catch (error) {
        next(error)
    }
}