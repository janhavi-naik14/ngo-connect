const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    region: {
      type: String,
      required: true,
    },
    firebaseUid: {
      type: String,
      required: true,
    },
    initialFunds: {
      type: Number,
      default: 10000000, // safe default so old users don't break
    },
    fundingRequired: {
      type: Number,
      default: 0, // safe default so donation logic works
    },
  },
  { timestamps: true }
);

// If model is already registered (in multi-DB setup), reuse it
module.exports = userSchema;
