import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { prisma } from "./config/db.js";
import type { WsIncoming } from "./types.js";
import { Socket } from "socket.io";
import { Prisma } from "@prisma/client";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";

// in-memory cache for batching db writes
const messageCache = new Map<string, Prisma.MessageCreateManyInput[]>();

interface CustomSocket extends Socket {
  data: {
    roomId?: string;
    userId?: string;
    username?: string;
  };
}

export const initSocket = async (httpServer: HttpServer) => {
  
  //create seperate redis clients for adapters
  const pubClient = createClient();
  const subClient = pubClient.duplicate();

  await Promise.all([pubClient.connect(), subClient.connect()]);

  // batch DB writer
  setInterval(async () => {
    if (messageCache.size === 0) return;

    console.log(`message cache processing for ${messageCache.size} rooms`);

    const cacheCopy = new Map(messageCache);
    messageCache.clear();

    for (const [roomId, messages] of cacheCopy.entries()) {
      if (messages.length > 0) {
        try {
          await prisma.message.createMany({ data: messages });
          console.log(`Saved ${messages.length} messages for room ${roomId}`);
        } catch (error) {
          console.error("Failed to save batch messages:", error);
        }
      }
    }
  }, 5000);

  const io = new Server(httpServer, {
    cors: { origin: "*", credentials: false },
    adapter: createAdapter(pubClient, subClient),
  });

  io.on("connection", async (socket: CustomSocket) => {
    const { userId, roomId, username } = socket.handshake.query;
    if (typeof userId !== "string" || typeof roomId !== "string" || typeof username !== "string") {
      socket.disconnect();
      return;
    }

    socket.data = { userId, roomId, username };
    socket.join(roomId);

    const roomUsersKey = `room:${roomId}:users`;
    await pubClient.sAdd(roomUsersKey, userId);

    const userCount = await pubClient.sCard(roomUsersKey);

    io.to(roomId).emit("server", { type: "user_joined", userId });
    io.to(roomId).emit("server", { type: "user_count_update", count: userCount });

    console.log(`User ${userId} joined room ${roomId}`);

    socket.on("client", async (msg: WsIncoming) => {
      if (msg.type === "send_message") {
        const sentAt = new Date();

        socket.to(msg.roomId).emit("server", {
          type: "new_message",
          id: `${Math.random()}`,
          roomId: msg.roomId,
          userId: msg.userId,
          name: socket.data.username,
          text: msg.text,
          sentAt: sentAt.toISOString(),
        });

        const messageData = {
          roomId: msg.roomId,
          userId: msg.userId,
          text: msg.text,
          sentAt,
        };

        if (!messageCache.has(msg.roomId)) {
          messageCache.set(msg.roomId, []);
        }
        messageCache.get(msg.roomId)?.push(messageData);
        return;
      }

      if (msg.type === "typing") {
        socket.to(msg.roomId).emit("server", {
          type: "typing",
          userId: msg.userId,
          username: socket.data.username,
          isTyping: msg.isTyping,
        });
      }
    });

    socket.on("disconnect", async () => {
      const { userId: dUserId, roomId: dRoomId } = socket.data;
      if (dRoomId && dUserId) {
        const roomUsersKey = `room:${dRoomId}:users`;
        await pubClient.sRem(roomUsersKey, dUserId);

        const userCount = await pubClient.sCard(roomUsersKey);

        console.log(`User ${dUserId} left room ${dRoomId}. Room now has ${userCount} users.`);

        io.to(dRoomId).emit("server", { type: "user_left", userId: dUserId });
        io.to(dRoomId).emit("server", { type: "user_count_update", count: userCount });
      }
    });
  });

  process.on("SIGINT", async () => {
    console.log("Shutting down: saving remaining messages...");
    await pubClient.quit();
    await subClient.quit();
    process.exit(0);
  });

  return io;
};
