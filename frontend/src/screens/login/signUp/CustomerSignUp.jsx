import React from "react";
import "./SignUp.css";
import vid from "../../../components/Media/Video/New1.mp4";
import GoogleImg from "../../../components/Media/Images/google.png";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../../config/firebase";
import { useAuth } from "../../../context/AuthContext";
import { completeGoogleAuth } from "../../../services/auth.service";
import imgLogo from "../../../components/Media/Images/Logo.png";

function CustomerSignUp() {
  const navigate = useNavigate();
  const { setAuthenticatedUser } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const authData = await completeGoogleAuth({
        idToken,
        userType: "customer",
      });

      if (authData?.token) {
        setAuthenticatedUser(authData);
        const redirect = sessionStorage.getItem("redirectAfterLogin");

        if (redirect) {
          sessionStorage.removeItem("redirectAfterLogin");
          navigate(redirect);
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      console.error("Google sign-in failed", err);
    }
  };

  return (
    <div className="su-page">
      <video className="su-video" autoPlay loop muted playsInline src={vid} />
      <div className="su-overlay" />

      <div className="su-content">
        <div className="su-topbar" onClick={() => navigate("/")}>
          {/* Previous brand mark kept intentionally for reference:
          <Sparkles size={22} />
          <span>GLAM<em>IO</em></span>
          */}
          <img src={imgLogo} alt="Orucom" style={{ width: "12%" }} />
        </div>

        <div className="su-form-view">
          <div className="su-form-info">
            <h1>Customer Access</h1>
            <p>Sign in to book premium salon services, manage appointments, and enjoy a seamless luxury beauty experience.</p>
            <div className="su-info-list">
              <div className="su-info-item">Discover top-rated salons near you</div>
              <div className="su-info-item">Book multiple services in one go</div>
              <div className="su-info-item">Free cancellation up to 24 hours</div>
              <div className="su-info-item">Instant confirmation & reminders</div>
            </div>
            <button className="su-back-btn" onClick={() => navigate("/signup")}>← Back</button>
          </div>

          <div className="su-glass-wrap">
            <div className="su-glass-card">
              <h2>Join Orucom</h2>
              <p>Create your account and start booking premium beauty services instantly.</p>
              <button className="su-google-btn" onClick={handleGoogleSignIn}>
                <img src={GoogleImg} alt="Google" />
                Continue with Google
              </button>
              <span className="su-secure-text">Secure authentication powered by Google</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerSignUp;
