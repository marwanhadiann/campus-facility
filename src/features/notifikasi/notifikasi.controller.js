import * as notifikasiService from './notifikasi.service.js';

// Handler: Ambil Daftar Notifikasi Pengguna (dengan Pagination & Filter Unread)
export const getNotifikasiList = async (req, res, next) => {
    try {
        const { data, meta } = await notifikasiService.getNotifikasiList(req.user, req.query);

        res.status(200).json({
            success: true,
            message: 'Berhasil mengambil daftar notifikasi',
            data,
            meta,
        });
    } catch (error) {
        next(error);
    }
};

// Handler: Tandai 1 Notifikasi Spesifik Sebagai Sudah Dibaca (Read)
export const markNotifikasiAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updated = await notifikasiService.markAsRead(id, req.user);

        res.status(200).json({
            success: true,
            message: 'Notifikasi berhasil ditandai sebagai dibaca',
            data: updated,
        });
    } catch (error) {
        next(error);
    }
};

// Handler: Tandai Semua Notifikasi Pengguna Sebagai Sudah Dibaca
export const markAllNotifikasiAsRead = async (req, res, next) => {
    try {
        const result = await notifikasiService.markAllAsRead(req.user);

        res.status(200).json({
            success: true,
            message: 'Semua notifikasi berhasil ditandai sebagai dibaca',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};