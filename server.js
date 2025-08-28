const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const dotenv = require("dotenv");
const os = require("os");
const path = require("path"); // ✅ Add this

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orders");
const escrowRoutes = require("./routes/escrowRoutes");
const userRoutes = require("./routes/userRoutes");
const setupSocket = require("./sockets");


dotenv.config();

const app = express();
const server = http.createServer(app);

// Connect DB
connectDB();

// WebSocket setup
const { io, sendToUser } = setupSocket(server);
app.set("sendToUser", sendToUser);

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  credentials: true,
}));
app.use(express.json());

console.log("📂 Serving static files from:", path.join(__dirname, "../frontend"));
// ✅ Serve static frontend files
app.use(express.static(path.join(__dirname, "../frontend")));


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/escrow", escrowRoutes);
app.use("/api/users", userRoutes);

// Root
app.get("/", (req, res) => {
  res.send("🚀 P2P USDT Trading Platform Backend is running.");
});

// LAN IP
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (let iface in interfaces) {
    for (let i of interfaces[iface]) {
      if (i.family === 'IPv4' && !i.internal) {
        return i.address;
      }
    }
  }
  return 'localhost';
};

// Server
const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  const localIP = getLocalIP();
  console.log(`✅ Server running on:`);
  console.log(`🔹 Localhost → http://localhost:${PORT}`);
  console.log(`🔹 LAN       → http://${localIP}:${PORT}`);
});
