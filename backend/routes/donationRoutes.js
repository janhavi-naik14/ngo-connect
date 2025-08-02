const express = require("express");
const router = express.Router();
const { donateToCampaign } = require("../controllers/donationController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/donate", authMiddleware, donateToCampaign);

module.exports = router;
