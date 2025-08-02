const express = require("express");
const router = express.Router();
const {
  createCampaign,
  getMyCampaigns,
  getAllCampaigns,  // ✅ New import
} = require("../controllers/campaignController");
const verifyFirebaseToken = require("../middleware/authMiddleware");

router.post("/create", verifyFirebaseToken, createCampaign);
router.get("/my-campaigns", verifyFirebaseToken, getMyCampaigns);
router.get("/all", getAllCampaigns); // ✅ Public route (no token)

module.exports = router;
