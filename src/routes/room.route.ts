import { Router } from "express";
import { prisma } from "../config/db.js";
import type { Request, Response } from "express";

const router = Router();

router.post("/create-room", async (req: Request, res: Response) => {
    const { userId, maxUsers, name } = req.body;
    if (!userId || !name) {
        return res.status(401).json({
            success: false,
            message: "UserId or RoomName  not provided with body",
        });
    }
    try {
        const room = await prisma.room.create({
            data: {
                userId,
                name,
                ...(maxUsers ? { maxUsers } : {}), //only add if provided
            },
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

router.post("/join-room/:id", async (req: Request, res: Response) => {
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

router.get("/get-rooms", async (req: Request, res: Response) => {
    try {
        const rooms = await prisma.room.findMany();
        res.status(200).json({ success: true, message: rooms });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ sucess: false, message: "Fetch Rooms error" });
    }
});

// TODO get route by id 

export default router;
