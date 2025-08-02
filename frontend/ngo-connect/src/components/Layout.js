import { Outlet, Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { FaEnvelope } from "react-icons/fa";
import { auth } from "../firebase";
import ChatDrawer from "../components/ChatDrawer"; // ✅ Import drawer

export default function Layout() {
  const { user, logout } = useContext(AuthContext);
  const [showLogout, setShowLogout] = useState(false);
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  // Chat drawer state (shared with ChatDrawer)
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const getInitial = () => user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <div className="bg-green-900 text-white min-h-screen relative">
      {/* 🌿 Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-green-800">
        <div className="text-2xl font-bold text-lime-300">🌱 NGO Connect</div>
        <div className="space-x-4 flex items-center">
          <Link to="/campaigns" className="hover:text-lime-300">Campaigns</Link>

          {/* 💬 Chat Icon */}
          <button
            onClick={() => {
              setShowChatDrawer(!showChatDrawer);
              setHasUnread(false);
            }}
            className="relative hover:text-lime-300"
          >
            <FaEnvelope size={20} />
            {hasUnread && (
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 animate-ping" />
            )}
          </button>

          <Link to="/notifications" className="hover:text-lime-300">🔔</Link>

          {user ? (
            <>
              <Link to="/my-campaigns" className="hover:text-lime-300">My Campaigns</Link>
              <div
                className="relative"
                onMouseEnter={() => setShowLogout(true)}
                onMouseLeave={() => setShowLogout(false)}
              >
                <div className="w-10 h-10 rounded-full bg-lime-400 text-green-900 font-bold flex items-center justify-center cursor-pointer">
                  {getInitial()}
                </div>
                {showLogout && (
                  <button
                    onClick={logout}
                    className="absolute right-0 mt-2 bg-red-500 text-white px-3 py-1 rounded shadow"
                  >
                    Logout
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="bg-lime-400 text-green-900 px-4 py-2 rounded-full font-semibold hover:bg-lime-500">
                Login
              </Link>
              <Link to="/signup" className="bg-lime-400 text-green-900 px-4 py-2 rounded-full font-semibold hover:bg-lime-500">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* 📨 Chat Drawer */}
      <ChatDrawer
        showChatDrawer={showChatDrawer}
        setShowChatDrawer={setShowChatDrawer}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        messages={messages}
        setMessages={setMessages}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        search={search}
        setSearch={setSearch}
        results={results}
        setResults={setResults}
        currentUser={user}
      />

      <Outlet />
    </div>
  );
}
