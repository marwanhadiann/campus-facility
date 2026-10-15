import { Router } from "express";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { uploadFoto as uploadFotoMiddleware } from "../../middlewares/upload.middleware.js";
import * as uploadController from './upload.controller.js'

const router = Router()

router.use(authenticateToken)


router.post(
    '/',
    uploadFotoMiddleware,
    uploadController.uploadFoto
)

export default router