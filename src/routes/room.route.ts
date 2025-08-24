import { Router } from "express";
import { prisma } from "../config/db.js";
import type { Request, Response } from "express";

const router = Router();

router.post("/create-user", async (req: Request, res: Response) => {
  const { username } = req.body;
  if (!username) {
    return res
      .status(401)
      .json({ success: false, message: "username required" });
  }
  try {
    const newUser = await prisma.user.create({
      data: {
        username,
      },
    });
    res.status(201).json({ success: true, message: newUser });
  } catch (error) {}
});
router.post("/create-room", async (req, res) => {});
