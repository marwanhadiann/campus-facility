import { Router } from 'express';
import authRoutes from './features/auth/auth.routes.js';
import ruangRoutes from './features/ruang/ruang.routes.js'
import fasilitasRoutes from './features/fasilitas/fasilitas.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/ruang', ruangRoutes)
router.use('/fasilitas', fasilitasRoutes)

export default router