import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Settings as SettingsIcon,
  User,
  Phone,
  Bell,
  LogOut,
  Save,
  Package,
} from "lucide-react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../utils/api.util";
import "./SettingsScreen.css";

const NOTIFICATION_PREFS_KEY = "glamio_notification_prefs";

const DEFAULT_NOTIFICATION_PREFS = {
  bookingUpdates: true,
  offersAndPromotions: true,
  reminders: true,
};

const loadNotificationPrefs = () => {
  try {
    const raw = localStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_PREFS;
    return { ...DEFAULT_NOTIFICATION_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_NOTIFICATION_PREFS;
  }
};

export default function SettingsScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, loading, logout, refreshProfile } = useAuth();

  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveErr, setSaveErr] = useState("");
  const [notificationPrefs, setNotificationPrefs] = useState(loadNotificationPrefs);

  useEffect(() => {
    if (user) {
      setUsername(user.username || user.name || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(notificationPrefs));
  }, [notificationPrefs]);

  const toggleNotificationPref = (key) => {
    setNotificationPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");
    setSaveErr("");

    try {
      await apiRequest("/customer/profile", {
        method: "PATCH",
        body: JSON.stringify({ username, phone }),
      });
      await refreshProfile();
      setSaveMsg("Profile updated successfully.");

      if (location.state?.from === "booking-summary" && location.state?.redirectTo && phone) {
        navigate(location.state.redirectTo, { replace: true });
        return;
      }
    } catch (err) {
      setSaveErr(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="settings-page">
        <Header />
        <div className="settings-loading">Loading settings…</div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="settings-page">
        <Header />
        <div className="settings-empty">
          <Package size={56} />
          <h3>Sign in to manage your settings</h3>
          <p>Your account preferences will appear here after login.</p>
          <button className="btn" onClick={() => navigate("/signin")}>
            Sign In
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="settings-page">
      <Header />

      <div className="settings-hero">
        <div className="settings-hero-inner">
          <span className="settings-hero-tag">
            <SettingsIcon size={14} /> Settings
          </span>
          <h1>Account Settings</h1>
          <p>Manage your profile, notifications and account preferences</p>
        </div>
      </div>

      <div className="settings-body">
        <section className="settings-card">
          <div className="settings-card-head">
            <User size={18} />
            <h2>Profile Information</h2>
          </div>
          <form className="settings-form" onSubmit={handleSaveProfile}>
            <div className="settings-field">
              <label htmlFor="settings-username">Full Name</label>
              <input
                id="settings-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="settings-field">
              <label htmlFor="settings-phone">
                <Phone size={13} /> Phone Number
              </label>
              <input
                id="settings-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Your phone number"
              />
            </div>
            <div className="settings-field">
              <label>Email</label>
              <input type="email" value={user?.email || ""} disabled />
            </div>

            {saveMsg && <p className="settings-msg success">{saveMsg}</p>}
            {saveErr && <p className="settings-msg error">{saveErr}</p>}

            <button className="settings-save-btn" type="submit" disabled={saving}>
              <Save size={15} /> {saving ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </section>

        <section className="settings-card">
          <div className="settings-card-head">
            <Bell size={18} />
            <h2>Notification Preferences</h2>
          </div>
          <div className="settings-toggle-list">
            <ToggleRow
              label="Booking Updates"
              description="Get notified when your appointment status changes"
              checked={notificationPrefs.bookingUpdates}
              onChange={() => toggleNotificationPref("bookingUpdates")}
            />
            <ToggleRow
              label="Offers & Promotions"
              description="Receive updates about offers from your favourite salons"
              checked={notificationPrefs.offersAndPromotions}
              onChange={() => toggleNotificationPref("offersAndPromotions")}
            />
            <ToggleRow
              label="Appointment Reminders"
              description="Get reminded before your upcoming appointments"
              checked={notificationPrefs.reminders}
              onChange={() => toggleNotificationPref("reminders")}
            />
          </div>
        </section>

        <section className="settings-card">
          <div className="settings-card-head">
            <SettingsIcon size={18} />
            <h2>Account</h2>
          </div>
          <div className="settings-account-actions">
            <button className="settings-logout-btn" onClick={handleLogout}>
              <LogOut size={15} /> Log Out
            </button>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="settings-toggle-row">
      <div>
        <p className="settings-toggle-label">{label}</p>
        <p className="settings-toggle-desc">{description}</p>
      </div>
      <button
        type="button"
        className={`settings-switch ${checked ? "on" : ""}`}
        onClick={onChange}
        aria-pressed={checked}
      >
        <span className="settings-switch-knob" />
      </button>
    </div>
  );
}
