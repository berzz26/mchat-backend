import express from "express";
import { Server } from "socket.io";

const app = express();

const server = app.listen(8080, () => {
  console.log(new Date(), "server listening on 8080");
});

app.get("/", (req, res) => {
  res.send("hey world");
});

const io = new Server(server);

let users = 0;

io.on("connection", (socket) => {
  console.log(`user connected ${++users}`);

  // send message on connection
  socket.emit("message", "Hello from Socket.IO server!!");

  // listen for custom event
  socket.on("message", (data) => {
    console.log("received:", data);

    // echo back to client
    socket.emit("message", `server got: ${data}`);
  });

  socket.on("disconnect", () => {
    console.log(`user disconnected ${--users}`);
  });
});
