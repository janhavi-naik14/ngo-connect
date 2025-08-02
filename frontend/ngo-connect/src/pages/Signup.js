// src/pages/Signup.js
import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { useNavigate } from "react-router-dom";
export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    region: "mumbai",
  });
  const navigate = useNavigate(); // 🔥 hook to redirect
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const registerNGOInBackend = async (user, name, region) => {
  try {
    const token = await user.getIdToken(); // Get Firebase token

    await fetch("http://localhost:5000/api/auth/register-ngo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Send token to backend
      },
      body: JSON.stringify({
        name,
        email: user.email,
        region,
        firebaseUid: user.uid,
      }),
    });

    console.log("NGO registered in backend");
  } catch (err) {
    console.error("Backend registration error:", err);
    alert("Failed to register NGO in backend.");
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Firebase Email/Password Signup
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const user = userCredential.user;

      // Register NGO in MongoDB
      await registerNGOInBackend(user, form.name, form.region);

      alert("Signup successful!");
      navigate("/"); 
    } catch (error) {
      console.error("Signup Error:", error);
      alert(error.message);
    }
  };
  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Ask for NGO name & region after Google signup
      const name = prompt("Enter NGO Name:");
      const region = prompt("Enter Region (mumbai/delhi/bangalore):", "mumbai");

      if (!name || !region) {
        alert("Name and region are required!");
        return;
      }

      // Register NGO in backend
      await registerNGOInBackend(user, name, region);

      alert(`Signed up with Google as ${user.displayName}`);
    } catch (error) {
      console.error("Google Signup Error:", error);
      alert(error.message);
    }
  };

  return (
    <section className="flex items-center justify-center min-h-[80vh] bg-green-900 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-green-800 p-8 rounded-lg shadow-lg w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-bold text-lime-300 text-center mb-4">
          Sign Up
        </h2>

        <input
          name="name"
          placeholder="NGO Name"
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded bg-green-700 text-white placeholder-lime-200"
        />

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

        <select
          name="region"
          onChange={handleChange}
          className="w-full px-4 py-2 rounded bg-green-700 text-white"
        >
          <option value="mumbai">Mumbai</option>
          <option value="delhi">Delhi</option>
          <option value="bangalore">Bangalore</option>
        </select>

        <button
          type="submit"
          className="bg-lime-400 text-green-900 font-bold px-6 py-2 rounded-full hover:bg-lime-500 w-full"
        >
          Sign Up
        </button>

        <p className="text-center text-sm text-white">Or</p>

        <button
          type="button"
          onClick={handleGoogleSignup}
          className="bg-white text-green-900 font-bold px-6 py-2 rounded-full hover:bg-gray-200 w-full"
        >
          Continue with Google
        </button>
      </form>
    </section>
  );
}
