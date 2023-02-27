const express = require("express");
const http = require("http");
const path = require("path");
const PORT = process.env.PORT;
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server); // need to pull out server because socketio requires it, express creates it behind the scenes but we need to pull out that server

const publicDirPath = path.join(__dirname, "../public");

app.use(express.static(publicDirPath));

// let count = 0;

io.on("connection", (socket) => {
  console.log("New Websocket connection");
  socket.emit("message", "Welcome!");
  socket.on("sendMessage", (message) => {
    io.emit("message", message);
  });

  //   socket.emit("countUpdated", count);
  //   socket.on("increment", () => {
  //     count++;
  //     // socket.emit("countUpdated", count); // only emit to a specific connection
  //     io.emit("countUpdated", count); // emit to all socket connections
  //   });
});

server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
