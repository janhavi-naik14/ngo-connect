// backend/utils/regionSelector.js
const mongoose = require("mongoose");
const userSchema = require("../models/User");
const campaignSchema = require("../models/Campaign");

const connections = {};

module.exports = async function getConnection(region) {
  // Return cached connection if available
  if (connections[region]) {
    return connections[region];
  }

  let uri = "";
  switch (region.toLowerCase()) {
    case "mumbai":
      uri = process.env.MONGO_URI_MUMBAI;
      break;
    case "delhi":
      uri = process.env.MONGO_URI_DELHI;
      break;
    case "bangalore":
      uri = process.env.MONGO_URI_BANGALORE;
      break;
    default:
      throw new Error("Invalid region");
  }

  try {
    const conn = await mongoose.createConnection(uri, {
      dbName: "ngoConnectDB",
    });

    // Register models only once
    if (!conn.models.User) {
      conn.model("User", userSchema);
    }
    if (!conn.models.Campaign) {
      conn.model("Campaign", campaignSchema);
    }

    connections[region] = conn;
    return conn;

  } catch (err) {
    console.error(`⚠️ Failed to connect to ${region} cluster:`, err.message);
    const error = new Error("Region temporarily unavailable");
    error.code = "REGION_UNAVAILABLE";
    throw error;
  }
};
