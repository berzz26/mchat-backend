import express, { type Request, type Response } from "express";
import { Server } from "socket.io";
import routes from "./routes/index.js";
import cors from "cors";
import { initSocket } from "./socket.js";

const app = express();

app.use(
  cors({
    origin: "*", // allow all origins
    credentials: false, // can't use credentials with '*'
  }),
);

app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
  res.send("mchat-api server running");
});

app.use("/api", routes);

const PORT = process.env.PORT || 3000;
if (!PORT) {
  throw new Error("Port in env not defined");
}
const server = app.listen(PORT, () => {
  console.log(`Backend is up`);
});

initSocket(server);
