import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../config/db.js";

//auth is not proper, without password. its okay as i dont want user to create a account to chat, they should be able
// to just enter the username, the roomId and chat. okay to not have particualre user profiles.

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
        .json({ success: false, message: "User does not exists" });
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
