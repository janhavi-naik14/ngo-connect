const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  fundingRequired: { type: Number, required: true },
  initialFunds: { type: Number, default: 10000000 },
  createdBy: { type: String, required: true },
  ngoName: { type: String, required: true },
  region: { type: String, required: true },
});

// ❗ Export schema, not model, because you register dynamically
module.exports = campaignSchema;
