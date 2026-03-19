import React, { useEffect, useState } from "react";
import "./BookingSummaryScreen.css";
import Header from "../../../components/Header/Header";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import Swal from "sweetalert2";
import { BASE_URL } from "../../../constants/urls";

function BookingSummaryScreen() {
  const [searchParams] = useSearchParams();
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const shopId = Number(searchParams.get("shopId"));
  const slotId = Number(searchParams.get("slotId"));
  const expertId = Number(searchParams.get("expertId"));
  const rawServiceId = searchParams.get("serviceId");

  const token = localStorage.getItem("token");

  const serviceIds = rawServiceId
    ? rawServiceId.split(",").map(Number).filter(Boolean)
    : [];

  useEffect(() => {
    const fetchOrderSummary = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${BASE_URL}/customer/order/summary/${shopId}/${slotId}/${expertId}?serviceId=${rawServiceId}`,
          { method: "GET" }
        );
        if (!res.ok) throw new Error("Failed to fetch booking summary");
        const data = await res.json();
        setSummaryData(data);
      } catch (error) {
        console.error("Error fetching summary:", error);
      } finally {
        setLoading(false);
      }
    };

    if (shopId && slotId && expertId) fetchOrderSummary();
  }, [shopId, slotId, expertId, rawServiceId]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
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
    const res = await fetch(`${BASE_URL}/customer/booking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ shopId, slotId, expertId, serviceIds }),
    });

    if (res && res.status === 201) {
      Swal.fire({
        title: "Appointment Confirmed!",
        text: "We've sent the details to your email.",
        icon: "success",
        confirmButtonColor: "#D41172",
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Slot Unavailable",
        text: "This time slot is no longer available or you have a pending booking.",
        confirmButtonColor: "#1a1a1a",
      });
    }
  };

  if (loading)
    return (
      <div className="loader-container">
        <div className="salon-loader"></div>
      </div>
    );

  return (
    <div className="booking-page">
      <Header />
      <main className="booking-content">
        <div className="booking-grid">
          <div className="booking-main-col">
            <section className="booking-card hero-card">
              <div className="hero-overlay">
                <span className="status-pill">Final Step</span>
                <h1>{summaryData?.shop?.parlourName}</h1>
                <p className="location-link">
                  <i className="fa-solid fa-location-dot"></i>{" "}
                  {summaryData?.shop?.address}
                </p>
              </div>
            </section>

            <section className="booking-card services-card">
              <h2 className="section-title">Selected Treatments</h2>
              <div className="services-stack">
                {summaryData?.services.map((service, i) => (
                  <div key={i} className="service-item-row">
                    <div className="service-dot"></div>
                    <span className="service-name">{service.name}</span>
                    <span className="service-price">
                      {service.rate || service.price}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="booking-card expert-card">
              <h2 className="section-title">Your Specialist</h2>
              <div className="expert-profile-wide">
                <img
                  src={
                    summaryData?.expert?.image ||
                    "https://via.placeholder.com/80"
                  }
                  alt=""
                />
                <div className="expert-text">
                  <h3>{summaryData?.expert?.name}</h3>
                  <span className="specialist-tag">
                    {summaryData?.expert?.specialist} Specialist
                  </span>
                </div>
                <div className="verified-badge">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23,12L20.56,9.22L20.9,5.54L17.29,4.72L15.4,1.54L12,3L8.6,1.54L6.71,4.72L3.1,5.53L3.44,9.21L1,12L3.44,14.78L3.1,18.47L6.71,19.29L8.6,22.47L12,21L15.4,22.46L17.29,19.28L20.9,18.46L20.56,14.78L23,12M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z" />
                  </svg>
                </div>
              </div>
            </section>
          </div>

          <aside className="booking-sidebar">
            <div className="sticky-sidebar">
              <div className="summary-widget">
                <div className="time-block">
                  <div className="time-item">
                    <small>Date</small>
                    <p>{formatDate(summaryData?.slot?.slotDate)}</p>
                  </div>
                  <div className="time-divider"></div>
                  <div className="time-item">
                    <small>Time</small>
                    <p>{formatTime(summaryData?.slot?.startTime)}</p>
                  </div>
                </div>

                <div className="price-breakdown">
                  <div className="price-row">
                    <span>Subtotal</span>
                    <span>{summaryData?.totalRate.toFixed(2)}</span>
                  </div>
                  <div className="price-row total-highlight">
                    <span>Total</span>
                    <span>{summaryData?.totalRate.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  className="confirm-btn-main"
                  onClick={submitAppointment}
                >
                  Confirm Appointment
                </button>
                <button
                  className="modify-btn-link"
                  onClick={() => window.history.back()}
                >
                  Change Selection
                </button>
              </div>

              <div className="policy-card">
                <h4>Cancellation Policy</h4>
                <p>Free cancellation up to 24 hours before your appointment.</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default BookingSummaryScreen;
