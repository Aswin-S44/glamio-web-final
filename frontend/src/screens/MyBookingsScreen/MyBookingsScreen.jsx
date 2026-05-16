import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  ArrowRight,
} from "lucide-react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { BASE_URL, DEFAULT_NO_IMAGE } from "../../constants/urls";
import { useAuth } from "../../context/AuthContext";
import { normalizeCustomerBooking } from "../../utils/api.util";
import "./MyBookingsScreen.css";

const STATUS_CONFIG = {
  pending: { label: "Pending", icon: <AlertCircle size={14} />, color: "amber" },
  accepted: {
    label: "Confirmed",
    icon: <CheckCircle size={14} />,
    color: "green",
  },
  completed: {
    label: "Completed",
    icon: <CheckCircle size={14} />,
    color: "blue",
  },
  rejected: {
    label: "Cancelled",
    icon: <XCircle size={14} />,
    color: "red",
  },
  on_hold: { label: "On Hold", icon: <AlertCircle size={14} />, color: "amber" },
  confirmed: {
    label: "Confirmed",
    icon: <CheckCircle size={14} />,
    color: "green",
  },
  cancelled: {
    label: "Cancelled",
    icon: <XCircle size={14} />,
    color: "red",
  },
};

const TABS = ["All", "Pending", "Confirmed", "Completed", "Cancelled"];

export default function MyBookingsScreen() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchBookings = async () => {
      if (!token) {
        setBookings([]);
        setLoading(false);
        return;
      }

      try {
        setError("");
        const res = await fetch(`${BASE_URL}/customer/appointments`, {
          headers: { Authorization: token },
        });

        if (!res.ok) {
          throw new Error("Failed to load your bookings.");
        }

        const data = await res.json();
        const list = Array.isArray(data?.data) ? data.data : [];
        setBookings(list.map(normalizeCustomerBooking));
      } catch (err) {
        setBookings([]);
        setError(err.message || "Failed to load your bookings.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [token]);

  const STATUS_TAB_MAP = {
    Confirmed: ["accepted", "confirmed"],
    Cancelled: ["rejected", "cancelled"],
    Pending: ["pending", "on_hold"],
    Completed: ["completed"],
  };

  const filtered = bookings.filter((booking) => {
    if (activeTab === "All") return true;
    const allowed = STATUS_TAB_MAP[activeTab] || [activeTab.toLowerCase()];
    return allowed.includes(booking.status?.toLowerCase());
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(+hours, +minutes);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="bookings-page">
      <Header />

      <div className="bookings-hero">
        <div className="bookings-hero-inner">
          <span className="bookings-hero-tag">
            <Calendar size={14} /> My Bookings
          </span>
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
                  : bookings.filter((booking) => {
                      const allowed = STATUS_TAB_MAP[tab] || [tab.toLowerCase()];
                      return allowed.includes(booking.status?.toLowerCase());
                    }).length}
              </span>
            </button>
          ))}
        </div>

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
        ) : !isAuthenticated ? (
          <div className="bookings-empty">
            <Package size={56} />
            <h3>Sign in to see your bookings</h3>
            <p>Your upcoming and past appointments will appear here after login.</p>
            <button className="btn" onClick={() => navigate("/signin")}>
              Sign In <ArrowRight size={16} />
            </button>
          </div>
        ) : error ? (
          <div className="bookings-empty">
            <Package size={56} />
            <h3>Unable to load bookings</h3>
            <p>{error}</p>
            <button className="btn" onClick={() => window.location.reload()}>
              Try Again
            </button>
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
                onRebook={() =>
                  navigate(`/parlour/${booking.shopId || booking.shop?.id}`)
                }
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
  const shopImage =
    booking.shopImage || booking.shop?.shopImage || booking.shop?.profileImage || DEFAULT_NO_IMAGE;
  const expertName = booking.expertName || booking.expert?.name || "";
  const date = booking.date || booking.slot?.slotDate || "";
  const time = booking.time || booking.slot?.startTime || "";
  const total =
    booking.total ||
    booking.rate ||
    services.reduce((sum, service) => sum + (service.rate || service.price || 0), 0);

  return (
    <div className={`booking-card status-${status.color}`}>
      <div className="booking-card-left">
        <img
          src={shopImage}
          alt={shopName}
          className="booking-shop-img"
          onError={(e) => {
            e.target.src = DEFAULT_NO_IMAGE;
          }}
        />
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
          {services.slice(0, 3).map((service, i) => (
            <span key={i} className="booking-service-chip">
              {service.name}
            </span>
          ))}
          {services.length > 3 && (
            <span className="booking-service-chip more">+{services.length - 3} more</span>
          )}
        </div>
      </div>

      <div className="booking-card-right">
        <div className="booking-total">
          <span className="total-label">Total</span>
          <span className="total-amount">Rs {Number(total || 0).toLocaleString()}</span>
        </div>

        {booking.status === "completed" && (
          <button className="rebook-btn" onClick={onRebook}>
            Rebook <ChevronRight size={14} />
          </button>
        )}
        {(booking.status === "accepted" ||
          booking.status === "confirmed" ||
          booking.status === "pending" ||
          booking.status === "on_hold") && (
          <button className="view-btn" onClick={onRebook}>
            View <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
