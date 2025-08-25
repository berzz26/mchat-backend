import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { prisma } from "./config/db.js";
import type { WsIncoming } from "./types.js";

export const initSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: process.env.WEB_ORIGIN, credentials: true },
  });

  io.on("connection", (socket) => {
    let roomId = "";
    let userId = "";
    console.log("user connected");

    socket.on("client", async (msg: WsIncoming) => {
      console.log(msg);
      if (msg.type === "join_room") {
        roomId = msg.roomId;
        userId = msg.userId;
        const key = `room:${roomId}:users`;

        socket.join(roomId);
        io.to(roomId).emit("server", { type: "user_joined", userId });

        return;
      }

      if (msg.type === "send_message") {
        const saved = await prisma.message.create({
          data: { roomId: msg.roomId, userId: msg.userId, text: msg.text },
          include: { User: true },
        });
        console.log(saved);

        io.to(msg.roomId).emit("server", {
          type: "new_message",
          id: saved.id,
          roomId: saved.roomId,
          userId: saved.userId,
          name: saved.User.username,
          text: saved.text,
          sentAt: saved.sentAt.toISOString(),
        });
        return;
      }

      if (msg.type === "typing") {
        io.to(msg.roomId).emit("server", {
          type: "typing",
          userId: msg.userId,
          isTyping: msg.isTyping,
        });
      }
    });

    socket.on("disconnect", async () => {
      if (roomId && userId) {
        const key = `room:${roomId}:users`;
        socket.to(roomId).emit("server", { type: "user_left", userId });
      }
    });
  });

  return io;
};
