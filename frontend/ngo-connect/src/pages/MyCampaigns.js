// src/pages/MyCampaigns.js
import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { auth } from "../firebase";
import { FaCalendarAlt } from "react-icons/fa";
import "../styles/calendarFix.css";

export default function MyCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    fundingRequired: "",
    region: "mumbai",
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Fetch user's campaigns
  const fetchMyCampaigns = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.warn("User not logged in yet.");
      return;
    }

    try {
      const token = await currentUser.getIdToken();
      const region = localStorage.getItem("region") || "mumbai";

      const res = await fetch(`http://localhost:5000/api/campaigns/my-campaigns?region=${region}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Fetch error:", data.message || res.statusText);
        setCampaigns([]);
        return;
      }

      setCampaigns(Array.isArray(data) ? data : data.campaigns || []);
    } catch (err) {
      console.error("Error fetching campaigns:", err.message);
      setCampaigns([]);
    }
  };

  // Submit campaign form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
    if (!currentUser) return alert("You must be logged in to create a campaign.");

    try {
      const token = await currentUser.getIdToken();
      const payload = {
        ...form,
        fundingRequired: Number(form.fundingRequired),
      };

      const res = await fetch("http://localhost:5000/api/campaigns/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        return alert(`❌ Error: ${result.message || "Failed to create campaign."}`);
      }

      alert("✅ Campaign created successfully!");
      setForm({
        title: "",
        description: "",
        date: "",
        fundingRequired: "",
        region: "mumbai",
      });
      fetchMyCampaigns();
    } catch (err) {
      console.error("Submission error:", err.message);
      alert("Something went wrong while creating the campaign.");
    }
  };

  // Fetch on auth state change
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) fetchMyCampaigns();
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="p-8 bg-green-900 min-h-screen text-white relative">
      {/* 📅 Toggle Calendar Button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="bg-lime-400 text-green-900 p-2 rounded-full shadow-md hover:bg-lime-500"
          title="Toggle Calendar"
        >
          <FaCalendarAlt size={23} />
        </button>
      </div>

      {/* 📅 Collapsible Calendar */}
      {showCalendar && (
        <div className="absolute top-16 right-4 z-10 shadow-lg rounded-lg">
          <Calendar
            tileContent={({ date }) => {
              const dateStr = date.toLocaleDateString("en-CA");
              const campaign = campaigns.find((c) => c.date.startsWith(dateStr));
              return campaign ? (
                <div className="campaign-circle-full" title={campaign.title}>
                  <span className="date-on-circle">{date.getDate()}</span>
                </div>
              ) : null;
            }}
            tileClassName={({ date }) => {
              const dateStr = date.toLocaleDateString("en-CA");
              const isCampaign = campaigns.find((c) => c.date.startsWith(dateStr));
              const isToday = new Date().toDateString() === date.toDateString();

              if (isCampaign) return "campaign-tile";
              if (isToday) return "react-calendar__tile--now";
              return null;
            }}
            formatShortWeekday={(locale, date) =>
              date.toLocaleDateString(locale, { weekday: "short" })
            }
            next2Label={null}
            prev2Label={null}
          />
        </div>
      )}

      <h1 className="text-3xl font-bold text-lime-300 mb-6">📝 My Campaigns</h1>

      {/* Campaign Creation Form */}
      <form onSubmit={handleSubmit} className="space-y-4 bg-green-800 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-bold text-lime-300">Create New Campaign</h2>

        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded bg-green-700 text-white placeholder-lime-200"
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded bg-green-700 text-white placeholder-lime-200"
        />
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded bg-green-700 text-white"
        />
        <input
          type="number"
          name="fundingRequired"
          placeholder="Funding Required (₹)"
          value={form.fundingRequired}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded bg-green-700 text-white placeholder-lime-200"
        />

        <button className="bg-lime-400 text-green-900 font-bold px-6 py-2 rounded-full hover:bg-lime-500">
          Create Campaign
        </button>
      </form>

      {/* Campaign List */}
      <div className="bg-green-800 p-6 rounded-lg">
        <h2 className="text-xl font-bold text-lime-300 mb-4">Your Campaigns</h2>
        {campaigns.length === 0 ? (
          <p>No campaigns yet.</p>
        ) : (
          <ul className="space-y-2">
            {campaigns.map((c) => (
              <li key={c._id} className="border-b border-lime-500 pb-2">
                <strong>{c.title}</strong> — {c.description} ({c.date.slice(0, 10)})
                <p className="text-sm text-lime-400">
                  Funding: ₹{c.fundingRequired} | Remaining: ₹{c.initialFunds}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
