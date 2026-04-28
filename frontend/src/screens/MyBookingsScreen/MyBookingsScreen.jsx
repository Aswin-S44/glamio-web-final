import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar, Clock, MapPin, Star, ChevronRight, Sparkles,
  CheckCircle, XCircle, AlertCircle, Package, ArrowRight
} from "lucide-react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { BASE_URL } from "../../constants/urls";
import { useAuth } from "../../context/AuthContext";
import "./MyBookingsScreen.css";

const DUMMY_BOOKINGS = [
  {
    id: 1,
    status: "confirmed",
    shopName: "Glamour Studio",
    shopAddress: "12, MG Road, Bangalore",
    shopImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200",
    expertName: "Priya Sharma",
    date: "2026-05-05",
    time: "11:00",
    services: [{ name: "Hair Smoothing", duration: 90, rate: 1200 }, { name: "Hair Wash", duration: 20, rate: 200 }],
    total: 1400,
  },
  {
    id: 2,
    status: "completed",
    shopName: "The Glow Lab",
    shopAddress: "8, Koramangala, Bangalore",
    shopImage: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=200",
    expertName: "Anjali Rao",
    date: "2026-04-20",
    time: "14:00",
    services: [{ name: "Bridal Makeup", duration: 120, rate: 3500 }],
    total: 3500,
  },
  {
    id: 3,
    status: "cancelled",
    shopName: "Velvet Beauty Lounge",
    shopAddress: "45, Indiranagar, Bangalore",
    shopImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200",
    expertName: "Sunita Verma",
    date: "2026-04-10",
    time: "16:30",
    services: [{ name: "Facial", duration: 60, rate: 800 }],
    total: 800,
  },
];

const STATUS_CONFIG = {
  confirmed: { label: "Confirmed", icon: <CheckCircle size={14} />, color: "green" },
  pending: { label: "Pending", icon: <AlertCircle size={14} />, color: "amber" },
  completed: { label: "Completed", icon: <CheckCircle size={14} />, color: "blue" },
  cancelled: { label: "Cancelled", icon: <XCircle size={14} />, color: "red" },
};

const TABS = ["All", "Confirmed", "Completed", "Cancelled"];

export default function MyBookingsScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [usingDummy, setUsingDummy] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(`${BASE_URL}/customer/appointments`, {
          headers: { Authorization: token },
        });
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        const list = data.appointments || data || [];
        if (list.length > 0) {
          setBookings(list);
        } else {
          setBookings(DUMMY_BOOKINGS);
          setUsingDummy(true);
        }
      } catch {
        setBookings(DUMMY_BOOKINGS);
        setUsingDummy(true);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [token]);

  const filtered = bookings.filter((b) => {
    if (activeTab === "All") return true;
    return b.status?.toLowerCase() === activeTab.toLowerCase();
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
  };

  const formatTime = (t) => {
    if (!t) return "";
    const [h, m] = t.split(":");
    const d = new Date();
    d.setHours(+h, +m);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  return (
    <div className="bookings-page">
      <Header />

      <div className="bookings-hero">
        <div className="bookings-hero-inner">
          <span className="bookings-hero-tag"><Calendar size={14} /> My Bookings</span>
          <h1>Your Appointments</h1>
          <p>Track and manage all your beauty appointments</p>
        </div>
      </div>

      <div className="bookings-body">
        <div className="bookings-tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`bookings-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              <span className="tab-count">
                {tab === "All"
                  ? bookings.length
                  : bookings.filter((b) => b.status?.toLowerCase() === tab.toLowerCase()).length}
              </span>
            </button>
          ))}
        </div>

        {/* {usingDummy && (
          <div className="demo-notice">
            <Sparkles size={14} />
            Demo data — sign in and connect backend to see your real bookings
          </div>
        )} */}

        {loading ? (
          <div className="bookings-list">
            {[1, 2, 3].map((i) => (
              <div key={i} className="booking-card-skeleton">
                <div className="bskel-img" />
                <div className="bskel-body">
                  <div className="bskel-line" />
                  <div className="bskel-line short" />
                  <div className="bskel-line tiny" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bookings-empty">
            <Package size={56} />
            <h3>No {activeTab !== "All" ? activeTab.toLowerCase() : ""} bookings</h3>
            <p>
              {activeTab === "All"
                ? "You haven't made any appointments yet"
                : `You have no ${activeTab.toLowerCase()} appointments`}
            </p>
            <button className="btn" onClick={() => navigate("/shops")}>
              Explore Salons <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="bookings-list">
            {filtered.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                formatDate={formatDate}
                formatTime={formatTime}
                onRebook={() => navigate(`/parlour/${booking.shopId || booking.shop?.id || 1}`)}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

function BookingCard({ booking, formatDate, formatTime, onRebook }) {
  const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.confirmed;
  const services = booking.services || booking.appointmentServices || [];
  const shopName = booking.shopName || booking.shop?.parlourName || "Salon";
  const shopAddress = booking.shopAddress || booking.shop?.address || "";
  const shopImage = booking.shopImage || booking.shop?.profileImage ||
    "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=200";
  const expertName = booking.expertName || booking.expert?.name || "";
  const date = booking.date || booking.slot?.slotDate || "";
  const time = booking.time || booking.slot?.startTime || "";
  const total = booking.total || services.reduce((s, sv) => s + (sv.rate || sv.price || 0), 0);

  return (
    <div className={`booking-card status-${status.color}`}>
      <div className="booking-card-left">
        <img src={shopImage} alt={shopName} className="booking-shop-img"
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=200"; }} />
      </div>

      <div className="booking-card-center">
        <div className="booking-top-row">
          <h3 className="booking-shop-name">{shopName}</h3>
          <span className={`booking-status-badge status-${status.color}`}>
            {status.icon} {status.label}
          </span>
        </div>

        <div className="booking-meta">
          {shopAddress && (
            <span className="booking-meta-item">
              <MapPin size={13} /> {shopAddress.substring(0, 45)}
            </span>
          )}
          {expertName && (
            <span className="booking-meta-item">
              <Star size={13} /> {expertName}
            </span>
          )}
          <span className="booking-meta-item">
            <Calendar size={13} /> {formatDate(date)}
          </span>
          <span className="booking-meta-item">
            <Clock size={13} /> {formatTime(time)}
          </span>
        </div>

        <div className="booking-services">
          {services.slice(0, 3).map((s, i) => (
            <span key={i} className="booking-service-chip">{s.name}</span>
          ))}
          {services.length > 3 && (
            <span className="booking-service-chip more">+{services.length - 3} more</span>
          )}
        </div>
      </div>

      <div className="booking-card-right">
        <div className="booking-total">
          <span className="total-label">Total</span>
          <span className="total-amount">₹{total.toLocaleString()}</span>
        </div>

        {booking.status === "completed" && (
          <button className="rebook-btn" onClick={onRebook}>
            Rebook <ChevronRight size={14} />
          </button>
        )}
        {(booking.status === "confirmed" || booking.status === "pending") && (
          <button className="view-btn" onClick={onRebook}>
            View <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
