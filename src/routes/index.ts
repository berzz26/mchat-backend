import { appendFile } from "fs"
import authRoutes from "./auth.routes.js"
import roomRoutes from "./room.route.js"
import { Router } from 'express'

const router = Router()

router.use('/auth', authRoutes);
router.use('/room', roomRoutes);

export default router