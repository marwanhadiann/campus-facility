import { z } from 'zod';

export const errorHandler = (err, req, res, next) => {
    // 1. Log error mentah di terminal server untuk kebutuhan debugging internal
    console.error('🔥 [SERVER ERROR]:', err);

    // Menangkap ZodError jika sewaktu-waktu terlempar ke errorHandler
    if (err instanceof z.ZodError || err?.name === 'ZodError') {
        const issues = err.issues || err.errors || [];
        return res.status(400).json({
            success: false,
            message: 'Validasi data gagal',
            errors: issues.map((e) => ({
                field: e.path.filter((p) => p !== 'body' && p !== 'query' && p !== 'params').join('.') || 'general',
                message: e.message,
            })),
        });
    }

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Terjadi kesalahan pada server';

    // PERBAIKAN UTAMA: Ambil PG Code dari err.code atau err.cause.code milik Drizzle ORM
    const pgCode = err.code || err.cause?.code

    // 2. Kode Error Postgres 23505 (Unique Constraint Violation)
    // Contoh: Email / Nomor Induk / Kode Ruang / Kode MK sudah ada
    if (pgCode === '23505') {
        statusCode = 400;
        message = 'Data sudah terdaftar dalam sistem (terjadi duplikasi)';
    }

    // 3. Kode Error Postgres 23503 (Foreign Key Violation)
    // Contoh: ruang_id, dosen_id, atau mata_kuliah_id tidak ada di database
    else if (pgCode === '23503') {
        statusCode = 400;
        message = 'Data relasi (seperti ID Dosen, Ruang, atau Mata Kuliah) tidak ditemukan di database';
    }

    // 4. Kode Error Postgres 22P02 (Invalid Text Representation / Enum Mismatch)
    else if (pgCode === '22P02') {
        statusCode = 400;
        message = 'Format data atau nilai pilihan yang dikirim tidak sesuai';
    }

    // 5. Sanitasi Utama: Blokir semua teks error SQL/Drizzle mentah dari client
    else if (statusCode === 500 && message.includes('Failed query:')) {
        statusCode = 500;
        message = 'Terjadi kesalahan pemrosesan data pada database';
    }

    res.status(statusCode).json({
        success: false,
        message,
    });
};