import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../config/db.js";

const router = Router();

router.post("/signup", async (req: Request, res: Response) => {
  const { username } = req.body;
  if (!username) {
    return res
      .status(401)
      .json({ success: false, message: "username required" });
  }
  const user = await prisma.user.findFirst({ where: { username } });

  if (user) {
    return res
      .status(401)
      .json({ success: false, message: "user with username already exists" });
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
    res.status(401).json({
      success: false,
      message: "something went wrong in userController",
    });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const { username } = req.body;
  if (!username) {
    return res.status(401).json({ success: false });
  }

  try {
    const user = await prisma.user.findFirst({ where: { username } });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User deos not exists" });
    }

    res.status(202).json({ success: true, message: user });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "user controller error" });
  }
});

export default router;
