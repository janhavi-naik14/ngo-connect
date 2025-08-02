// src/pages/Login.js
import React, { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
    const user = userCredential.user;

    const token = await user.getIdToken();
    console.log("Firebase ID Token:", token);

    // Fetch profile (including region)
    const res = await fetch("http://localhost:5000/api/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (data.region) {
      localStorage.setItem("region", data.region); // ✅ Save region
    }

    alert(`Welcome back, ${user.email}`);
    navigate("/");

  } catch (error) {
    alert(error.message);
  }
};

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const token = await user.getIdToken();


      // Fetch user profile to get region
      const res = await fetch("http://localhost:5000/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.region) {
        localStorage.setItem("region", data.region); // 💾 Store region
        alert(`Logged in as ${data.name}`);
        navigate("/");
      } else {
        alert("Google Login successful but region not found.");
      }
    } catch (error) {
      console.error("Google Login Error:", error);
      alert(error.message);
    }
  };

  return (
    <section className="flex items-center justify-center min-h-[80vh] bg-green-900 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-green-800 p-8 rounded-lg shadow-lg w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-bold text-lime-300 text-center mb-4">Login</h2>

        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded bg-green-700 text-white placeholder-lime-200"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded bg-green-700 text-white placeholder-lime-200"
        />

        <button
          type="submit"
          className="bg-lime-400 text-green-900 font-bold px-6 py-2 rounded-full hover:bg-lime-500 w-full"
        >
          Login
        </button>

        <p className="text-center text-sm text-white">Or</p>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="bg-white text-green-900 font-bold px-6 py-2 rounded-full hover:bg-gray-200 w-full"
        >
          Continue with Google
        </button>
      </form>
    </section>
  );
}
