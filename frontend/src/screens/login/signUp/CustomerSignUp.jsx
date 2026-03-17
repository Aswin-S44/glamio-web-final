import React, { useState } from "react";
import "./SignUp.css";
import vid from "../../../components/Media/Video/New1.mp4";
import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import GoogleImg from "../../../components/Media/Images/google.png";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

import { auth } from "../../../config/firebase";
import { googleSignInApi } from "../../../services/auth.service";
import api from "../../../utils/api.util";

function CustomerSignUp() {
  const [mode, setMode] = useState(null); // null | 'salon' | 'customer'
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const data = await googleSignInApi(idToken);
      localStorage.setItem("token", data.data.token);

      if (data.data.token) {
        let dataToSignup = {
          email: data.data.user.email,
          username: data.data.user.name,
          profileImage: data.data.user.picture,
          userType: "customer",
        };
        const userResponse = await api.post("/auth/signup", dataToSignup);

        if (userResponse && userResponse.data.success) {
          navigate("/");
        }
        //
        // window.location.reload();
      }
    } catch (error) {
      console.error("Google sign-in failed", error);
    }
  };

  return (
    <>
      {" "}
      <Header />
      <div id="home-page-add-new">
        <div className="container-fluid intro-container">
          <video id="landing-vid" autoPlay loop muted playsInline src={vid} />
          <div className="row form-layout">
            {/* LEFT INFO */}
            <div className="col-md-6 form-info">
              <h1>{mode === "salon" ? "Salon Portal" : "Customer Access"}</h1>
              <p>
                {mode === "salon"
                  ? "Access powerful tools to manage appointments, staff, services, and grow your luxury salon brand."
                  : "Sign in to book premium salon services, manage appointments, and enjoy a seamless beauty experience."}
              </p>

              <ul>
                <li>✔ Secure & private access</li>
                <li>✔ Premium experience</li>
                <li>✔ Smart scheduling</li>
              </ul>

              <button className="back-btn" onClick={() => navigate("/signup")}>
                ← Back
              </button>
            </div>

            {/* RIGHT GLASS FORM */}
            <div className="col-md-6 glass-form-wrapper">
              <div className="glass-card animate-fade-up">
                <h2 className="glass-title">
                  {mode === "salon" ? "Salon Access" : "Customer Access"}
                </h2>

                <p className="glass-subtitle">
                  {mode === "salon"
                    ? "Manage bookings, clients, and grow your luxury brand"
                    : "Book premium services and experience luxury care"}
                </p>

                <button
                  className="google-hero-btn"
                  onClick={handleGoogleSignIn}
                >
                  <img src={GoogleImg} alt="Google" />
                  Continue with Google
                </button>

                <span className="secure-text">
                  Secure authentication powered by Google
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>{" "}
      <Footer />
    </>
  );
}

export default CustomerSignUp;
