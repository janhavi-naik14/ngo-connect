const getConnection = require("../utils/regionSelector");
const messageSchema = require("../models/Messages");
const userSchema = require("../models/User");

// 1. ✅ Search Users
exports.searchUsers = async (req, res) => {
  const query = req.query.q;
  const { uid } = req.user;

  try {
    const regions = ["mumbai", "delhi", "bangalore"];
    let allResults = [];

    for (const region of regions) {
      const conn = await getConnection(region);
      const User = conn.models.User || conn.model("User", userSchema);

      const users = await User.find({
        $and: [
          {
            $or: [
              { name: { $regex: query, $options: "i" } },
              { email: { $regex: query, $options: "i" } },
            ],
          },
          { firebaseUid: { $ne: uid } },
        ],
      }).select("name email firebaseUid region");

      allResults = allResults.concat(users);
    }

    res.json(allResults);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Error searching users" });
  }
};

// 2. ✅ Send Message + Emit Real-time
exports.sendMessage = async (req, res) => {
  const { uid } = req.user;
  const { receiverId, content, region } = req.body;

  try {
    const conn = await getConnection(region);
    const Message = conn.models.Message || conn.model("Message", messageSchema);

    const newMessage = await Message.create({
      senderId: uid,
      receiverId,
      content,
      region,
      read: false,
      timestamp: new Date()
    });

    // Real-time message to receiver
    req.io.to(receiverId).emit("receiveMessage", newMessage);

    res.json(newMessage);
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// 3. ✅ Get Chat Between Two Users
exports.getMessages = async (req, res) => {
  const { uid } = req.user;
  const otherId = req.query.user;
  const region = req.query.region;

  try {
    const conn = await getConnection(region);
    const Message = conn.models.Message || conn.model("Message", messageSchema);

    const messages = await Message.find({
      $or: [
        { senderId: uid, receiverId: otherId },
        { senderId: otherId, receiverId: uid },
      ],
    }).sort({ timestamp: 1 });

    // Mark messages as read
    await Message.updateMany(
      { senderId: otherId, receiverId: uid, read: false },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (err) {
    console.error("Fetch chat error:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

// 4. ✅ Unread Count by Sender
exports.getUnreadCount = async (req, res) => {
  const { uid } = req.user;

  try {
    const regions = ["mumbai", "delhi", "bangalore"];
    const byUser = {};

    for (const region of regions) {
      const conn = await getConnection(region);
      const Message = conn.models.Message || conn.model("Message", messageSchema);

      const unreadMessages = await Message.find({ receiverId: uid, read: false });

      unreadMessages.forEach((msg) => {
        byUser[msg.senderId] = (byUser[msg.senderId] || 0) + 1;
      });
    }

    res.json({ byUser });
  } catch (err) {
    console.error("Unread count error:", err);
    res.status(500).json({ message: "Error retrieving unread count" });
  }
};

// 5. ✅ Recent Chats List
exports.getRecentChats = async (req, res) => {
  const { uid } = req.user;
  const regions = ["mumbai", "delhi", "bangalore"];
  const usersMap = {};

  try {
    for (const region of regions) {
      const conn = await getConnection(region);
      const Message = conn.model("Message", messageSchema);
      const User = conn.model("User", userSchema);

      const chats = await Message.find({
        $or: [{ senderId: uid }, { receiverId: uid }],
      }).sort({ updatedAt: -1 });

      for (const msg of chats) {
        const otherId = msg.senderId === uid ? msg.receiverId : msg.senderId;
        if (!usersMap[otherId]) {
          const userDoc = await User.findOne({ firebaseUid: otherId });
          if (userDoc) {
            usersMap[otherId] = {
              name: userDoc.name,
              email: userDoc.email,
              firebaseUid: userDoc.firebaseUid,
              region: userDoc.region,
            };
          }
        }
      }
    }

    res.json(Object.values(usersMap));
  } catch (err) {
    console.error("Fetch recent chats error:", err);
    res.status(500).json({ message: "Failed to fetch recent chats" });
  }
};

// 6. ✅ Mark All from One Sender as Read
exports.markMessagesAsRead = async (req, res) => {
  const { uid } = req.user;
  const { senderId, region } = req.body;

  try {
    const conn = await getConnection(region);
    const Message = conn.model("Message", messageSchema);

    await Message.updateMany(
      { senderId, receiverId: uid, read: false },
      { $set: { read: true } }
    );

    res.json({ message: "Marked as read" });
  } catch (err) {
    console.error("Mark as read error:", err);
    res.status(500).json({ message: "Failed to mark as read" });
  }
};
