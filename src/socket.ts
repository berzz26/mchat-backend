import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { prisma } from "./config/db.js";
import type { WsIncoming } from "./types.js";
import { Socket } from "socket.io";

//TODO: implement redis socketIo adapter to scale mutliple instances of this server 
//App cache to store data in mem and send batch queries to reduce db calls 


interface CustomSocket extends Socket {
  data: {
    roomId?: string;
    userId?: string;
  };
}

export const initSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: "*", credentials: false },
  });

  io.on("connection", (socket: CustomSocket) => {
    // Access userId and roomId directly from the query
    const { userId, roomId } = socket.handshake.query;
    let userCount = 0
    if (typeof userId === "string" && typeof roomId === "string") {
      socket.data.userId = userId;
      socket.data.roomId = roomId;

      socket.join(roomId);
      io.to(roomId).emit("server", { type: "user_joined", userId });
      console.log(`User ${userId} joined room ${roomId}`);
      userCount++;
    }

    socket.on("client", async (msg: WsIncoming) => {
      // console.log(msg);

      if (msg.type === "send_message") {
        const saved = await prisma.message.create({
          data: { roomId: msg.roomId, userId: msg.userId, text: msg.text },
          include: { User: true },
        });

        // console.log(saved);

        socket.to(msg.roomId).emit("server", {
          type: "new_message",
          id: saved.id,
          roomId: saved.roomId,
          userId: saved.userId,
          name: saved.User.username,
          text: saved.text,
          sentAt: saved.sentAt.toISOString(),
          userCount
        });
        return;
      }

      if (msg.type === "typing") {
        // Use socket.to.emit to exclude the sender
        socket.to(msg.roomId).emit("server", {
          type: "typing",
          userId: msg.userId,
          isTyping: msg.isTyping,
        });
      }
    });

    socket.on("disconnect", async () => {
      const { userId, roomId } = socket.data;

      if (roomId && userId) {
        console.log(`User ${userId} left room ${roomId}`);
        userCount--;
        // Broadcast to all clients in the room except the one who disconnected
        socket.to(roomId).emit("server", { type: "user_left", userId });
      }
    });
  });

  return io;
};
