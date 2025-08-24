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
  } catch (error) {
    console.error(error);
    res
      .status(401)
      .json({
        success: false,
        message: "something went wrong in userController",
      });
  }
});

router.post("/create-room", async (req: Request, res: Response) => {
  const { userId, maxUsers } = req.body;
  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "UserId not provided with body" });
  }
  try {
    const room = await prisma.room.create({
      data: {
        userId,
        ...(maxUsers ? { maxUsers } : {}), //only add if provided
      },
    });
    res.status(201).json({ success: true, message: room });
  } catch (error) {
    console.error(error);
    res
      .status(401)
      .json({
        success: false,
        message: "something went wrong in roomController",
      });
  }
});
