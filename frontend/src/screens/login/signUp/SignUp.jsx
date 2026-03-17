import React, { useState } from "react";
import "./SignUp.css";
import vid from "../../../components/Media/Video/New1.mp4";
import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import GoogleImg from "../../../components/Media/Images/google.png";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useDispatch } from "react-redux";

import { auth } from "../../../config/firebase";
import { googleSignInApi } from "../../../services/auth.service";
import { googleLogin } from "../../../store/slice/auth";

function SignUp() {
  const [mode, setMode] = useState(null); // null | 'salon' | 'customer'
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleGoogleSignIn = async () => {
    const res = await dispatch(googleLogin());

    if (googleLogin.fulfilled.match(res)) {
      if (
        res.payload?.user?.shopProfile?.isProfileCompleted &&
        res.payload?.user?.shopProfile?.isOnboarded
      ) {
        navigate("/shop/dashboard");
      } else if (
        res.payload?.user?.shopProfile?.isProfileCompleted &&
        !res.payload?.user?.shopProfile?.isOnboarded
      ) {
        navigate("/shop/onboard"); // onboard message
      } else {
        navigate("/shop/edit-profile");
      }

      // navigate("/shop/dashboard");
    }
  };

  return (
    <>
      {" "}
      <Header />
      <div id="home-page-add-new">
        <div className="container-fluid intro-container">
          <video id="landing-vid" autoPlay loop muted playsInline src={vid} />

          {/* DEFAULT SPLIT VIEW */}
          {!mode && (
            <div className="row text-center">
              <div className="col-md-6 height100vh split-card salon">
                <div className="split-overlay"></div>
                <div className="split-content">
                  <span className="section-number">01</span>
                  <h1 className="section-practice">Customers</h1>
                  <p className="split-desc">
                    Discover, book, and enjoy premium beauty services from
                    trusted luxury salons—crafted for comfort and convenience.
                  </p>
                  <button
                    className="dental-btn-1"
                    onClick={() => navigate("/signup/type=customer")}
                  >
                    Customer Login / Sign Up
                  </button>
                </div>
              </div>

              <div className="col-md-6 height100vh split-card customer">
                <div className="split-overlay light"></div>
                <div className="split-content">
                  <span className="section-number">02</span>
                  <h1 className="section-practice">Luxury Salon</h1>
                  <p className="split-desc">
                    Manage your salon effortlessly with smart scheduling,
                    seamless client management, and tools designed for high-end
                    beauty businesses.
                  </p>
                  <button
                    className="dental-btn"
                    onClick={() => setMode("salon")}
                  >
                    Salon Login / Sign Up
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FORM VIEW */}
          {/* FORM VIEW */}
          {mode && (
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

                <button className="back-btn" onClick={() => setMode(null)}>
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
          )}
        </div>
      </div>{" "}
      <Footer />
    </>
  );
}

export default SignUp;
