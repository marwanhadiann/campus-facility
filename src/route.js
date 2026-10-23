import { Router } from 'express';
import authRoutes from './features/auth/auth.routes.js';
import ruangRoutes from './features/ruang/ruang.routes.js'
import fasilitasRoutes from './features/fasilitas/fasilitas.routes.js'
import kelasRoutes from './features/kelas/kelas.routes.js'
import jadwalRoutes from './features/jadwal/jadwal.routes.js'
import pengajuanJadwalRoutes from './features/pengajuan-jadwal/pengajuan-jadwal.routes.js';
import pengaduanRoutes from './features/pengaduan/pengaduan.routes.js'
import uploadRoutes from './features/upload/upload.routes.js'
import userRoutes from './features/user/user.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/ruang', ruangRoutes)
router.use('/fasilitas', fasilitasRoutes)
router.use('/kelas', kelasRoutes)
router.use('/jadwal', jadwalRoutes)
router.use('/pengajuan-jadwal', pengajuanJadwalRoutes)
router.use('/pengaduan', pengaduanRoutes)
router.use('/upload', uploadRoutes)
router.use('/users', userRoutes)

export default router
