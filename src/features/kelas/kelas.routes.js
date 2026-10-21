import { Router } from 'express'
import { authenticateToken, authorizeRole } from '../../middlewares/auth.middleware.js'
import * as kelasController from './kelas.controller.js'
import { createKelasSchema, idParamSchema, updateKelasSchema, validate } from '../../middlewares/validate.middleware.js'

const router = Router()

router.use(authenticateToken)

router.get('/', kelasController.getKelasList)
router.get('/:id', validate(idParamSchema), kelasController.getKelasById)
router.post('/', authorizeRole('STAFF'), validate(createKelasSchema), kelasController.createKelas)
router.put('/:id', authorizeRole('STAFF'), validate(updateKelasSchema), kelasController.updateKelas)
router.delete('/:id', authorizeRole('STAFF'), validate(idParamSchema), kelasController.deleteKelas)

export default router
