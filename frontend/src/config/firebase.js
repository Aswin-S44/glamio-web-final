import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCJHlWzxilAgXfmTqlCsbmJvWnK6cc_zFE",
  authDomain: "glamio-689aa.firebaseapp.com",
  projectId: "glamio-689aa",
  storageBucket: "glamio-689aa.firebasestorage.app",
  messagingSenderId: "273666754104",
  appId: "1:273666754104:web:a7f8ef556f791b89ee48cd",
  measurementId: "G-T0L2C5EX9C",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
