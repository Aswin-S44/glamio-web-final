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
} from "lucide-react";
import "../UserRequests/UserRequests.css";
import NotFound from "../../components/NotFound/NotFound";
import { BASE_URL } from "../../constants/urls";

const STATUS = {
  3: { label: "Accepted", class: "status-approved" },
};

function AppointmentScreen() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selected, setSelected] = useState(null);

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
          filteredAndSortedData.map((item) => (
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
                <span className="status-badge status-approved">Confirmed</span>
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
                    <span className="bold-price">₹{item.appointment.rate}</span>
                  </div>
                </div>
              </div>

              <div className="card-actions-row">
                <button
                  className="btn-action-view"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => setSelected(item)}
                >
                  <Eye size={16} /> View Full Details
                </button>
              </div>
            </div>
          ))
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
                      {selected.appointment.serviceIds.map((id) => (
                        <span key={id} className="service-tag">
                          Service {id}
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

              <div className="drawer-total">
                <div className="total-label">Grand Total</div>
                <div className="total-value">₹{selected.appointment.rate}</div>
              </div>
            </div>

            <div className="drawer-footer">
              <button className="f-btn-close" onClick={() => setSelected(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppointmentScreen;
