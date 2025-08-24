import express, { type Request, type Response } from "express";
import { Server } from "socket.io";
import routes from "./routes/room.route.js";
import cors from "cors";

const app = express();

// const server = app.listen(8080, () => {
//   console.log(new Date(), "server listening on 8080");
// });

// app.get("/", (req, res) => {
//   res.send("hey world");
// });

// const io = new Server(server);

// let users = 0;

// io.on("connection", (socket) => {
//   console.log(`user connected ${++users}`);

//   // send message on connection
//   socket.emit("message", "Hello from Socket.IO server!!");

//   // listen for custom event
//   socket.on("message", (data) => {
//     console.log("received:", data);

//     // echo back to client
//     socket.emit("message", `server got: ${data}`);
//   });

//   socket.on("disconnect", () => {
//     console.log(`user disconnected ${--users}`);
//   });
// });

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
app.listen(PORT, () => {
  console.log(`Backend is up`);
});
