import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
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
  Ban,
  RefreshCw,
  Hourglass,
} from "lucide-react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { BASE_URL, DEFAULT_NO_IMAGE } from "../../constants/urls";
import { useAuth } from "../../context/AuthContext";
import { apiRequest, normalizeCustomerBooking } from "../../utils/api.util";
import { buildShopUrl } from "../../utils/shopUrl.util";
import "./MyBookingsScreen.css";

const MODIFIABLE_STATUSES = ["pending", "accepted", "confirmed", "on_hold"];

const getShopMapUrl = (shop) => {
  if (!shop) return null;
  if (shop.latitude && shop.longitude) {
    return `https://www.google.com/maps/search/?api=1&query=${shop.latitude},${shop.longitude}`;
  }
  if (shop.address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      shop.address
    )}`;
  }
  return null;
};

const canModifyBooking = (bookingDate, startTime) => {
  if (!bookingDate || !startTime) return false;

  const now = new Date();
  const [hours, minutes] = startTime.split(":");
  const bookingDateTime = new Date(bookingDate);
  bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  const diffInHours = (bookingDateTime - now) / (1000 * 60 * 60);

  if (bookingDateTime.toDateString() === now.toDateString()) {
    return diffInHours > 2;
  }

  return bookingDateTime > now;
};

const isBookingExpired = (bookingDate, startTime, status) => {
  if (status !== "pending" && status !== "on_hold") return false;
  if (!bookingDate || !startTime) return false;

  const now = new Date();
  const [hours, minutes] = startTime.split(":");
  const bookingDateTime = new Date(bookingDate);
  bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  return bookingDateTime < now;
};

const getEffectiveStatus = (booking) => {
  const status = booking.status?.toLowerCase();

  const bookingDate = booking.date || booking.slot?.slotDate;
  const startTime = booking.time || booking.slot?.startTime;

  if (isBookingExpired(bookingDate, startTime, status)) {
    return "expired";
  }

  if (status === "rejected" || status === "cancelled") {
    return "cancelled";
  }

  if (status === "completed") {
    return "completed";
  }

  if (status === "accepted" || status === "confirmed") {
    return "confirmed";
  }

  if (status === "pending" || status === "on_hold") {
    return "pending";
  }

  if (status?.trim() == "") {
    return "shop_rescheduled";
  }

  return status || "pending";
};

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: <AlertCircle size={14} />,
    color: "amber",
  },
  confirmed: {
    label: "Confirmed",
    icon: <CheckCircle size={14} />,
    color: "green",
  },
  completed: {
    label: "Completed",
    icon: <CheckCircle size={14} />,
    color: "blue",
  },
  cancelled: {
    label: "Cancelled",
    icon: <XCircle size={14} />,
    color: "red",
  },
  expired: {
    label: "Expired",
    icon: <Hourglass size={14} />,
    color: "gray",
  },
  accepted: {
    label: "Confirmed",
    icon: <CheckCircle size={14} />,
    color: "green",
  },
  on_hold: {
    label: "Pending",
    icon: <AlertCircle size={14} />,
    color: "amber",
  },
  rejected: {
    label: "Cancelled",
    icon: <XCircle size={14} />,
    color: "red",
  },
  shop_rescheduled: {
    label: "Shop Rescheduled",
    icon: <XCircle size={14} />,
    color: "red",
  },
  customer_rescheduled: {
    label: "Customer Rescheduled",
    icon: <XCircle size={14} />,
    color: "red",
  },
};

const TABS = [
  "All",
  "Pending",
  "Confirmed",
  "Completed",
  "Cancelled",
  "Expired",
];

export default function MyBookingsScreen() {
  console.log("5555555555555");
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reschedulingBooking, setReschedulingBooking] = useState(null);

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

  const handleCancel = async (booking) => {
    const effectiveStatus = getEffectiveStatus(booking);
    if (effectiveStatus === "expired") {
      await Swal.fire({
        icon: "error",
        title: "Cannot Cancel",
        text: "This appointment has already expired.",
        confirmButtonColor: "#c2185b",
      });
      return;
    }

    const bookingDate = booking.date || booking.slot?.slotDate;
    const startTime = booking.time || booking.slot?.startTime;

    if (!canModifyBooking(bookingDate, startTime)) {
      await Swal.fire({
        icon: "error",
        title: "Cannot Cancel",
        text: "Appointments can only be cancelled at least 2 hours before the scheduled time or for future dates.",
        confirmButtonColor: "#c2185b",
      });
      return;
    }

    const result = await Swal.fire({
      icon: "warning",
      title: "Cancel this appointment?",
      text: "This action cannot be undone. The shop will be notified.",
      showCancelButton: true,
      confirmButtonColor: "#c2185b",
      confirmButtonText: "Yes, cancel it",
      cancelButtonText: "Keep appointment",
    });

    if (!result.isConfirmed) return;

    try {
      await apiRequest(`/customer/appointments/${booking.id}/cancel`, {
        method: "PATCH",
      });

      setBookings((prev) =>
        prev.map((item) =>
          item.id === booking.id ? { ...item, status: "rejected" } : item
        )
      );
      setSelectedBooking(null);

      Swal.fire({
        icon: "success",
        title: "Appointment cancelled",
        confirmButtonColor: "#c2185b",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Unable to cancel",
        text: err.message || "Something went wrong. Please try again.",
        confirmButtonColor: "#c2185b",
      });
    }
  };

  const handleRescheduleConfirm = async (booking, slot) => {
    const effectiveStatus = getEffectiveStatus(booking);
    if (effectiveStatus === "expired") {
      Swal.fire({
        icon: "error",
        title: "Cannot Reschedule",
        text: "This appointment has already expired.",
        confirmButtonColor: "#c2185b",
      });
      return;
    }

    try {
      const res = await apiRequest(
        `/customer/appointments/${booking.id}/reschedule`,
        {
          method: "PATCH",
          body: JSON.stringify({ slotId: slot.id }),
        }
      );

      setBookings((prev) =>
        prev.map((item) =>
          item.id === booking.id
            ? {
                ...item,
                status: "pending",
                slot: res?.appointment?.slot || slot,
              }
            : item
        )
      );
      setReschedulingBooking(null);
      setSelectedBooking(null);

      Swal.fire({
        icon: "success",
        title: "Appointment rescheduled",
        text: "Your request has been sent to the shop for approval.",
        confirmButtonColor: "#c2185b",
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Unable to reschedule",
        text: err.message || "Something went wrong. Please try again.",
        confirmButtonColor: "#c2185b",
      });
    }
  };

  const handleAcceptReschedule = async (booking, slot) => {
    const effectiveStatus = getEffectiveStatus(booking);
    if (effectiveStatus === "expired") {
      Swal.fire({
        icon: "error",
        title: "Cannot Reschedule",
        text: "This appointment has already expired.",
        confirmButtonColor: "#c2185b",
      });
      return;
    }

    try {
      const res = await apiRequest(
        `/customer/appointment/${booking.id}/accept-reschedule-request`,
        {
          method: "PATCH",
          // body: JSON.stringify({ slotId: slot.id }),
        }
      );

      setBookings((prev) =>
        prev.map((item) =>
          item.id === booking.id
            ? {
                ...item,
                status: "confirmed",
                slot: res?.appointment?.slot || slot,
              }
            : item
        )
      );
      setReschedulingBooking(null);
      setSelectedBooking(null);

      Swal.fire({
        icon: "success",
        title: "Appointment accepted",
        text: "Rechedule request is accepted",
        confirmButtonColor: "#c2185b",
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Unable to reschedule",
        text: err.message || "Something went wrong. Please try again.",
        confirmButtonColor: "#c2185b",
      });
    }
  };

  const STATUS_TAB_MAP = {
    Confirmed: ["confirmed", "accepted"],
    Cancelled: ["cancelled", "rejected"],
    Pending: ["pending", "on_hold"],
    Completed: ["completed"],
    Expired: ["expired"],
  };

  const filtered = bookings.filter((booking) => {
    if (activeTab === "All") return true;
    const effectiveStatus = getEffectiveStatus(booking);
    const allowed = STATUS_TAB_MAP[activeTab] || [activeTab.toLowerCase()];
    return allowed.includes(effectiveStatus);
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
                      const effectiveStatus = getEffectiveStatus(booking);
                      const allowed = STATUS_TAB_MAP[tab] || [
                        tab.toLowerCase(),
                      ];
                      return allowed.includes(effectiveStatus);
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
            <p>
              Your upcoming and past appointments will appear here after login.
            </p>
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
            <h3>
              No {activeTab !== "All" ? activeTab.toLowerCase() : ""} bookings
            </h3>
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
                  navigate(buildShopUrl(booking.shop || { id: booking.shopId }))
                }
                onView={() => setSelectedBooking(booking)}
                onCancel={() => handleCancel(booking)}
                onReschedule={() => setReschedulingBooking(booking)}
                canModifyBooking={canModifyBooking}
                getEffectiveStatus={getEffectiveStatus}
                approveRescchedule={() => handleAcceptReschedule(booking)}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />

      {selectedBooking && (
        <AppointmentDetailModal
          booking={selectedBooking}
          formatDate={formatDate}
          formatTime={formatTime}
          onClose={() => setSelectedBooking(null)}
          onCancel={() => handleCancel(selectedBooking)}
          onReschedule={() => setReschedulingBooking(selectedBooking)}
          canModifyBooking={canModifyBooking}
          getEffectiveStatus={getEffectiveStatus}
        />
      )}

      {reschedulingBooking && (
        <RescheduleModal
          booking={reschedulingBooking}
          formatDate={formatDate}
          formatTime={formatTime}
          onClose={() => setReschedulingBooking(null)}
          onConfirm={(slot) =>
            handleRescheduleConfirm(reschedulingBooking, slot)
          }
          getEffectiveStatus={getEffectiveStatus}
        />
      )}
    </div>
  );
}

function AppointmentDetailModal({
  booking,
  formatDate,
  formatTime,
  onClose,
  onCancel,
  onReschedule,
  canModifyBooking,
  getEffectiveStatus,
}) {
  const effectiveStatus = getEffectiveStatus(booking);

  const status = STATUS_CONFIG[effectiveStatus] || STATUS_CONFIG.pending;
  const bookingDate = booking.date || booking.slot?.slotDate;
  const startTime = booking.time || booking.slot?.startTime;
  const canModify =
    MODIFIABLE_STATUSES.includes(booking.status?.toLowerCase()) &&
    effectiveStatus !== "expired" &&
    canModifyBooking(bookingDate, startTime);
  const services = booking.services || booking.appointmentServices || [];
  const shopName = booking.shopName || booking.shop?.parlourName || "Salon";
  const shopAddress = booking.shopAddress || booking.shop?.address || "";
  const expertName = booking.expertName || booking.expert?.name || "";
  const date = booking.date || booking.slot?.slotDate || "";
  const time = booking.time || booking.slot?.startTime || "";
  const endTime = booking.slot?.endTime || "";
  const total =
    booking.total ||
    booking.rate ||
    services.reduce((sum, s) => sum + (s.rate || s.price || 0), 0);

  return (
    <div className="apt-modal-overlay" onClick={onClose}>
      <div className="apt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="apt-modal-header">
          <h2>Appointment Details</h2>
          <button className="apt-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="apt-modal-body">
          <div className="apt-detail-row">
            <span className="apt-label">Shop</span>
            <span className="apt-value">{shopName}</span>
          </div>
          {shopAddress && (
            <div className="apt-detail-row">
              <span className="apt-label">Address</span>
              <span className="apt-value">
                {shopAddress}
                {getShopMapUrl(booking.shop) && (
                  <a
                    href={getShopMapUrl(booking.shop)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="apt-map-link"
                  >
                    <MapPin size={13} /> View on map
                  </a>
                )}
              </span>
            </div>
          )}
          {expertName && (
            <div className="apt-detail-row">
              <span className="apt-label">Expert</span>
              <span className="apt-value">{expertName}</span>
            </div>
          )}
          <div className="apt-detail-row">
            <span className="apt-label">Date</span>
            <span className="apt-value">{formatDate(date)}</span>
          </div>
          <div className="apt-detail-row">
            <span className="apt-label">Time</span>
            <span className="apt-value">
              {formatTime(time)}
              {endTime ? ` – ${formatTime(endTime)}` : ""}
            </span>
          </div>
          <div className="apt-detail-row">
            <span className="apt-label">Status</span>
            <span className={`booking-status-badge status-${status.color}`}>
              {status.icon} {status.label}
            </span>
          </div>
          {services.length > 0 && (
            <div className="apt-detail-row apt-services-row">
              <span className="apt-label">Services</span>
              <div className="apt-services">
                {services.map((s, i) => (
                  <span key={i} className="booking-service-chip">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="apt-detail-row apt-total-row">
            <span className="apt-label">Total</span>
            <span className="apt-total">
              Rs {Number(total || 0).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="apt-modal-footer">
          {canModify && (
            <>
              <button className="apt-reschedule-btn" onClick={onReschedule}>
                <RefreshCw size={14} /> Reschedule
              </button>
              <button className="apt-cancel-btn" onClick={onCancel}>
                <Ban size={14} /> Cancel Booking
              </button>
            </>
          )}
          <button className="apt-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function BookingCard({
  booking,
  formatDate,
  formatTime,
  onRebook,
  onView,
  onCancel,
  onReschedule,
  canModifyBooking,
  getEffectiveStatus,
  approveRescchedule,
}) {
  const effectiveStatus = getEffectiveStatus(booking);

  const status = STATUS_CONFIG[effectiveStatus] || STATUS_CONFIG.pending;
  const bookingDate = booking.date || booking.slot?.slotDate;
  const startTime = booking.time || booking.slot?.startTime;
  const canModify =
    MODIFIABLE_STATUSES.includes(booking.status?.toLowerCase()) &&
    effectiveStatus !== "expired" &&
    canModifyBooking(bookingDate, startTime);
  const services = booking.services || booking.appointmentServices || [];
  const shopName = booking.shopName || booking.shop?.parlourName || "Salon";
  const shopAddress = booking.shopAddress || booking.shop?.address || "";
  const shopImage =
    booking.shopImage ||
    booking.shop?.shopImage ||
    booking.shop?.profileImage ||
    DEFAULT_NO_IMAGE;
  const expertName = booking.expertName || booking.expert?.name || "";
  const date = booking.date || booking.slot?.slotDate || "";
  const time = booking.time || booking.slot?.startTime || "";
  const total =
    booking.total ||
    booking.rate ||
    services.reduce(
      (sum, service) => sum + (service.rate || service.price || 0),
      0
    );

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
            <span className="booking-service-chip more">
              +{services.length - 3} more
            </span>
          )}
        </div>
      </div>

      <div className="booking-card-right">
        <div className="booking-total">
          <span className="total-label">Total</span>
          <span className="total-amount">
            Rs {Number(total || 0).toLocaleString()}
          </span>
        </div>

        {effectiveStatus === "completed" && (
          <div className="booking-card-actions">
            <button className="view-btn" onClick={onView}>
              View <ChevronRight size={14} />
            </button>
            <button className="rebook-btn" onClick={onRebook}>
              Rebook <ChevronRight size={14} />
            </button>
          </div>
        )}

        {effectiveStatus === "shop_rescheduled" && (
          <div className="booking-card-actions">
            <button className="view-btn" onClick={approveRescchedule}>
              Accept <ChevronRight size={14} />
            </button>
            <button className="rebook-btn" onClick={onCancel}>
              Reject <ChevronRight size={14} />
            </button>
          </div>
        )}

        {effectiveStatus === "expired" && (
          <div className="booking-card-actions">
            <button className="view-btn" onClick={onView}>
              View <ChevronRight size={14} />
            </button>
            <button className="rebook-btn" onClick={onRebook}>
              Book Again <ChevronRight size={14} />
            </button>
          </div>
        )}

        {(effectiveStatus === "confirmed" ||
          effectiveStatus === "pending" ||
          effectiveStatus === "shop_rescheduled") &&
          !canModify && (
            <button className="view-btn" onClick={onView}>
              View <ChevronRight size={14} />
            </button>
          )}

        {(effectiveStatus === "confirmed" || effectiveStatus === "pending") &&
          canModify && (
            <div className="booking-card-actions">
              <button className="view-btn" onClick={onView}>
                View <ChevronRight size={14} />
              </button>
              <button
                className="reschedule-btn"
                onClick={onReschedule}
                title="Reschedule"
              >
                <RefreshCw size={13} /> Reschedule
              </button>
              <button className="cancel-btn" onClick={onCancel} title="Cancel">
                <Ban size={13} /> Cancel
              </button>
            </div>
          )}

        {effectiveStatus === "cancelled" && (
          <button className="view-btn" onClick={onView}>
            View <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

function RescheduleModal({
  booking,
  formatDate,
  formatTime,
  onClose,
  onConfirm,
  getEffectiveStatus,
}) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const shopId = booking.shopId || booking.shop?.id;
  const currentSlotId = booking.slot?.id;

  useEffect(() => {
    const effectiveStatus = getEffectiveStatus(booking);
    if (effectiveStatus === "expired") {
      setError("This appointment has expired and cannot be rescheduled.");
      setLoading(false);
      return;
    }

    const fetchSlots = async () => {
      if (!shopId) {
        setError("Unable to find this shop's slots.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}/customer/slots/${shopId}`);
        if (!res.ok) throw new Error("Failed to load available slots.");
        const data = await res.json();
        const list = Array.isArray(data?.slots) ? data.slots : [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = list.filter((slot) => {
          if (slot.id === currentSlotId) return false;
          if (!slot.isAvailable) return false;
          const slotDate = new Date(slot.slotDate);
          return slotDate >= today;
        });

        upcoming.sort((a, b) => {
          if (a.slotDate !== b.slotDate)
            return a.slotDate < b.slotDate ? -1 : 1;
          return a.startTime < b.startTime ? -1 : 1;
        });

        setSlots(upcoming);
      } catch (err) {
        setError(err.message || "Failed to load available slots.");
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [shopId, currentSlotId, booking, getEffectiveStatus]);

  const handleConfirm = async () => {
    if (!selectedSlot) return;
    setSubmitting(true);
    await onConfirm(selectedSlot);
    setSubmitting(false);
  };

  return (
    <div className="apt-modal-overlay" onClick={onClose}>
      <div
        className="apt-modal reschedule-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="apt-modal-header">
          <h2>Reschedule Appointment</h2>
          <button className="apt-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="apt-modal-body">
          <div className="apt-detail-row">
            <span className="apt-label">Current Slot</span>
            <span className="apt-value">
              {formatDate(booking.slot?.slotDate)} ·{" "}
              {formatTime(booking.slot?.startTime)}
            </span>
          </div>

          <p className="reschedule-instruction">Choose a new available slot:</p>

          {loading ? (
            <p className="reschedule-status">Loading available slots…</p>
          ) : error ? (
            <p className="reschedule-status error">{error}</p>
          ) : slots.length === 0 ? (
            <p className="reschedule-status">
              No other available slots right now. Please try again later.
            </p>
          ) : (
            <div className="reschedule-slot-grid">
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  className={`reschedule-slot-chip ${
                    selectedSlot?.id === slot.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedSlot(slot)}
                >
                  <span className="reschedule-slot-date">
                    {formatDate(slot.slotDate)}
                  </span>
                  <span className="reschedule-slot-time">
                    {formatTime(slot.startTime)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="apt-modal-footer">
          <button className="apt-close-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="apt-reschedule-confirm-btn"
            onClick={handleConfirm}
            disabled={!selectedSlot || submitting || !!error}
          >
            {submitting ? "Rescheduling…" : "Confirm New Slot"}
          </button>
        </div>
      </div>
    </div>
  );
}
