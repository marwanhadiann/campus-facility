import { z } from 'zod';

// Middleware Generator Validasi
export const validate = (schema) => (req, res, next) => {
    try {
        const parsed = schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });

        // Menimpa req dengan data yang sudah bersih dari field terlarang (Mass Assignment protection)
        if (parsed.body) req.body = parsed.body;
        if (parsed.params) Object.assign(req.params, parsed.params);
        if (parsed.query) req.query = parsed.query;
        next();
    } catch (error) {
        if (error instanceof z.ZodError || error?.name === 'ZodError') {
            const issues = error.issues || error.errors || [];
            return res.status(400).json({
                success: false,
                message: 'Validasi data gagal',
                errors: issues.map((e) => ({
                    field: e.path.filter((p) => p !== 'body' && p !== 'query' && p !== 'params').join('.') || 'general',
                    message: e.message,
                })),
            });
        }
        next(error);
    }
};

// =========================================
// 1. COMMON / GENERAL SCHEMAS
// =========================================
export const idParamSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, 'ID pada URL harus berupa angka').transform(Number),
    }),
});

// =========================================
// 2. AUTH SCHEMAS
// =========================================
export const registerSchema = z.object({
    body: z.object({
        nomor_induk: z.string().min(3, 'Nomor induk minimal 3 karakter').max(20),
        nama: z.string().min(2, 'Nama minimal 2 karakter').max(100),
        email: z.string().email('Format email tidak valid'),
        password: z.string().min(8, 'Password minimal 8 karakter'),
        role: z.enum(['MAHASISWA', 'DOSEN', 'STAFF'], {
            errorMap: () => ({ message: "Role harus MAHASISWA, DOSEN, atau STAFF" }),
        }),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Format email tidak valid'),
        password: z.string().min(1, 'Password wajib diisi'),
    }),
});

// =========================================
// 3. RUANG SCHEMAS
// =========================================
export const createRuangSchema = z.object({
    body: z.object({
        kode_ruang: z.string().min(1, 'Kode ruang wajib diisi').max(10),
        nama_ruang: z.string().min(1, 'Nama ruang wajib diisi').max(50),
        lantai: z.number({ required_error: 'Lantai wajib diisi' }).int('Lantai harus angka bulat'),
        status_ruang: z.enum(['TERSEDIA', 'DALAM_PERBAIKAN', 'DIPAKAI'], {
            errorMap: () => ({ message: "Status ruang harus TERSEDIA, DALAM_PERBAIKAN, atau DIPAKAI" }),
        }).optional(),
    }),
});

export const updateRuangSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, 'ID harus berupa angka').transform(Number),
    }),
    body: z.object({
        kode_ruang: z.string().min(1).max(10).optional(),
        nama_ruang: z.string().min(1).max(50).optional(),
        lantai: z.number().int().optional(),
        status_ruang: z.enum(['TERSEDIA', 'DALAM_PERBAIKAN', 'DIPAKAI'], {
            errorMap: () => ({ message: "Status ruang harus TERSEDIA, DALAM_PERBAIKAN, atau DIPAKAI" }),
        }).optional(),
    }),
});

// =========================================
// 4. FASILITAS SCHEMAS
// =========================================
export const getFasilitasByRuangSchema = z.object({
    params: z.object({
        ruangId: z.string().regex(/^\d+$/, 'ID ruangan harus berupa angka').transform(Number),
    }),
});

export const createFasilitasSchema = z.object({
    body: z.object({
        ruang_id: z.number({ required_error: 'Ruang ID wajib diisi' }).int('Ruang ID harus angka bulat'),
        nama_fasilitas: z.string().min(1, 'Nama fasilitas wajib diisi').max(100),
        kategori: z.string().max(50).optional(),
        jumlah: z.number().int().positive('Jumlah minimal 1').optional().default(1),
        kondisi: z.enum(['NORMAL', 'RUSAK_RINGAN', 'RUSAK_BERAT'], {
            errorMap: () => ({ message: "Kondisi harus NORMAL, RUSAK_RINGAN, atau RUSAK_BERAT" }),
        }).optional(),
    }),
});

export const updateFasilitasSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, 'ID fasilitas harus berupa angka').transform(Number),
    }),
    body: z.object({
        ruang_id: z.number().int().optional(),
        nama_fasilitas: z.string().min(1).max(100).optional(),
        kategori: z.string().max(50).optional(),
        jumlah: z.number().int().positive().optional(),
        kondisi: z.enum(['NORMAL', 'RUSAK_RINGAN', 'RUSAK_BERAT']).optional(),
    }),
});

