const express = require("express");
const http = require("http");
const path = require("path");
const PORT = process.env.PORT;
const socketio = require("socket.io");
const Filter = require("bad-words");

const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

/* socket.emit: send event to a specific client
   io.emit: send event to all connected clients
   socket.broadcast.emit: send event to all connected clients except for the current one
   io.to.emit: send event to all connected clients in a specific room
   socket.broadcast.to.emit: send event to all clients in a specific room except for the current one
 */
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");

const app = express();
const server = http.createServer(app);
const io = socketio(server); // need to pull out server because socketio requires it, express creates it automatically behind the scenes but we need to pull out that server

const publicDirPath = path.join(__dirname, "../public");

app.use(express.static(publicDirPath));

// let count = 0;

io.on("connection", (socket) => {
  console.log("New Websocket connection");

  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) return callback(error);

    socket.join(user.room);

    socket.emit("message", generateMessage("ADMIN", "Welcome!"));

    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("ADMIN", `${user.username} has joined the room.`)
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed in this message");
    }
    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback(); // to acknowledge message
  });

  socket.on("sendLocation", ({ latitude, longitude }, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${latitude},${longitude}`
      )
    );
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("ADMIN", `${user.username} has left the room.`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });

  //   socket.emit("countUpdated", count);
  //   socket.on("increment", () => {
  //     count++;
  //     // socket.emit("countUpdated", count); // only emit to a specific connection
  //     io.emit("countUpdated", count); // emit to all socket connections
  //   });
});

server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
