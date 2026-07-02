import React, { useEffect, useState, useMemo } from "react";
import {
  Search,
  Calendar,
  Clock,
  Eye,
  Scissors,
  ArrowUpDown,
  Mail,
  Phone,
  IndianRupee,
  MapPin,
  RefreshCw,
  Ban,
  X,
  AlertCircle,
  Users,
} from "lucide-react";
import Swal from "sweetalert2";
import "../UserRequests/UserRequests.css";
import NotFound from "../../components/NotFound/NotFound";
import { BASE_URL } from "../../constants/urls";
import { apiRequest } from "../../utils/api.util";

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

const canModifyAppointment = (slotDate, startTime) => {
  if (!slotDate || !startTime) return false;

  const now = new Date();
  const [hours, minutes] = startTime.split(":");
  const appointmentDateTime = new Date(slotDate);
  appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  const diffInHours = (appointmentDateTime - now) / (1000 * 60 * 60);

  if (appointmentDateTime.toDateString() === now.toDateString()) {
    return diffInHours > 2;
  }

  return appointmentDateTime > now;
};

const STATUS_CONFIG = {
  1: { label: "Pending", class: "status-pending" },
  2: { label: "On Hold", class: "status-onhold" },
  3: { label: "Confirmed", class: "status-approved" },
  4: { label: "Completed", class: "status-completed" },
  5: { label: "Cancelled", class: "status-cancelled" },
  6: { label: "Rejected", class: "status-rejected" },
};

