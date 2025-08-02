import { useEffect, useCallback, useState } from "react";
import { io } from "socket.io-client";
import { useRef } from "react";

const socket = io("http://localhost:5000");

export default function ChatDrawer({
  showChatDrawer,
  setShowChatDrawer,
  selectedUser,
  setSelectedUser,
  messages,
  setMessages,
  newMessage,
  setNewMessage,
  search,
  setSearch,
  currentUser,
}) {
  const [unreadMap, setUnreadMap] = useState({});
  const [recentChats, setRecentChats] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    const fetchChats = async () => {
      const token = await currentUser.getIdToken();
      const res = await fetch("http://localhost:5000/api/messages/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRecentChats(data);
    };
    fetchChats();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const fetchUnread = async () => {
      const token = await currentUser.getIdToken();
      const res = await fetch("http://localhost:5000/api/messages/unread", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.byUser) {
        setUnreadMap(data.byUser);
      }
    };
    fetchUnread();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    console.log("🔌 Connecting to socket room with UID:", currentUser.uid);
    socket.emit("join", currentUser.uid);
const handleReceive = (msg) => {
  console.log("📥 Received message via socket:", msg);
  console.log("👤 Logged-in user UID:", currentUser?.uid);
  console.log("💬 Selected chat user UID:", selectedUser?.firebaseUid);

  // Auto-select sender if no chat is open
  if (!selectedUser && msg.senderId !== currentUser?.uid) {
    console.log("📬 No chat open. Auto-selecting sender as current chat.");

    const newUser = {
      firebaseUid: msg.senderId,
      name: msg.senderName || "Unknown",
      email: msg.senderEmail || "",
    };

    setSelectedUser(newUser);
    setMessages([msg]);
    return;
  }

  const isCurrentChat =
    msg.senderId === selectedUser?.firebaseUid ||
    msg.receiverId === selectedUser?.firebaseUid;

  console.log("🧠 Is message part of currently open chat?", isCurrentChat);

  if (isCurrentChat) {
    console.log("✅ Appending received message to current chat.");
    setMessages((prev) => [...prev, msg]);
  } else {
    console.log("📬 Message not in open chat. Incrementing unread count.");
    setUnreadMap((prev) => ({
      ...prev,
      [msg.senderId]: (prev[msg.senderId] || 0) + 1,
    }));
  }
};



    socket.on("receiveMessage", handleReceive);
    return () => socket.off("receiveMessage", handleReceive);
  }, [currentUser, selectedUser, setMessages]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentUser?.uid || !selectedUser?.firebaseUid) {
        console.warn("⚠️ Missing user UIDs, skipping fetch.");
        return;
      }

      const token = await currentUser.getIdToken();
      const region = selectedUser.region || "mumbai";

      console.log("📡 Fetching messages between", currentUser.uid, "and", selectedUser.firebaseUid);
      const res = await fetch(
        `http://localhost:5000/api/messages/chat?user=${selectedUser.firebaseUid}&region=${region}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      console.log("📚 Messages fetched:", data);
      setMessages(data);

      await fetch("http://localhost:5000/api/messages/mark-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ senderId: selectedUser.firebaseUid, region }),
      });
    };

    fetchMessages();
  }, [selectedUser, currentUser, showChatDrawer]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!search.trim()) {
        setResults([]);
        return;
      }

      try {
        const token = await currentUser.getIdToken();
        const res = await fetch(`http://localhost:5000/api/messages/search?q=${encodeURIComponent(search)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("❌ Failed to search users:", err);
      }
    };

    fetchSearchResults();
  }, [search, currentUser]);

  const handleSend = useCallback(async () => {
    if (!newMessage.trim() || !currentUser) return;
    const token = await currentUser.getIdToken();
    const region = selectedUser.region || "mumbai";

    console.log("✉️ Sending message to:", selectedUser.firebaseUid, "->", newMessage);

    const res = await fetch("http://localhost:5000/api/messages/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        receiverId: selectedUser.firebaseUid,
        content: newMessage,
        region,
      }),
    });

    const saved = await res.json();
    console.log("✅ Message saved to DB:", saved);

    setNewMessage("");
    setMessages((prev) => [...prev, saved]);
  }, [newMessage, currentUser, selectedUser]);

  const closeChat = () => {
    setSelectedUser(null);
    setSearch("");
    setResults([]);
    setMessages([]);
    setNewMessage("");
    setShowChatDrawer(false);
  };

  const markAsRead = (userId) => {
    setUnreadMap((prev) => {
      const updated = { ...prev };
      delete updated[userId];
      return updated;
    });
  };

  if (!showChatDrawer) return null;

  const listToRender = search.trim() ? results : recentChats;
const getMessages = async (userId, otherUserId, token, region = "mumbai") => {
  try {
    const res = await fetch(
      `http://localhost:5000/api/messages/chat?user=${otherUserId}&region=${region}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("❌ Failed to fetch messages:", err);
    return [];
  }
};


  return (
    <div className="fixed top-0 right-0 h-full w-1/4 bg-green-800 text-white shadow-lg z-50 p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-lime-300">Messages</h2>
        <button onClick={closeChat}>❌</button>
      </div>

      {!selectedUser ? (
        <>
          <input
            type="text"
            placeholder="Search NGOs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 rounded bg-green-700 text-white placeholder-lime-200 mb-4"
          />
          <div className="space-y-2 overflow-y-auto max-h-[80vh]">
            {listToRender.map((ngo) => (
              <div
                key={ngo.firebaseUid}
              onClick={async () => {
  const token = await currentUser.getIdToken();
  const region = ngo.region || "mumbai";

  setSelectedUser(ngo);
  markAsRead(ngo.firebaseUid);
  const msgs = await getMessages(currentUser?.uid, ngo.firebaseUid, token, region);
  setMessages(msgs);
}}


                className="p-2 bg-green-700 rounded hover:bg-green-600 cursor-pointer flex justify-between items-center"
              >
                <span>🌱 {ngo.name || ngo.email}</span>
                {unreadMap[ngo.firebaseUid] && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {unreadMap[ngo.firebaseUid]}
                  </span>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-lime-300">
              Chat with {selectedUser.name || selectedUser.email}
            </h3>
            <button
              className="text-sm text-red-300"
              onClick={() => setSelectedUser(null)}
            >
              ← Back
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-green-700 rounded p-2 mb-2">
            {messages.map((msg, idx) => {
              const isSent = msg.senderId === currentUser?.uid;
              return (
                <div
                  key={idx}
                  className={`mb-1 px-3 py-2 max-w-[70%] rounded-lg ${
                    isSent
                      ? "ml-auto bg-lime-400 text-green-900 text-right"
                      : "mr-auto bg-white text-black text-left"
                  }`}
                >
                  {msg.content}
                </div>
              );
            })}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 rounded bg-green-700 text-white placeholder-lime-200"
            />
            <button
              onClick={handleSend}
              className="bg-lime-400 text-green-900 px-4 rounded hover:bg-lime-500"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
