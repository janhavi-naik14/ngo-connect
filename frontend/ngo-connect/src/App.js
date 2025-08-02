// src/App.js
import {  Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import MyCampaigns from "./pages/MyCampaigns";
import AllCampaigns from "./pages/AllCampaigns";
import "./index.css";

function App() {
  return (
      <Routes>
        {/* All routes that share the layout go inside this Route */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/my-campaigns" element={<MyCampaigns />} />
          <Route path="/campaigns" element={<AllCampaigns />} />
        </Route>
      </Routes>
  );
}

export default App;
