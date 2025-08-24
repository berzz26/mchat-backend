import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.emit("client", {
  type: "send_message",
  roomId: "cmeps9h2a000196tl9kwi1ykx",
  userId: "3ed6cbb7-4c48-4fc7-88aa-33446fbc81ab",
  text: "hello world",
});

socket.on("server", (msg) => {
  console.log("Server says:", msg);
});
