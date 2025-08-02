// routes/search.js
const express = require("express");
const router = express.Router();
const { searchUsers } = require("../controllers/messageController");
const verifyFirebaseToken = require("../middleware/authMiddleware");

router.get("/search", verifyFirebaseToken, searchUsers);

module.exports = router;
