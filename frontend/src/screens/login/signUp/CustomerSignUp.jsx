import React from "react";
import "./SignUp.css";
import vid from "../../../components/Media/Video/New1.mp4";
import GoogleImg from "../../../components/Media/Images/google.png";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Sparkles } from "lucide-react";
import { auth } from "../../../config/firebase";
import { googleSignInApi } from "../../../services/auth.service";
import api from "../../../utils/api.util";

function CustomerSignUp() {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const data = await googleSignInApi(idToken);
      localStorage.setItem("token", data.data.token);

      if (data.data.token) {
        const dataToSignup = {
          email: data.data.user.email,
          username: data.data.user.name,
          profileImage: data.data.user.picture,
          userType: "customer",
        };
        const userResponse = await api.post("/auth/signup", dataToSignup);
        if (userResponse && userResponse.data.success) {
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
          <Sparkles size={22} />
          <span>GLAM<em>IO</em></span>
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
              <h2>Join Glamio</h2>
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
