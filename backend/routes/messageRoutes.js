const express = require("express");
const router = express.Router();
const verifyFirebaseToken = require("../middleware/authMiddleware");
const {
  searchUsers,
  sendMessage,
  getMessages,
  getUnreadCount,
  markMessagesAsRead,
  getRecentChats,
} = require("../controllers/messageController");


router.get("/conversations", verifyFirebaseToken, getRecentChats);

router.get("/search", verifyFirebaseToken, searchUsers);
router.post("/send", verifyFirebaseToken, sendMessage);
router.get("/chat", verifyFirebaseToken, getMessages);
router.post("/mark-read", verifyFirebaseToken, markMessagesAsRead);

router.get("/unread", verifyFirebaseToken, getUnreadCount);

module.exports = router;


// backend/server.js
