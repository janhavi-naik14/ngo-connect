const getConnection = require("../utils/regionSelector");
const donationLogSchema = require("../models/DonationLog");

exports.donateToCampaign = async (req, res) => {
  const { campaignId, campaignRegion, amount } = req.body;
  const { uid } = req.user;

  let donorConn, targetConn, DonationLog, Campaign, User;
  let logEntry;

  try {
    const regions = ["mumbai", "delhi", "bangalore"];
    let donorRegion = null;
    let donorNgo = null;

    for (const region of regions) {
      const conn = await getConnection(region);
      const userModel = conn.model("User");
      const user = await userModel.findOne({ firebaseUid: uid });

      if (user) {
        donorRegion = region;
        donorConn = conn;
        donorNgo = user;
        console.log(`✅ Donor NGO found in region: ${donorRegion}, ID: ${user._id}, Name: ${user.name}, Initial Funds: ${user.initialFunds}`);
        break;
      }
    }

    if (!donorRegion) {
      console.log("❌ Donor NGO not found for UID:", uid);
      return res.status(404).json({ message: "Donor NGO not found" });
    }

    if (donorNgo.initialFunds < amount) {
      console.log("❌ Insufficient funds. Available:", donorNgo.initialFunds, "Required:", amount);
      return res.status(400).json({ message: "Insufficient donor funds" });
    }

    DonationLog = donorConn.model("DonationLog", donationLogSchema);
    logEntry = await DonationLog.create({
      donorId: uid,
      donorRegion,
      campaignId,
      campaignRegion,
      amount,
      status: "pending",
    });

    targetConn = await getConnection(campaignRegion);
    Campaign = targetConn.model("Campaign");
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) throw new Error("Campaign not found in target region");

    campaign.fundingRequired -= amount;
    if (campaign.fundingRequired < 0) {
      throw new Error("Donation exceeds required funding");
    }

    campaign.initialFunds = (campaign.initialFunds || 0) + amount;
    await campaign.save();

    const DonorUser = donorConn.model("User");
    const donorUser = await DonorUser.findOne({ firebaseUid: uid });

    if (!donorUser) {
      throw new Error("Donor user unexpectedly not found during update");
    }

    donorUser.initialFunds -= amount;
    donorUser.fundingRequired += amount;

    console.log(`💸 Updating donor funds: Before -> Initial: ${donorNgo.initialFunds}, After -> Initial: ${donorUser.initialFunds}`);
    await donorUser.save();

    logEntry.status = "committed";
    await logEntry.save();

    console.log(`✅ Donation of ₹${amount} committed from UID: ${uid} to Campaign: ${campaignId} in ${campaignRegion}`);
    return res.status(200).json({ message: "Donation successful" });
  } catch (err) {
    console.error("❌ Donation failed:", err.message);

    if (logEntry) {
      logEntry.status = "failed";
      await logEntry.save();
    }

    return res.status(500).json({
      message: "Donation failed",
      error: err.message,
    });
  }
};
