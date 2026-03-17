import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA4Zp71-ycE8lPC2B8gV66Ob90XdHypP88",
  authDomain: "freelance1-f1f57.firebaseapp.com",
  projectId: "freelance1-f1f57",
  storageBucket: "freelance1-f1f57.firebasestorage.app",
  messagingSenderId: "297588641134",
  appId: "1:297588641134:web:5e68afe9569f6a8124457f",
  measurementId: "G-ZERYXBWM8D",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
