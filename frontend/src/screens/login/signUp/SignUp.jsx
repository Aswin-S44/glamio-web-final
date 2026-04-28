import React, { useState } from "react";
import "./SignUp.css";
import vid from "../../../components/Media/Video/New1.mp4";
import GoogleImg from "../../../components/Media/Images/google.png";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Sparkles } from "lucide-react";
import { auth } from "../../../config/firebase";
import { googleSignInApi } from "../../../services/auth.service";
import { googleLogin } from "../../../store/slice/auth";

function SignUp() {
  const [mode, setMode] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleGoogleSignIn = async () => {
    const res = await dispatch(googleLogin());
    if (googleLogin.fulfilled.match(res)) {
      if (res.payload?.user?.shopProfile?.isProfileCompleted && res.payload?.user?.shopProfile?.isOnboarded) {
        navigate("/shop/dashboard");
      } else if (res.payload?.user?.shopProfile?.isProfileCompleted && !res.payload?.user?.shopProfile?.isOnboarded) {
        navigate("/shop/onboard");
      } else {
        navigate("/shop/edit-profile");
      }
    }
  };

  return (
    <div className="su-page">
      <video className="su-video" autoPlay loop muted playsInline src={vid} />
      <div className="su-overlay" />

      <div className="su-content">
        <div className="su-topbar" onClick={() => navigate("/")}>
          <Sparkles size={22} />
          <span>GLAM<em>IO</em></span>
        </div>

        {/* Default split view */}
        {!mode && (
          <div className="su-split">
            <div className="su-split-card" onClick={() => navigate("/signup/type=customer")}>
              <div className="su-split-inner">
                <span className="su-split-num">01</span>
                <div className="su-split-icon">💆‍♀️</div>
                <h2>For Customers</h2>
                <p>Discover, book, and enjoy premium beauty services from trusted luxury salons — crafted for comfort and convenience.</p>
                <button className="su-split-btn primary" onClick={(e) => { e.stopPropagation(); navigate("/signup/type=customer"); }}>
                  Customer Sign Up
                </button>
              </div>
            </div>

            <div className="su-split-card" onClick={() => setMode("salon")}>
              <div className="su-split-inner">
                <span className="su-split-num">02</span>
                <div className="su-split-icon">💈</div>
                <h2>Luxury Salon</h2>
                <p>Manage your salon effortlessly with smart scheduling, seamless client management, and tools designed for high-end beauty businesses.</p>
                <button className="su-split-btn outline" onClick={(e) => { e.stopPropagation(); setMode("salon"); }}>
                  Salon Sign Up
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Salon form view */}
        {mode === "salon" && (
          <div className="su-form-view">
            <div className="su-form-info">
              <h1>Salon Portal</h1>
              <p>Access powerful tools to manage appointments, staff, services, and grow your luxury salon brand.</p>
              <div className="su-info-list">
                <div className="su-info-item">Secure & private access</div>
                <div className="su-info-item">Smart scheduling tools</div>
                <div className="su-info-item">Client & service management</div>
                <div className="su-info-item">Real-time booking notifications</div>
              </div>
              <button className="su-back-btn" onClick={() => setMode(null)}>← Back</button>
            </div>

            <div className="su-glass-wrap">
              <div className="su-glass-card">
                <h2>Salon Access</h2>
                <p>Manage bookings, clients, and grow your luxury brand with ease.</p>
                <button className="su-google-btn" onClick={handleGoogleSignIn}>
                  <img src={GoogleImg} alt="Google" />
                  Continue with Google
                </button>
                <span className="su-secure-text">Secure authentication powered by Google</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SignUp;
