import React, { useState } from "react";
import "./SignIn.css";
import GoogleImg from "../../../components/Media/Images/google.png";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../../config/firebase";
import { googleSignInApi } from "../../../services/auth.service";
import { Sparkles, Star, Shield, Clock, Lock } from "lucide-react";
import Swal from "sweetalert2";
import img from "../../../components/Media/Images/model-with-smokey-eyes-golden-circle-earrings.webp";

function SignIn() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);

      // Step 1: Firebase Google OAuth
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      // Step 2: Sign in — backend upserts user and returns token + full profile
      const signInData = await googleSignInApi(idToken);
      const { token, user } = signInData.data;

      localStorage.setItem("token", token);

      // Step 3: Navigate based on shop profile state
      const shop = user?.shopProfile;
      if (shop) {
        if (shop.isProfileCompleted && shop.isOnboarded) {
          navigate("/shop/dashboard");
        } else if (shop.isProfileCompleted && !shop.isOnboarded) {
          navigate("/shop/onboard");
        } else {
          navigate("/shop/edit-profile");
        }
      } else {
        // Customer — honour any saved redirect (e.g. from booking flow)
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
      Swal.fire({
        icon: "error",
        title: "Sign-in Failed",
        text: err.message || "Could not sign in with Google. Please try again.",
        confirmButtonColor: "#c2185b",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="si-page">
      {/* Left Brand Panel */}
      <div className="si-brand">
        <div className="si-brand-inner">
          <div className="si-logo" onClick={() => navigate("/")}>
            <Sparkles size={22} />
            <span>GLAM<em>IO</em></span>
          </div>

          <div className="si-brand-copy">
            <h2>Your beauty journey starts here</h2>
            <p>Sign in to book world-class beauty services, manage appointments, and discover premium salons near you.</p>
          </div>

          <div className="si-features">
            <div className="si-feature">
              <div className="si-feature-icon"><Star size={18} /></div>
              <div>
                <strong>Top-Rated Salons</strong>
                <span>Verified professionals, real reviews</span>
              </div>
            </div>
            <div className="si-feature">
              <div className="si-feature-icon"><Clock size={18} /></div>
              <div>
                <strong>Instant Booking</strong>
                <span>Book in seconds, confirm instantly</span>
              </div>
            </div>
            <div className="si-feature">
              <div className="si-feature-icon"><Shield size={18} /></div>
              <div>
                <strong>Secure & Private</strong>
                <span>Your data is always protected</span>
              </div>
            </div>
          </div>

          <div className="si-testimonial">
            <p>"Orucom completely transformed how I discover and book beauty services. It's effortless and luxurious."</p>
            <div className="si-testimonial-author">
              <img src={img} alt="Priya" />
              <div>
                <strong>Priya S.</strong>
                <span>Member since 2024</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="si-form-panel">
        <div className="si-form-card">
          <div className="si-form-header">
            <h1>Welcome back</h1>
            <p>Sign in to your Orucom account</p>
          </div>

          <button
            className="si-google-btn"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <img src={GoogleImg} alt="Google" />
            {loading ? "Signing in…" : "Continue with Google"}
          </button>

          <div className="si-divider">
            <span>or</span>
          </div>

          <button
            className="si-admin-link"
            onClick={() => navigate("/admin/login")}
          >
            <Lock size={14} />
            Admin Portal
          </button>

          <p className="si-signup-link">
            Don't have an account?{" "}
            <button onClick={() => navigate("/signup")}>Create one free</button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
