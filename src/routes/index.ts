import { appendFile } from "fs";
import authRoutes from "./auth.routes.js";
import roomRoutes from "./room.route.js";
import { Router } from "express";
import { authLimiter } from "../middlewares/rateLimitter.js";
const router = Router();

router.use("/auth", authLimiter, authRoutes);
router.use("/room", roomRoutes);

export default router;
