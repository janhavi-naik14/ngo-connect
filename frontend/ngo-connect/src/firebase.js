// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB8cQoRExf3FHgpW6XlgVLs10i8jWOka7E",
  authDomain: "ngo-connect-auth.firebaseapp.com",
  projectId: "ngo-connect-auth",
  storageBucket: "ngo-connect-auth.firebasestorage.app",
  messagingSenderId: "224453852938",
  appId: "1:224453852938:web:3ce770dc7670923ce4c4f3",
  measurementId: "G-2MDDK1E4SW"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
