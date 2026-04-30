import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Shield, Lock, Mail, Loader2 } from "lucide-react";
import "./AdminLogin.css";
import logoImg from "../../../components/Media/Images/Logo.png";

const ADMIN_EMAIL = "admin@glamio.com";
const ADMIN_PASSWORD = "Admin@123";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    await new Promise(r => setTimeout(r, 600));

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminData = { email: ADMIN_EMAIL, role: "ADMIN", name: "Glamio Admin" };
      localStorage.setItem("admin", JSON.stringify(adminData));
      localStorage.setItem("isAdminLoggedIn", "true");
      navigate("/admin/dashboard");
    } else {
      setError("Invalid admin credentials. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="al-page">
      <div className="al-card">
        <div className="al-brand" onClick={() => navigate("/")}>
          <img src={logoImg} alt="Glamio" className="al-logo-img" />
        </div>

        <div className="al-badge">
          <Shield size={13} /> Admin Portal
        </div>

        <h1 className="al-title">Admin Sign In</h1>
        <p className="al-sub">Access the Glamio administration dashboard</p>

        <form onSubmit={handleSubmit} className="al-form" noValidate>
          <div className="al-field">
            <label><Mail size={13} /> Email Address</label>
            <input
              type="email"
              placeholder="admin@glamio.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(""); }}
              required
              autoComplete="username"
            />
          </div>

          <div className="al-field">
            <label><Lock size={13} /> Password</label>
            <div className="al-pass-wrap">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Enter admin password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                required
                autoComplete="current-password"
              />
              <button type="button" className="al-eye" onClick={() => setShowPass(s => !s)}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="al-error">
              <Shield size={13} /> {error}
            </div>
          )}

          <button type="submit" className="al-submit" disabled={loading}>
            {loading ? <><Loader2 size={16} className="al-spin" /> Signing in…</> : "Sign In to Dashboard"}
          </button>
        </form>

        <p className="al-back" onClick={() => navigate("/signin")}>
          ← Back to customer login
        </p>
      </div>
    </div>
  );
}