function AppointmentScreen() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selected, setSelected] = useState(null);
  const [reschedulingBooking, setReschedulingBooking] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchConfirmedAppointments();
  }, [token]);

  const fetchConfirmedAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/appointments`, {
        headers: { Authorization: `${token}` },
      });
      const data = await res.json();
      if (data.appointments) {
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointment) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Cancel Appointment?",
      text: `Are you sure you want to cancel appointment #${appointment.appointment.id}?`,
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, cancel it",
      cancelButtonText: "No, keep it",
    });

    if (!result.isConfirmed) return;

    try {
      await apiRequest(
        `/customer/appointments/${appointment.appointment.id}/cancel`,
        {
          method: "PATCH",
        }
      );

      await fetchConfirmedAppointments();
      setSelected(null);

      Swal.fire({
        icon: "success",
        title: "Cancelled!",
        text: "Appointment has been cancelled successfully.",
        confirmButtonColor: "#d4a373",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to cancel",
        text: err.message || "Something went wrong. Please try again.",
        confirmButtonColor: "#d4a373",
      });
    }
  };

  const fetchAvailableSlots = async (shopId, currentSlotId) => {
    setLoadingSlots(true);
    setSelectedSlot(null);
    try {
      const res = await fetch(`${BASE_URL}/customer/slots/${shopId}`, {
        headers: { Authorization: `${token}` },
      });
      const data = await res.json();
      const slots = data.slots || [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const available = slots.filter((slot) => {
        if (slot.id === currentSlotId) return false;
        if (!slot.isAvailable) return false;
        const slotDate = new Date(slot.slotDate);
        return slotDate >= today;
      });

      available.sort((a, b) => {
        if (a.slotDate !== b.slotDate) {
          return new Date(a.slotDate) - new Date(b.slotDate);
        }
        return a.startTime.localeCompare(b.startTime);
      });

      setAvailableSlots(available);
    } catch (error) {
      console.error(error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleRescheduleAppointment = async () => {
    if (!selectedSlot) return;

    setSubmitting(true);
    try {
      await apiRequest(
        `/shops/${reschedulingBooking.appointment.id}/reschedule`,
        {
          method: "PATCH",
          body: JSON.stringify({ slotId: selectedSlot.id }),
        }
      );

      await fetchConfirmedAppointments();
      setReschedulingBooking(null);
      setSelected(null);
      setSelectedSlot(null);

      Swal.fire({
        icon: "success",
        title: "Rescheduled!",
        text: "Appointment has been rescheduled successfully.",
        confirmButtonColor: "#d4a373",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to reschedule",
        text: err.message || "Something went wrong. Please try again.",
        confirmButtonColor: "#d4a373",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let result = appointments.filter((item) => item.appointment.statusId === 3);

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.customer.username.toLowerCase().includes(term) ||
          item.appointment.id.toString().includes(term) ||
          item.expert.name.toLowerCase().includes(term)
      );
    }

    result.sort((a, b) => {
      if (sortBy === "newest")
        return (
          new Date(b.appointment.createdAt) - new Date(a.appointment.createdAt)
        );
      if (sortBy === "oldest")
        return (
          new Date(a.appointment.createdAt) - new Date(b.appointment.createdAt)
        );
      if (sortBy === "price") return b.appointment.rate - a.appointment.rate;
      return 0;
    });

    return result;
  }, [appointments, searchTerm, sortBy]);

  const formatDateTime = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
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

  const groupSlotsByDate = (slots) => {
    const grouped = {};
    slots.forEach((slot) => {
      const date = slot.slotDate;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(slot);
    });
    return grouped;
  };

  return (
    <div className="admin-requests-container">
      <header className="content-header">
        <div className="header-text">
          <h1>Confirmed Appointments</h1>
          <p>
            You have {filteredAndSortedData.length} active bookings scheduled
          </p>
        </div>
        <div className="header-stats">
          <div className="stat-pill">
            <span className="label">Confirmed</span>
            <span className="value">{filteredAndSortedData.length}</span>
          </div>
        </div>
      </header>

      <div className="control-panel">
        <div className="search-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search confirmed clients or experts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-wrapper">
          <div className="filter-item">
            <ArrowUpDown size={18} />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price">Highest Price</option>
            </select>
          </div>
        </div>
      </div>

      <div className="requests-grid">
        {loading ? (
          <div className="loader-container">
            <div className="spinner"></div>
            <p>Loading schedule...</p>
          </div>
        ) : filteredAndSortedData.length === 0 ? (
          <NotFound />
        ) : (
          filteredAndSortedData.map((item) => {
            const canModify = canModifyAppointment(
              item.slot.slotDate,
              item.slot.startTime
            );

            return (
              <div
                className="request-card status-border-3"
                key={item.appointment.id}
              >
                <div className="card-top">
                  <div className="customer-brief">
                    <div className="avatar-wrapper">
                      <img
                        src={
                          item?.customer?.profileImage ||
                          "https://ui-avatars.com/api/?name=" +
                            item?.customer?.username
                        }
                        alt={item?.customer?.username}
                        className="customer-avatar"
                        referrerPolicy="no-referrer"
                      />
                      <div
                        className="status-indicator"
                        style={{ background: "#2f9e44" }}
                      ></div>
                    </div>
                    <div>
                      <h4>{item.customer.username}</h4>
                      <span className="order-tag">
                        #ORD-{item.appointment.id}
                      </span>
                    </div>
                  </div>
                  <span className="status-badge status-approved">
                    Confirmed
                  </span>
                </div>

                <div className="card-middle">
                  <div className="info-grid">
                    <div className="info-item">
                      <Calendar size={16} />
                      <span>{formatDateTime(item.slot.slotDate)}</span>
                    </div>
                    <div className="info-item">
                      <Clock size={16} />
                      <span>
                        {item.slot.startTime} - {item.slot.endTime}
                      </span>
                    </div>
                    <div className="info-item">
                      <Scissors size={16} />
                      <span>{item.expert.name}</span>
                    </div>
                    <div className="info-item">
                      <IndianRupee size={16} />
                      <span className="bold-price">
                        {item.appointment.rate}
                      </span>
                    </div>

                    <div className="info-item">
                      <Users size={16} />

                      <span>Number of Peoples</span>
                      <span>{item.appointment?.numberOfPeople ?? 0}</span>
                    </div>
                  </div>
                </div>

                <div className="card-actions-row">
                  {canModify ? (
                    <>
                      <button
                        className="btn-action-reschedule"
                        onClick={() => {
                          setReschedulingBooking(item);
                          fetchAvailableSlots(item.slot?.shopId, item.slot?.id);
                        }}
                      >
                        <RefreshCw size={16} /> Reschedule
                      </button>
                      <button
                        className="btn-action-cancel"
                        onClick={() => handleCancelAppointment(item)}
                      >
                        <Ban size={16} /> Cancel
                      </button>
                      <button
                        className="btn-action-view"
                        onClick={() => setSelected(item)}
                      >
                        <Eye size={16} /> View Details
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn-action-view"
                      style={{ width: "100%", justifyContent: "center" }}
                      onClick={() => setSelected(item)}
                    >
                      <Eye size={16} /> View Full Details
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {selected && (
        <div className="side-drawer-overlay" onClick={() => setSelected(null)}>
          <div className="side-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="header-title">
                <h2>Booking Details</h2>
                <span className="id-badge">#{selected.appointment.id}</span>
              </div>
              <button className="close-btn" onClick={() => setSelected(null)}>
                ✕
              </button>
            </div>

            <div className="drawer-body">
              <div className="drawer-section user-card-main">
                <img
                  src={
                    selected.customer.profileImage ||
                    "https://ui-avatars.com/api/?name=" +
                      selected.customer.username
                  }
                  alt={selected.customer.username}
                  className="large-avatar"
                  referrerPolicy="no-referrer"
                />
                <div className="user-info-text">
                  <h3>{selected.customer.username}</h3>
                  <div className="info-line">
                    <Mail size={14} /> {selected.customer.email}
                  </div>
                  <div className="info-line">
                    <Phone size={14} />{" "}
                    {selected.customer.phone || "No contact info"}
                  </div>
                </div>
              </div>

              <div className="drawer-section">
                <h4 className="section-label">Service Information</h4>
                <div className="detail-card">
                  <div className="detail-row">
                    <span className="label-text">Expert Assigned</span>
                    <span className="value-text">{selected.expert.name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label-text">Services</span>
                    <div className="tag-container">
                      {(
                        selected.services ||
                        selected.appointment.serviceIds?.map((id) => ({
                          id,
                          name: `Service ${id}`,
                        })) ||
                        []
                      ).map((service) => (
                        <span key={service.id} className="service-tag">
                          {service.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="drawer-section">
                <h4 className="section-label">Appointment Schedule</h4>
                <div className="detail-card">
                  <div className="detail-row">
                    <span className="label-text">Date</span>
                    <span className="value-text">
                      {new Date(selected.slot.slotDate).toDateString()}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label-text">Time Slot</span>
                    <span className="value-text highlight">
                      {selected.slot.startTime} - {selected.slot.endTime}
                    </span>
                  </div>
                </div>
              </div>

              {selected.shop && (
                <div className="drawer-section">
                  <h4 className="section-label">Shop Location</h4>
                  <div className="detail-card">
                    <div className="detail-row">
                      <span className="label-text">Address</span>
                      <span className="value-text">
                        {selected.shop.address}
                      </span>
                    </div>
                    {getShopMapUrl(selected.shop) && (
                      <a
                        href={getShopMapUrl(selected.shop)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="map-link"
                      >
                        <MapPin size={14} /> View on Google Maps
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="drawer-total">
                <div className="total-label">Grand Total</div>
                <div className="total-value">₹{selected.appointment.rate}</div>
              </div>
            </div>

            <div className="drawer-footer">
              {canModifyAppointment(
                selected.slot?.slotDate,
                selected.slot?.startTime
              ) && (
                <>
                  <button
                    className="f-btn-reschedule"
                    onClick={() => {
                      setReschedulingBooking(selected);
                      fetchAvailableSlots(selected.shop?.id, selected.slot?.id);
                    }}
                  >
                    <RefreshCw size={16} /> Reschedule
                  </button>
                  <button
                    className="f-btn-cancel"
                    onClick={() => handleCancelAppointment(selected)}
                  >
                    <Ban size={16} /> Cancel Booking
                  </button>
                </>
              )}
              <button className="f-btn-close" onClick={() => setSelected(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {reschedulingBooking && (
        <div
          className="side-drawer-overlay"
          onClick={() => {
            setReschedulingBooking(null);
            setSelectedSlot(null);
          }}
        >
          <div
            className="side-drawer reschedule-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-header">
              <div className="header-title">
                <h2>Reschedule Appointment</h2>
                <span className="id-badge">
                  #{reschedulingBooking.appointment.id}
                </span>
              </div>
              <button
                className="close-btn"
                onClick={() => {
                  setReschedulingBooking(null);
                  setSelectedSlot(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className="drawer-body">
              <div className="drawer-section">
                <h4 className="section-label">Current Slot</h4>
                <div className="detail-card">
                  <div className="detail-row">
                    <span className="label-text">Date & Time</span>
                    <span className="value-text">
                      {formatDateTime(reschedulingBooking.slot.slotDate)} ·{" "}
                      {formatTime(reschedulingBooking.slot.startTime)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="drawer-section">
                <h4 className="section-label">Select New Slot</h4>
                {loadingSlots ? (
                  <div className="loader-container">
                    <div className="spinner"></div>
                    <p>Loading available slots...</p>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="no-slots-message">
                    <AlertCircle size={32} />
                    <p>No other available slots found for this shop.</p>
                  </div>
                ) : (
                  <>
                    <div className="slots-container">
                      {Object.entries(groupSlotsByDate(availableSlots)).map(
                        ([date, slots]) => (
                          <div key={date} className="date-group">
                            <div className="date-header">
                              <Calendar size={16} />
                              <span>{formatDateTime(date)}</span>
                            </div>
                            <div className="slots-grid">
                              {slots.map((slot) => (
                                <button
                                  key={slot.id}
                                  className={`slot-card ${
                                    selectedSlot?.id === slot.id
                                      ? "selected"
                                      : ""
                                  }`}
                                  onClick={() => setSelectedSlot(slot)}
                                >
                                  <Clock size={14} />
                                  <span>{formatTime(slot.startTime)}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="drawer-footer">
              <button
                className="f-btn-close"
                onClick={() => {
                  setReschedulingBooking(null);
                  setSelectedSlot(null);
                }}
              >
                Cancel
              </button>
              <button
                className="f-btn-reschedule-confirm"
                onClick={handleRescheduleAppointment}
                disabled={!selectedSlot || submitting}
              >
                {submitting ? "Rescheduling..." : "Confirm Reschedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppointmentScreen;
