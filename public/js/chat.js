const socket = io();
const messageForm = document.querySelector(".message-form");
const messageFormInput = document.querySelector(".message-input");
const messageFormButton = document.querySelector(".message-button");
const locationButton = document.querySelector(".location");
const messages = document.getElementById("messages");
const sidebar = document.getElementById("sidebar");

const autoscroll = () => {
  // New message element
  const newMessage = messages.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle(newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = messages.offsetHeight;

  // Height of messages container
  const containerHeight = messages.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    messages.scrollTop = messages.scrollHeight;
  }
};

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

socket.on("roomData", ({ room, users }) => {
  sidebar.insertAdjacentHTML(
    "afterbegin",
    `
  <h2 class="room-title">${room}</h2>
  <h3 class="list-title">Users</h3>
  `
  );
  const usersList = document.querySelector(".users");
  usersList.innerHTML = users
    .map(function (user) {
      return "<li>" + user.username + "</li>";
    })
    .join("");
});

socket.on("message", ({ username, text, createdAt }) => {
  const formatTime = moment(createdAt).format("h:mm a");
  messages.insertAdjacentHTML(
    "beforeend",
    `<div class="message">
    <p>
    <span class="message__name">${username}</span>
    <span class="message_meta">${formatTime}</span>
    </p>
      <p>${text}</p>
  </div>`
  );
  autoscroll();
});

socket.on("locationMessage", ({ username, url, createdAt }) => {
  const formatTime = moment(createdAt).format("h:mm a");

  messages.insertAdjacentHTML(
    "beforeend",
    `<div class="message">
    <p>
    <span class="message__name">${username}</span>
    <span class="message_meta">${formatTime}</span>
    </p>
        <p><a href=${url} target="_blank">My current location</a></p>
    </div>`
  );
  autoscroll();
});

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  messageFormButton.setAttribute("disabled", "disabled");
  socket.emit("sendMessage", messageFormInput.value, (error) => {
    messageFormButton.removeAttribute("disabled");
    messageFormInput.value = "";
    messageFormInput.focus();
    if (error) return console.log(error);

    console.log("Message delivered");
  }); //the third arg will run when the event is acknowledged.
});

locationButton.addEventListener("click", () => {
  if (!navigator.geolocation)
    return alert("Geolocation is not supported on this browser");

  locationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    locationButton.removeAttribute("disabled");
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        console.log("Location shared");
      }
    );
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
// const incrementButton = document.getElementById("increment");

// socket.on("countUpdated", (count) => {
//   console.log("Count has been updated:", count);
// });

// incrementButton.addEventListener("click", () => {
//   socket.emit("increment");
// });
