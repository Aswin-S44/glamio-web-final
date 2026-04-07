import React, { useEffect, useState } from "react";
import "./BookingSummaryScreen.css";
import Header from "../../../components/Header/Header";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import Swal from "sweetalert2";
import { BASE_URL } from "../../../constants/urls";

function BookingSummaryScreen() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const { user } = useAuth();

  const shopId = Number(searchParams.get("shopId"));
  const slotId = Number(searchParams.get("slotId"));
  const expertId = Number(searchParams.get("expertId"));
  const rawServiceId =
    searchParams.get("services") || searchParams.get("serviceId");

  const token = localStorage.getItem("token");

  // Parse service IDs - handle both single and multiple services
  const getServiceIds = () => {
    if (!rawServiceId) return [];

    try {
      // Try to parse as JSON first (for multiple services)
      if (rawServiceId.startsWith("[")) {
        const parsed = JSON.parse(rawServiceId);
        return parsed.map((id) => Number(id)).filter(Boolean);
      }
      // Handle comma-separated string
      if (rawServiceId.includes(",")) {
        return rawServiceId.split(",").map(Number).filter(Boolean);
      }
      // Single service ID
      return [Number(rawServiceId)].filter(Boolean);
    } catch (error) {
      console.error("Error parsing service IDs:", error);
      return [];
    }
  };

  const serviceIds = getServiceIds();

  useEffect(() => {
    const fetchOrderSummary = async () => {
      if (!shopId || !slotId || !expertId || serviceIds.length === 0) {
        console.error("Missing required parameters:", {
          shopId,
          slotId,
          expertId,
          serviceIds,
        });
        Swal.fire({
          icon: "error",
          title: "Missing Information",
          text: "Unable to load booking summary. Please try again.",
          confirmButtonColor: "#c2185b",
        }).then(() => {
          navigate(-1);
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Build URL with service IDs as comma-separated string
        const serviceIdParam = serviceIds.join(",");
        const url = `${BASE_URL}/customer/order/summary/${shopId}/${slotId}/${expertId}?serviceId=${serviceIdParam}`;

        console.log("Fetching summary from:", url); // Debug log

        const res = await fetch(url, { method: "GET" });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.message || "Failed to fetch booking summary"
          );
        }

        const data = await res.json();
        setSummaryData(data);
      } catch (error) {
        console.error("Error fetching summary:", error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text:
            error.message ||
            "Failed to load booking summary. Please try again.",
          confirmButtonColor: "#c2185b",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderSummary();
  }, [shopId, slotId, expertId, serviceIds.join(",")]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const submitAppointment = async (e) => {
    e.preventDefault();
    setConfirming(true);

    try {
      const res = await fetch(`${BASE_URL}/customer/booking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          shopId,
          slotId,
          expertId,
          serviceIds,
        }),
      });

      if (res && res.status === 201) {
        await Swal.fire({
          title: "Booking Confirmed! 🎉",
          html: `
            <div style="text-align: center;">
              <p style="margin-bottom: 10px;">Your appointment has been successfully scheduled.</p>
              <p style="font-size: 14px; color: #666;">A confirmation email has been sent to your inbox.</p>
            </div>
          `,
          icon: "success",
          confirmButtonColor: "#c2185b",
          confirmButtonText: "View Bookings",
        });
        navigate("/my-bookings");
      } else {
        throw new Error("Booking failed");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Booking Failed",
        text: "This time slot is no longer available or you have a pending booking.",
        confirmButtonColor: "#c2185b",
        confirmButtonText: "Try Again",
      });
    } finally {
      setConfirming(false);
    }
  };

  const calculateSubtotal = () => {
    return (
      summaryData?.services?.reduce(
        (acc, service) => acc + (service.rate || service.price || 0),
        0
      ) || 0
    );
  };

  if (loading) {
    return (
      <div className="booking-page">
        <Header />
        <div className="loader-container">
          <div className="modern-loader">
            <div className="loader-ring"></div>
            <div className="loader-ring"></div>
            <div className="loader-ring"></div>
            <p>Preparing your booking summary...</p>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = calculateSubtotal();

  return (
    <div className="booking-page">
      <Header />
      <main className="booking-content">
        <div className="booking-header">
          <h1>Complete Your Booking</h1>
          <p className="booking-subtitle">
            You're just one step away from relaxation
          </p>
        </div>

        <div className="booking-grid">
          <div className="booking-main-col">
            {/* Shop Info Card */}
            <div className="summary-card shop-card">
              <div className="shop-header">
                <div className="shop-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2z" />
                  </svg>
                </div>
                <div className="shop-info">
                  <h2>{summaryData?.shop?.parlourName}</h2>
                  <p className="shop-address">
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      width="16"
                      height="16"
                    >
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    {summaryData?.shop?.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Selected Services Card */}
            <div className="summary-card services-card">
              <div className="card-header">
                <h3>Selected Services</h3>
                <span className="service-count">
                  {summaryData?.services?.length} items
                </span>
              </div>
              <div className="services-list">
                {summaryData?.services?.map((service, i) => (
                  <div key={i} className="service-item">
                    <div className="service-info">
                      <div className="service-name-wrapper">
                        <span className="service-dot"></span>
                        <span className="service-name">{service.name}</span>
                      </div>
                      {service.duration && (
                        <span className="service-duration">
                          {service.duration} mins
                        </span>
                      )}
                    </div>
                    <span className="service-price">
                      ₹{service.rate || service.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expert Card */}
            {summaryData?.expert && (
              <div className="summary-card expert-card">
                <h3>Your Beauty Expert</h3>
                <div className="expert-profile">
                  <div className="expert-avatar">
                    <img
                      src={
                        summaryData.expert.image ||
                        "https://via.placeholder.com/100"
                      }
                      alt={summaryData.expert.name}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/100";
                      }}
                    />
                    <div className="expert-status"></div>
                  </div>
                  <div className="expert-details">
                    <h4>{summaryData.expert.name}</h4>
                    <p className="expert-specialty">
                      {summaryData.expert.specialist} Specialist
                    </p>
                    <div className="expert-badge">
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        width="16"
                        height="16"
                      >
                        <path d="M23 12l-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12zm-10 5h-2v-2h2v2zm0-4h-2V7h2v6z" />
                      </svg>
                      <span>Verified Professional</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="booking-sidebar">
            <div className="summary-widget">
              {/* Date & Time Selection */}
              <div className="widget-section datetime-section">
                <h4>Date & Time</h4>
                <div className="datetime-display">
                  <div className="date-block">
                    <span className="label">Date</span>
                    <span className="value">
                      {formatDate(summaryData?.slot?.slotDate)}
                    </span>
                  </div>
                  <div className="time-block">
                    <span className="label">Time</span>
                    <span className="value time-value">
                      <span className="time-icon">🕐</span>
                      {formatTime(summaryData?.slot?.startTime)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="widget-section price-section">
                <h4>Price Details</h4>
                <div className="price-breakdown">
                  <div className="price-row">
                    <span>
                      Subtotal ({summaryData?.services?.length} items)
                    </span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="price-row">
                    <span>Service Tax</span>
                    <span>Included</span>
                  </div>
                  <div className="price-row total-row">
                    <span>Total Amount</span>
                    <span className="total-amount">₹{subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="widget-section actions-section">
                <button
                  className="confirm-btn"
                  onClick={submitAppointment}
                  disabled={confirming}
                >
                  {confirming ? (
                    <>
                      <span className="btn-spinner"></span>
                      Confirming...
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </button>

                <button
                  className="modify-btn"
                  onClick={() => window.history.back()}
                  disabled={confirming}
                >
                  ← Modify Selection
                </button>
              </div>

              {/* Policy Info */}
              <div className="policy-info">
                <div className="policy-item">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    width="18"
                    height="18"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  <span>Free cancellation up to 24 hours before</span>
                </div>
                <div className="policy-item">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    width="18"
                    height="18"
                  >
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                  <span>Confirmation email sent instantly</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default BookingSummaryScreen;
