const socket = io();
const messageForm = document.querySelector(".message-form");
const messageInput = document.querySelector(".message-input");

socket.on("message", (message) => console.log(message));

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  socket.emit("sendMessage", messageInput.value);
});

// const incrementButton = document.getElementById("increment");

// socket.on("countUpdated", (count) => {
//   console.log("Count has been updated:", count);
// });

// incrementButton.addEventListener("click", () => {
//   socket.emit("increment");
// });
