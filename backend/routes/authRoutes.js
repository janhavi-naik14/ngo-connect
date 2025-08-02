const express = require("express");
const router = express.Router();
const authControllers = require("../controllers/authControllers");
const verifyFirebaseToken = require("../middleware/authMiddleware");

router.post("/register-ngo", verifyFirebaseToken, authControllers.registerNGO);
router.get("/profile", verifyFirebaseToken, authControllers.getProfile);

module.exports = router;
