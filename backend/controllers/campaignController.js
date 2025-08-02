const campaignSchema = require("../models/Campaign");
const userSchema = require("../models/User");
const getConnection = require("../utils/regionSelector");

exports.createCampaign = async (req, res) => {
  console.log("✅ POST /api/campaigns/create hit");
  const { title, description, date, fundingRequired } = req.body;
  const { uid } = req.user;

  try {
    const regions = ["mumbai", "delhi", "bangalore"];
    let user = null;
    let conn;

    for (const region of regions) {
      const connection = await getConnection(region);
      const User = connection.model("User");
      const foundUser = await User.findOne({ firebaseUid: uid });

      if (foundUser) {
        user = foundUser;
        conn = connection;
        break;
      }
    }

    if (!user || !conn) {
      return res.status(404).json({ message: "NGO not found in any cluster" });
    }

    const Campaign = conn.model("Campaign");

    const existingCampaigns = await Campaign.find({ createdBy: uid });
    const totalUsedFunds = existingCampaigns.reduce(
      (sum, campaign) => sum + (campaign.fundingRequired || 0),
      0
    );

    const STARTING_FUNDS = 10000000;
    const remainingFunds = STARTING_FUNDS - totalUsedFunds - fundingRequired;

    if (remainingFunds < 0) {
      return res.status(400).json({
        message: "Insufficient remaining funds to create this campaign",
        remainingFunds: STARTING_FUNDS - totalUsedFunds,
      });
    }

    const newCampaign = new Campaign({
      title,
      description,
      date,
      fundingRequired,
      initialFunds: remainingFunds,
      createdBy: uid,
      ngoName: user.name,
      region: user.region,
    });

    await newCampaign.save();

    // ✅ Reflect changes in User's funding
    user.initialFunds -= fundingRequired;
    user.fundingRequired += fundingRequired;
    await user.save();

    res.status(201).json({ message: "Campaign created successfully" });
  } catch (err) {
    console.error("Create campaign error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


exports.getMyCampaigns = async (req, res) => {
  const { uid } = req.user;

  try {
    const regions = ["mumbai", "delhi", "bangalore"];
    let allCampaigns = [];

    for (const region of regions) {
      const conn = await getConnection(region);
      const Campaign = conn.model("Campaign");
      const campaigns = await Campaign.find({ createdBy: uid });
      allCampaigns = allCampaigns.concat(campaigns);
    }

    res.status(200).json(allCampaigns);
  } catch (err) {
    console.error("Get my campaigns error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getAllCampaigns = async (req, res) => {
  try {
    const regions = ["mumbai", "delhi", "bangalore"];
    let allCampaigns = [];

    for (const region of regions) {
      const conn = await getConnection(region);
      const Campaign = conn.model("Campaign");
      const campaigns = await Campaign.find({}, "-fundingRequired -initialFunds"); // 🚫 exclude sensitive fields
      allCampaigns = allCampaigns.concat(campaigns);
    }

    res.status(200).json(allCampaigns);
  } catch (err) {
    console.error("Get all campaigns error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
