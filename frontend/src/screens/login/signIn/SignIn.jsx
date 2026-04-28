import React, { useState } from "react";
import "./SignIn.css";
import GoogleImg from "../../../components/Media/Images/google.png";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../../config/firebase";
import { googleSignInApi } from "../../../services/auth.service";
import { BASE_URL } from "../../../constants/urls";
import { Eye, EyeOff, Sparkles, Star, Shield, Clock } from "lucide-react";

function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAdminSignIn = (e) => {
    e.preventDefault();
    if (email === "admin@gmail.com" && password === "admin") {
      const adminData = { email: "admin@gmail.com", role: "ADMIN", isAdminLoggedIn: true };
      localStorage.setItem("admin", JSON.stringify(adminData));
      localStorage.setItem("isAdminLoggedIn", "true");
      navigate("/shop/dashboard");
      return;
    }
    alert("Invalid credentials");
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const data = await googleSignInApi(idToken);
      localStorage.setItem("token", data.data.token);
      let user = data.data.user;
      const userData = { email: user.email, username: user.name, profileImage: user.picture, userType: "CUSTOMER" };
      await fetch(`${BASE_URL}/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
    } catch (err) {
      console.error("Google sign-in failed", err);
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
            <p>"Glamio completely transformed how I discover and book beauty services. It's effortless and luxurious."</p>
            <div className="si-testimonial-author">
              <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=48" alt="Priya" />
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
            <p>Sign in to your Glamio account</p>
          </div>

          <button className="si-google-btn" onClick={handleGoogleSignIn} disabled={loading}>
            <img src={GoogleImg} alt="Google" />
            {loading ? "Signing in..." : "Continue with Google"}
          </button>

          <div className="si-divider">
            <span>or sign in with email</span>
          </div>

          <form onSubmit={handleAdminSignIn} className="si-form">
            <div className="si-field">
              <label>Email address</label>
              <div className="si-input-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="si-input-icon">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="si-field">
              <div className="si-label-row">
                <label>Password</label>
                <button type="button" className="si-forgot">Forgot password?</button>
              </div>
              <div className="si-input-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="si-input-icon">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" className="si-eye" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="si-remember">
              <label>
                <input type="checkbox" />
                <span>Remember me for 30 days</span>
              </label>
            </div>

            <button type="submit" className="si-submit-btn">
              Sign In
            </button>
          </form>

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
