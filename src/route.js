import { Router } from 'express';
import authRoutes from './features/auth/auth.routes.js';
import ruangRoutes from './features/ruang/ruang.routes.js'
import fasilitasRoutes from './features/fasilitas/fasilitas.routes.js'
import jadwalRoutes from './features/jadwal/jadwal.routes.js'
import pengajuanJadwalRoutes from './features/pengajuan-jadwal/pengajuan-jadwal.routes.js';

const router = Router()

router.use('/auth', authRoutes)
router.use('/ruang', ruangRoutes)
router.use('/fasilitas', fasilitasRoutes)
router.use('/jadwal', jadwalRoutes)
router.use('/pengajuan-jadwal', pengajuanJadwalRoutes)

export default router