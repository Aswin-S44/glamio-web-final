import React, { useEffect, useState, useMemo } from "react";
import Swal from "sweetalert2";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  Clock,
  User,
  Scissors,
  ArrowUpDown,
  Mail,
  Phone,
  Hash,
  IndianRupee,
} from "lucide-react";
import "./UserRequests.css";
import NotFound from "../../components/NotFound/NotFound";
import { BASE_URL } from "../../constants/urls";

const STATUS = {
  1: { label: "Pending", class: "status-pending" },
  2: { label: "Rejected", class: "status-rejected" },
  3: { label: "Accepted", class: "status-approved" },
  4: { label: "On Hold", class: "status-onhold" },
};

function UserRequests() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selected, setSelected] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUserRequests();
  }, [token]);

  const fetchUserRequests = async () => {
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
    let result = [...appointments];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.customer.username.toLowerCase().includes(term) ||
          item.appointment.id.toString().includes(term) ||
          item.expert.name.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(
        (item) => item.appointment.statusId.toString() === statusFilter
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
  }, [appointments, searchTerm, statusFilter, sortBy]);

  const handleApprove = (id) => {
    Swal.fire({
      title: "Confirm Approval",
      text: "Do you want to approve this appointment request?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d4a373",
      cancelButtonColor: "#f44336",
      confirmButtonText: "Yes, Approve it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.showLoading();
          const res = await fetch(`${BASE_URL}/appointments/${id}/approve`, {
            method: "PATCH",
            headers: {
              Authorization: `${token}`,
              "Content-Type": "application/json",
            },
          });

          if (res.ok) {
            updateStatusOnServer(id, 3);
            Swal.fire({
              title: "Approved!",
              text: "Appointment has been confirmed successfully.",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
            });
          } else {
            const data = await res.json();
            Swal.fire(
              "Error",
              data.message || "Failed to approve appointment",
              "error"
            );
          }
        } catch (error) {
          Swal.fire("Error", "Server connection failed", "error");
        }
      }
    });
  };

  const openRejectModal = (item) => {
    setSelected(item);
    setShowRejectModal(true);
  };

  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) {
      return Swal.fire(
        "Error",
        "Please provide a reason for rejection",
        "error"
      );
    }
    updateStatusOnServer(selected.appointment.id, 2, rejectReason);
    setShowRejectModal(false);
    setRejectReason("");
    Swal.fire("Rejected", "The request has been declined.", "info");
  };

  const updateStatusOnServer = (id, statusId, reason = "") => {
    setAppointments((prev) =>
      prev.map((item) =>
        item.appointment.id === id
          ? { ...item, appointment: { ...item.appointment, statusId, reason } }
          : item
      )
    );
    setSelected(null);
  };

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
          <h1>Booking Requests</h1>
          <p>
            You have{" "}
            {appointments.filter((a) => a.appointment.statusId === 1).length}{" "}
            pending appointments to review
          </p>
        </div>
        <div className="header-stats">
          <div className="stat-pill">
            <span className="label">Total Bookings</span>
            <span className="value">{appointments.length}</span>
          </div>
        </div>
      </header>

      <div className="control-panel">
        <div className="search-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search by customer name, expert or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-wrapper">
          <div className="filter-item">
            <Filter size={18} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="1">Pending</option>
              <option value="3">Approved</option>
              <option value="2">Rejected</option>
            </select>
          </div>

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
            <p>Fetching requests...</p>
          </div>
        ) : filteredAndSortedData.length === 0 ? (
          <NotFound />
        ) : (
          filteredAndSortedData.map((item) => (
            <div
              className={`request-card status-border-${item.appointment.statusId}`}
              key={item.appointment.id}
            >
              <div className="card-top">
                <div className="customer-brief">
                  <div className="avatar-wrapper">
                    <img
                      src={item.customer.profileImage}
                      alt=""
                      className="customer-avatar"
                    />
                    <div className="status-indicator"></div>
                  </div>
                  <div>
                    <h4>{item.customer.username}</h4>
                    <span className="order-tag">
                      #ORD-{item.appointment.id}
                    </span>
                  </div>
                </div>
                <span
                  className={`status-badge ${
                    STATUS[item.appointment.statusId].class
                  }`}
                >
                  {STATUS[item.appointment.statusId].label}
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
                    <span className="bold-price">₹{item.appointment.rate}</span>
                  </div>
                </div>
              </div>

              <div className="card-actions-row">
                <button
                  className="btn-action-view"
                  onClick={() => setSelected(item)}
                >
                  <Eye size={16} /> View Details
                </button>
                {item.appointment.statusId === 1 && (
                  <div className="quick-actions">
                    <button
                      className="btn-quick-approve"
                      onClick={() => handleApprove(item.appointment.id)}
                    >
                      <CheckCircle size={18} />
                    </button>
                    <button
                      className="btn-quick-reject"
                      onClick={() => openRejectModal(item)}
                    >
                      <XCircle size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {selected && !showRejectModal && (
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
                  src={selected.customer.profileImage}
                  alt=""
                  className="large-avatar"
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
              {selected.appointment.statusId === 1 ? (
                <>
                  <button
                    className="f-btn-reject"
                    onClick={() => openRejectModal(selected)}
                  >
                    Reject
                  </button>
                  <button
                    className="f-btn-approve"
                    onClick={() => handleApprove(selected.appointment.id)}
                  >
                    Approve Booking
                  </button>
                </>
              ) : (
                <button
                  className="f-btn-close"
                  onClick={() => setSelected(null)}
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="modal-overlay">
          <div className="reject-modal">
            <div className="modal-header">
              <XCircle size={24} color="#dc2626" />
              <h3>Decline Appointment</h3>
            </div>
            <p>
              Reason for rejecting{" "}
              <strong>#ORD-{selected.appointment.id}</strong>
            </p>
            <textarea
              placeholder="Provide a specific reason (e.g. Stylist unavailable, shop closed for maintenance)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="modal-btns">
              <button
                className="modal-cancel"
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </button>
              <button className="modal-confirm" onClick={handleRejectSubmit}>
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserRequests;