// =========================================
// 5. JADWAL SCHEMAS
// =========================================
export const createMataKuliahSchema = z.object({
    body: z.object({
        kode_mk: z.string().min(1, 'Kode MK wajib diisi').max(10),
        nama_mk: z.string().min(1, 'Nama MK wajib diisi').max(100),
        sks: z.number({ required_error: 'SKS wajib diisi' }).int().positive('SKS harus angka positif'),
    }),
});

export const createJadwalSchema = z.object({
    body: z.object({
        mata_kuliah_id: z.number({ required_error: 'Mata kuliah ID wajib diisi' }).int(),
        dosen_id: z.number({ required_error: 'Dosen ID wajib diisi' }).int(),
        ruang_id: z.number({ required_error: 'Ruang ID wajib diisi' }).int(),
        kelas: z.string().min(1, 'Kelas wajib diisi').max(10),
        hari: z.enum(['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'], {
            errorMap: () => ({ message: "Hari harus SENIN, SELASA, RABU, KAMIS, JUMAT, atau SABTU" }),
        }),
        jam_mulai: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Format jam mulai harus HH:mm'),
        jam_selesai: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Format jam selesai harus HH:mm'),
    }),
});

export const getJadwalQuerySchema = z.object({
    query: z.object({
        hari: z.enum(['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU']).optional(),
        ruang_id: z.string().regex(/^\d+$/).transform(Number).optional(),
        kelas: z.string().optional(),
        dosen_id: z.string().regex(/^\d+$/).transform(Number).optional(),
    }),
});

// =========================================
// 6. PENGAJUAN JADWAL SCHEMAS
// =========================================
export const createPengajuanSchema = z.object({
    body: z.object({
        jadwal_id: z.number({ required_error: 'Jadwal ID wajib diisi' }).int('Jadwal ID harus berupa angka bulat'),
        tanggal_baru: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal baru harus YYYY-MM-DD'),
        jam_mulai_baru: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Format jam mulai harus HH-mm'),
        jam_selesai_baru: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Format jam selesai harus HH-mm'),
        ruang_baru_id: z.number().int().optional(),
        alasan: z.string().min(1, 'Alasan wajib diisi')
    })
})

export const evaluatePengajuanSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, 'ID pengajuan harus berupa angka').transform(Number),
    }),
    body: z.object({
        status: z.enum(['APPROVED', 'REJECTED'], {
            errorMap: () => ({ message: 'Status keputusan harus berupa APPROVED atau REJECTED' }),
        }),
        catatan_staff: z.string().optional()
    })
})

// =========================================
// 7. PENGADUAN SCHEMAS
// =========================================
export const createPengaduanSchema = z.object({
    body: z.object({
        fasilitas_ruang_id: z
            .number({ required_error: 'Fasilitas Ruang ID tidak boleh kosong' })
            .int('Fasilitas Ruang ID harus berupa angka bulat'),
        judul: z
            .string({ required_error: 'Judul pengaduan wajib diisi' })
            .min(1, 'Judul Pengaduan tidak boleh kosong')
            .max(150, 'Judul maksimal 150 karakter'),
        deskripsi: z
            .string({ required_error: 'Deskripsi wajib pengaduan diisi' })
            .min(1, 'Deskripsi pengaduan tidak boleh kosong'),
        foto_url: z
            .string({ required_error: 'foto_url wajib diisi' })
            .min(1, 'foto url tidak boleh kosong'),
        prioritas: z
            .enum(['LOW', 'MEDIUM', 'HIGH'], {
                errorMap: () => ({ message: 'Prioritas harus LOW, MEDIUM, atau HIGH' })
            })
            .optional()
    })
})

export const updatePengaduanSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, 'ID Pengaduan harus berupa angka').transform(Number),
    }),
    body: z.object({
        status: z.enum(['OPEN', 'VERIFIED', 'IN_PROGRESS', 'RESOLVED'], {
            errorMap: () => ({ message: 'Status harus OPEN, VERIFIED, IN_PROGRESS, atau RESOLVED' })
        }),
        catatan_staff: z.string().optional()
    })
        .refine(
            (data) => {
                if (data.status === 'RESOLVED') {
                    return !!data.catatan_staff && data.catatan_staff.trim().length > 0
                }
                return true
            },
            {
                message: 'Catatann penjelasan teknis dari staff wajib diisi saat menyelesaikan laporan (RESOLVED)',
                path: ['catatan_staff']
            }
        )
})