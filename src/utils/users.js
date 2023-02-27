const users = [];

const addUser = ({ id, username, room }) => {
  // Clean up data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Validate data
  if (!username || !room) return { error: "Username and room are required" };

  // Check if data is existing
  const existingUser = users.find(
    (user) => user.room === room && user.username === username
  );

  if (existingUser) return { error: "User is already in use" };

  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  const user = users.find((user) => user.id === id);
  return user;
};

const getUsersInRoom = (room) => {
  const usersArr = users.filter((user) => user.room === room);
  return usersArr;
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
