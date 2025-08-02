const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    region: { type: String },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = messageSchema;