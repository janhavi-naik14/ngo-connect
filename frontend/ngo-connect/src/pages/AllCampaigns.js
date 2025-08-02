// src/pages/AllCampaigns.js
import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";

export default function AllCampaigns() {
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/campaigns/all")
      .then((res) => res.json())
      .then((data) => setCampaigns(data))
      .catch((err) => console.error("Error fetching campaigns", err));
  }, []);

  const handleDonate = async (campaign) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("You must be logged in to donate.");
      return;
    }

    const token = await user.getIdToken();
    const amount = prompt(`Enter amount to donate to "${campaign.title}"`);

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert("Please enter a valid donation amount.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/donations/donate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          campaignId: campaign._id,
          campaignRegion: campaign.region,
          amount: Number(amount),
        }),
      });

      const data = await res.json();
      alert(data.message || "Donation complete!");
    } catch (error) {
      console.error("Donation failed:", error);
      alert("Failed to donate. Please try again later.");
    }
  };

  return (
    <div className="p-8 bg-green-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold text-lime-300 mb-6">All Campaigns</h1>

      {campaigns.length === 0 ? (
        <p>No campaigns found.</p>
      ) : (
        <table className="w-full table-auto bg-green-800 rounded-lg">
          <thead>
            <tr className="bg-lime-500 text-green-900">
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">NGO</th>
              <th className="px-4 py-2">Region</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c._id} className="text-center border-b border-lime-400">
                <td className="px-4 py-2">{c.title}</td>
                <td className="px-4 py-2">{c.description}</td>
                <td className="px-4 py-2">
                  {new Date(c.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">{c.ngoName}</td>
                <td className="px-4 py-2">{c.region}</td>
                <td className="px-4 py-2">
                  <button
                    className="bg-lime-400 text-green-900 px-2 py-1 rounded hover:bg-lime-500"
                    onClick={() => handleDonate(c)}
                  >
                    Donate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
