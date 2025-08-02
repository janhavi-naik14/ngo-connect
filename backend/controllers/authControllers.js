// backend/controllers/authControllers.js
const getConnection = require("../utils/regionSelector");


exports.registerNGO = async (req, res) => {
  const { name, email, region, firebaseUid } = req.body;

  try {
    const conn = await getConnection(region.toLowerCase());
    const User = conn.model("User"); // ✅ get the model from connection

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "NGO already exists" });
    }

    const newNGO = new User({ name, email, region, firebaseUid });
    await newNGO.save();

    res.status(201).json({ message: `NGO added to ${region} cluster` });
  } catch (err) {
    console.error("Error adding NGO:", err.message);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};


exports.getProfile = async (req, res) => {
  const { uid } = req.user;

  try {
    const regions = ["mumbai", "delhi", "bangalore"];
    let user = null;

    console.log("Decoded UID:", uid);

    for (const region of regions) {
      const connection = await getConnection(region);
      const User = connection.models.User || connection.model("User", userSchema);
      console.log(`Searching in region: ${region}`);

      user = await User.findOne({ firebaseUid: uid });
      console.log(`Found user in ${region}?`, !!user);

      if (user) {
        const responseData = {
          name: user.name,
          region: user.region,
          email: user.email,
        };

        console.log("Responding with user profile:", responseData);
        console.log("Status Code:", res.statusCode);

        return res.json(responseData);
      }
    }

    console.log("User not found in any region.");
    return res.status(404).json({ message: "User not found in any cluster" });

  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
