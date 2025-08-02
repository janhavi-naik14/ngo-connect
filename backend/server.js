const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { createServer } = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/authRoutes");
const campaignRoutes = require("./routes/campaignRoutes");
const messageRoutes = require("./routes/messageRoutes");
const searchRoutes = require("./routes/search");

dotenv.config(); // Load .env file

const app = express();
const httpServer = createServer(app);

// Setup Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: "*", // You may want to replace * with your frontend URL in production
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Attach `io` to every request so routes/controllers can use it
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api", searchRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/donations", require("./routes/donationRoutes"));


// === Socket.io Real-Time Events ===
// === Socket.io Real-Time Events ===
io.on("connection", (socket) => {
  console.log("🔌 User connected to socket.io");

  // Join a specific room (usually user ID)
  socket.on("join", (uid) => {
    socket.join(uid);
    console.log(`✅ User joined room: ${uid}`);
  });

  // Handle sending real-time messages
  socket.on("sendMessage", (msg) => {
    const { receiverId, senderId, text } = msg;

    console.log("📤 Sending message:", msg);
    console.log("➡️ Emitting to room (receiver UID):", receiverId);

    if (receiverId) {
      io.to(receiverId).emit("receiveMessage", msg);
      console.log(`✅ Message emitted to ${receiverId}`);
    } else {
      console.warn("⚠️ No receiverId provided!");
    }
  });

  socket.on("disconnect", () => {
    console.log("🔌 User disconnected");
  });
});


// Start Server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
