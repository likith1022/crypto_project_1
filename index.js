const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const connectedUsers = {}; // userId -> socket

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*"
    }
  });

  io.use(async (socket, next) => {
    const jwt = require("jsonwebtoken");
const User = require("../models/user"); // adjust path if needed

io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    console.log("❌ No token provided");
    return next(new Error("No token"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // Attach user info to socket
    next();
  } catch (err) {
    console.error("❌ Socket auth error:", err.message);
    next(new Error("Authentication error"));
  }
});
});

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();
    connectedUsers[userId] = socket;
    console.log(`User connected: ${userId}`);

    socket.on("disconnect", () => {
      delete connectedUsers[userId];
      console.log(`User disconnected: ${userId}`);
    });
  });

  // Utility to send message to a user by ID
  const sendToUser = (userId, event, data) => {
    const socket = connectedUsers[userId];
    if (socket) {
      socket.emit(event, data);
    }
  };

  return { io, sendToUser };
}

module.exports = setupSocket;
