// src/middlewares/errorHandler.js
export const errorHandler = (err, req, res, next) => {
    console.error('🔥 [SERVER ERROR]:', err);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Terjadi kesalahan pada server';

    res.status(statusCode).json({
        success: false,
        message,
    });
};