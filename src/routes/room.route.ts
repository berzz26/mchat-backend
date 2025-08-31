import { Router } from "express";
import { prisma } from "../config/db.js";
import type { Request, Response } from "express";
import { createRoomLimiter, joinRoomLimiter, getRoomLimiter, getChatLimiter } from "../middlewares/rateLimitter.js";
const router = Router();

router.post("/create-room", createRoomLimiter, async (req: Request, res: Response) => {
  const { userId, maxUsers, name, isPublic } = req.body;
  if (!userId || !name) {
    return res.status(401).json({
      success: false,
      message: "UserId or RoomName  not provided with body",
    });
  }
  try {
    const roomData: any = {
      userId,
      name,
    };

    if (maxUsers) {
      roomData.maxUsers = maxUsers;
    }

    if (isPublic != null) {
      roomData.isPublic = isPublic;
    }

    const room = await prisma.room.create({
      data: roomData,
    });
    res.status(201).json({ success: true, message: room });
  } catch (error) {
    console.error(error);
    res.status(401).json({
      success: false,
      message: "something went wrong in roomController",
    });
  }
});

router.post("/join-room/:id", joinRoomLimiter, async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res
      .status(401)
      .json({ success: false, message: "Room ID not provided in params" });
  }
  try {
    const room = await prisma.room.findUniqueOrThrow({ where: { id } });

    //TODOS
    // implement userCount check here. fetch the current number of users in that room from redis, if currUser>=maxUsers, then no entry
    // add user to redis set so that the num of user in redis for a particular room is updated


    const limit = Math.min(Number(req.body.limit ?? 50), 200);
    const messages = await prisma.message.findMany({
      where: { roomId: id },
      orderBy: { sentAt: "desc" },
      take: limit,
      include: { User: true },
    });
    res.json({
      success: true,
      message: { room, messages: messages.reverse() },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "somehting went wrong at joinRoom" });
  }
});

router.get("/get-rooms/:userId", getRoomLimiter, async (req: Request, res: Response) => {
  const { userId } = req.params;
  if (!userId)
    return res.status(401).json({ success: false, message: "User id not provided" })
  try {
    const allRooms = await prisma.room.findMany({
      select: {
        id: true,
        name: true,
        maxUsers: true,
        createdAt: true,
        isPublic: true,
        userId: true,
        creator: {
          select: {
            username: true, // only username from creator
          },
        },
      },
    });
    const generalRooms = allRooms
      .filter((room) => room.isPublic === true)
      .map(({ userId, ...rest }) => rest); // strip userId

    const userRooms = allRooms
      .filter((room) => room.userId === userId)
      .map(({ userId, ...rest }) => rest); // strip userId

    const roomData: any = {
      generalRooms,
      userRooms

    }
    if (userRooms) {
      roomData.userRooms = userRooms
    }
    res.status(200).json({ success: true, message: roomData });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ sucess: false, message: "Fetch Rooms error" });
  }
});


router.get("/get-message/:roomId", getChatLimiter, async (req: Request, res: Response) => {
  const { roomId } = req.params;
  if (!roomId)
    return res.status(401).json({ success: false, message: 'room id not provided' })
  try {
    const messages = await prisma.message.findMany({ where: { roomId }, include: { User: true } });
    res.status(200).json({ success: true, message: messages });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ sucess: false, message: "Fetch messages error" });
  }
});

// TODO get route by id

export default router;
