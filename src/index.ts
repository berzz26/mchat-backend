import express, { type Request, type Response } from "express";
import dotenv from "dotenv";
import { Server } from "socket.io";
import routes from "./routes/index.js";
import cors from "cors";
import { initSocket } from "./socket.js";
import redis from "./config/redis.js"; // <-- import redis client
import { prisma } from "./config/db.js"
import { globalLimiter } from "./middlewares/rateLimitter.js";


const app = express();
dotenv.config();

app.use(
  cors({
    origin: "*",
    credentials: false,
  }),
);

app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
  res.send("mchat-api server running");
});

//mount the global rate limiter
app.use(globalLimiter)
//mount the api routes
app.use("/api", routes);

const PORT = process.env.PORT || 3000;
if (!PORT) {
  throw new Error("Port in env not defined");
}

const server = app.listen(PORT, () => {
  console.log(`Backend is up at ${PORT}`);
});

// socket.io init
initSocket(server);

// ---- Graceful shutdown ----
const shutdown = async () => {
  console.log("Shutting down server...");

  // Close redis
  try {
    await redis.quit();
    console.log("Redis connection closed");
  } catch (err) {
    console.error("Error closing Redis:", err);
  }
  try {
    await prisma.$disconnect();
    console.log("Prisma disconnected from pgsql");
  } catch (err) {
    console.error("Error disconnecting Prisma:", err);
  }
  // Close http server
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
