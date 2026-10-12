import * as pengajuanService from './pengajuan-jadwal.service.js';

// Handler: Dosen Mengajukan Ganti Jadwal
export const createPengajuan = async (req, res, next) => {
    try {
        const { jadwal_id, tanggal_baru, jam_mulai_baru, jam_selesai_baru, ruang_baru_id, alasan } = req.body;
        const dosenId = req.user.id; // Diambil dari token JWT Dosen

        if (!jadwal_id || !tanggal_baru || !jam_mulai_baru || !jam_selesai_baru || !alasan) {
            return res.status(400).json({
                success: false,
                message: 'Semua data wajib diisi!',
            });
        }

        const data = await pengajuanService.createPengajuan({
            jadwal_id,
            dosen_id: dosenId,
            tanggal_baru,
            jam_mulai_baru,
            jam_selesai_baru,
            ruang_baru_id,
            alasan,
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

// Handler: Ambil Daftar Pengajuan (Dosen & Staff)
export const getPengajuanList = async (req, res, next) => {
    try {
        const data = await pengajuanService.getPengajuanList(req.user);

        if (!data || data.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Data pengajuan tidak ditemukan.'
            })
        }

        res.status(200).json({
            success: true,
            message: 'Berhasil mengambil daftar pengajuan jadwal',
            data,
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

        if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status keputusan harus berupa APPROVED atau REJECTED',
            });
        }

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