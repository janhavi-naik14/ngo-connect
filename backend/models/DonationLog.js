const mongoose = require("mongoose");

const donationLogSchema = new mongoose.Schema({
  donorId: String, // firebaseUid
  donorRegion: String,
  campaignId: String,
  campaignRegion: String,
  amount: Number,
  status: { type: String, enum: ["pending", "committed", "failed"], default: "pending" },
  timestamp: { type: Date, default: Date.now },
});

module.exports = donationLogSchema;
