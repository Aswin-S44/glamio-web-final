import React, { useState, useEffect, useCallback } from "react";
import Calendar from "react-calendar";
import { format, parseISO } from "date-fns";
import {
  User,
  Clock,
  CheckCircle2,
  ChevronRight,
  Loader2,
  AlertCircle,
  Calendar as CalendarIcon,
  Star,
  Award,
  ThumbsUp,
  ShoppingBag,
  X,
} from "lucide-react";
import "react-calendar/dist/Calendar.css";
import "./SelectSlotScreen.css";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "../../../components/Header/Header";
import { BASE_URL } from "../../../constants/urls";

function SelectSlotScreen() {
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotsByDate, setSlotsByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [experts, setExperts] = useState([]);
  const [error, setError] = useState("");
  const [bookingProgress, setBookingProgress] = useState(33);
  const [selectedServices, setSelectedServices] = useState([]);
  const [showServicesModal, setShowServicesModal] = useState(false);

  const { id, serviceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Load selected services from session storage or location state
  useEffect(() => {
    const loadSelectedServices = () => {
      // Check if coming from multiple services selection
      const savedServices = sessionStorage.getItem("selectedServices");
      if (savedServices) {
        const services = JSON.parse(savedServices);
        setSelectedServices(services);
        // Clear after loading to prevent stale data
        sessionStorage.removeItem("selectedServices");
      }
      // Check if coming from location state
      else if (location.state?.selectedServices) {
        setSelectedServices(location.state.selectedServices);
      }
      // Single service from URL param
      else if (serviceId) {
        // Fetch service details if only ID is available
        fetchServiceDetails(serviceId);
      }
    };

    loadSelectedServices();
  }, [serviceId, location.state]);

  const fetchServiceDetails = async (serviceId) => {
    try {
      const res = await fetch(`${BASE_URL}/customer/service/${serviceId}`);
      const data = await res.json();
      console.log("DATA----------------", data);
      if (data && data.length > 0) {
        setSelectedServices(data);
      }
    } catch (error) {
      console.error("Failed to fetch service details", error);
    }
  };

  const fetchExperts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/customer/experts/${id}`);
      const data = await res.json();
      if (data.experts) setExperts(data.experts);
    } catch (error) {
      console.error("Failed to fetch experts", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchSlots = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/customer/slots/${id}`);
      const data = await res.json();
      if (data.slots) {
        const grouped = data.slots.reduce((acc, slot) => {
          const dateKey = format(parseISO(slot.slotDate), "yyyy-MM-dd");
          if (!acc[dateKey]) acc[dateKey] = [];
          acc[dateKey].push(slot);
          return acc;
        }, {});
        setSlotsByDate(grouped);
      }
    } catch (error) {
      console.error("Failed to fetch slots", error);
    }
  }, [id]);

  useEffect(() => {
    fetchExperts();
    fetchSlots();
  }, [fetchExperts, fetchSlots]);

  useEffect(() => {
    if (selectedExpert && selectedSlot) {
      setBookingProgress(66);
    } else if (selectedExpert || selectedSlot) {
      setBookingProgress(50);
    } else {
      setBookingProgress(33);
    }
  }, [selectedExpert, selectedSlot]);

  const calculateTotalAmount = () => {
    return selectedServices.reduce((sum, service) => sum + service.rate, 0);
  };

  const calculateTotalDuration = () => {
    return selectedServices.reduce((sum, service) => sum + service.duration, 0);
  };

  const dateKey = format(selectedDate, "yyyy-MM-dd");
  const currentDaySlots = slotsByDate[dateKey] || [];

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const dKey = format(date, "yyyy-MM-dd");
      if (slotsByDate[dKey] && slotsByDate[dKey].some((s) => s.isAvailable)) {
        return "has-slots-indicator";
      }
    }
    return null;
  };

  const tileDisabled = ({ date, view }) => {
    if (view === "month") {
      const dKey = format(date, "yyyy-MM-dd");
      return (
        !slotsByDate[dKey] || !slotsByDate[dKey].some((s) => s.isAvailable)
      );
    }
    return false;
  };

  const handleExpertSelect = (expertId) => {
    setSelectedExpert(expertId);
    setError("");
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setError("");
  };

  const handleConfirm = () => {
    if (!selectedExpert) {
      setError("Please select a specialist to continue");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!selectedSlot) {
      setError("Please select a time slot to continue");
      return;
    }

    // Prepare service IDs as an array
    const serviceIdsArray = selectedServices.map((service) => service.id);

    // Navigate to summary with services parameter
    const params = new URLSearchParams();
    params.append("slotId", selectedSlot.id);
    params.append("expertId", selectedExpert);
    params.append("shopId", selectedSlot.shopId);

    // Pass service IDs as comma-separated string
    params.append("services", serviceIdsArray.join(","));

    navigate(`/summary?${params.toString()}`);
  };

  // const handleConfirm = () => {
  //   if (!selectedExpert) {
  //     setError("Please select a specialist to continue");
  //     window.scrollTo({ top: 0, behavior: "smooth" });
  //     return;
  //   }
  //   if (!selectedSlot) {
  //     setError("Please select a time slot to continue");
  //     return;
  //   }

  //   // Prepare booking data
  //   const bookingData = {
  //     slotId: selectedSlot.id,
  //     expertId: selectedExpert,
  //     shopId: selectedSlot.shopId,
  //     services: selectedServices.map((service) => ({
  //       id: service.id,
  //       name: service.name,
  //       rate: service.rate,
  //       duration: service.duration,
  //     })),
  //     totalAmount: calculateTotalAmount(),
  //     totalDuration: calculateTotalDuration(),
  //     date: format(selectedDate, "yyyy-MM-dd"),
  //     time: selectedSlot.startTime.substring(0, 5),
  //   };

  //   // Store in session storage for summary page
  //   sessionStorage.setItem("bookingData", JSON.stringify(bookingData));

  //   // Navigate to summary with encoded data
  //   const params = new URLSearchParams();
  //   params.append("slotId", selectedSlot.id);
  //   params.append("expertId", selectedExpert);
  //   params.append("shopId", selectedSlot.shopId);
  //   params.append(
  //     "services",
  //     JSON.stringify(selectedServices.map((s) => s.id))
  //   );
  //   params.append("totalAmount", calculateTotalAmount());

  //   navigate(`/summary?${params.toString()}`);
  // };

  const removeService = (serviceId) => {
    setSelectedServices((prev) => prev.filter((s) => s.id !== serviceId));
    if (selectedServices.length === 1) {
      // If only one service left and it's removed, go back
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <div className="loader-wrapper">
        <div className="loader-content">
          <div className="loader-spinner">
            <Loader2 size={48} />
          </div>
          <p className="loader-text">Finding available slots for you...</p>
          <p className="loader-subtext">This will just take a moment</p>
        </div>
      </div>
    );
  }

  const selectedExpertData = experts.find((e) => e.id === selectedExpert);

  return (
    <div className="slot-screen">
      <Header />

      <div className="progress-tracker">
        <div className="progress-container">
          <div className="progress-steps">
            <div className={`step ${bookingProgress >= 33 ? "completed" : ""}`}>
              <div className="step-indicator">1</div>
              <span className="step-label">Select Specialist</span>
            </div>
            <div className={`step ${bookingProgress >= 66 ? "completed" : ""}`}>
              <div className="step-indicator">2</div>
              <span className="step-label">Choose Time</span>
            </div>
            <div
              className={`step ${bookingProgress >= 100 ? "completed" : ""}`}
            >
              <div className="step-indicator">3</div>
              <span className="step-label">Confirm</span>
            </div>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${bookingProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="slot-screen-container">
        <header className="slot-header">
          <h1>Complete Your Booking</h1>
          <p>Choose your preferred specialist and time slot</p>
        </header>

        {error && (
          <div className="error-banner">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Selected Services Section */}
        <section className="selected-services-section">
          <div className="section-header">
            <div className="section-title-area">
              <div className="title-icon">
                <ShoppingBag size={22} />
              </div>
              <h2>Selected Services ({selectedServices.length})</h2>
            </div>
            <button
              className="view-services-btn"
              onClick={() => setShowServicesModal(true)}
            >
              View Details
            </button>
          </div>

          <div className="selected-services-preview">
            {selectedServices.slice(0, 3).map((service) => (
              <div key={service.id} className="preview-service-chip">
                {console.log("service-------------", service)}
                <span>{service?.name}</span>
                <span className="preview-price">₹{service.rate}</span>
                <button
                  className="remove-service-btn"
                  onClick={() => removeService(service.id)}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {selectedServices.length > 3 && (
              <div className="preview-service-chip more">
                +{selectedServices.length - 3} more
              </div>
            )}
          </div>

          <div className="services-summary-info">
            <div className="info-item">
              <Clock size={16} />
              <span>Total Duration: {calculateTotalDuration()} mins</span>
            </div>
            <div className="info-item total-price">
              <span>Total Amount: ₹{calculateTotalAmount()}</span>
            </div>
          </div>
        </section>

        <section className="expert-section">
          <div className="section-header">
            <div className="section-title-area">
              <div className="title-icon">
                <User size={22} />
              </div>
              <h2>Select Your Specialist</h2>
            </div>
            <p className="section-description">
              Our experienced professionals are here to serve you
            </p>
          </div>

          <div className="experts-grid">
            {experts.map((expert) => (
              <div
                key={expert.id}
                className={`expert-card ${
                  selectedExpert === expert.id ? "active" : ""
                }`}
                onClick={() => handleExpertSelect(expert.id)}
              >
                <div className="expert-card-inner">
                  <div className="expert-img-wrapper">
                    <img src={expert.image} alt={expert.name} />
                    {selectedExpert === expert.id && (
                      <div className="check-badge">
                        <CheckCircle2 size={24} />
                      </div>
                    )}
                    <div className="expert-rating-badge">
                      <Star size={12} fill="#FFD700" color="#FFD700" />
                      <span>4.9</span>
                    </div>
                  </div>
                  <div className="expert-info">
                    <h3>{expert.name}</h3>
                    <p className="expert-specialty">{expert.specialist}</p>
                    <div className="expert-meta">
                      <span className="expert-experience">
                        <Award size={12} />
                        5+ years
                      </span>
                      <span className="expert-reviews">
                        <ThumbsUp size={12} />
                        128 reviews
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {selectedExpert && (
          <div className="selected-expert-banner">
            <img src={selectedExpertData?.image} alt="" />
            <div className="banner-content">
              <span className="banner-label">Selected Specialist</span>
              <h4>{selectedExpertData?.name}</h4>
              <p>{selectedExpertData?.specialist}</p>
            </div>
          </div>
        )}

        <div className="booking-main-grid">
          <section className="calendar-card">
            <div className="section-header">
              <div className="section-title-area">
                <div className="title-icon">
                  <CalendarIcon size={22} />
                </div>
                <h2>Select Date</h2>
              </div>
            </div>
            <div className="calendar-wrapper">
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                minDate={new Date()}
                tileClassName={tileClassName}
                tileDisabled={tileDisabled}
                prev2Label={null}
                next2Label={null}
                formatShortWeekday={(locale, date) => format(date, "EEEEE")}
              />
              <div className="calendar-legend">
                <div className="legend-item">
                  <span className="legend-dot available"></span>
                  <span>Available</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot selected"></span>
                  <span>Selected</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot today"></span>
                  <span>Today</span>
                </div>
              </div>
            </div>
          </section>

          <section className="slots-card">
            <div className="section-header">
              <div className="section-title-area">
                <div className="title-icon">
                  <Clock size={22} />
                </div>
                <h2>Available Slots</h2>
              </div>
              <p className="slot-date-display">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </p>
            </div>

            {currentDaySlots.length > 0 ? (
              <>
                <div className="slots-grid">
                  {currentDaySlots.map((slot) => (
                    <button
                      key={slot.id}
                      disabled={!slot.isAvailable}
                      className={`slot-button ${
                        selectedSlot?.id === slot.id ? "selected" : ""
                      } ${!slot.isAvailable ? "unavailable" : ""}`}
                      onClick={() => handleSlotSelect(slot)}
                    >
                      <span className="slot-time">
                        {slot.startTime.substring(0, 5)}
                      </span>
                      {slot.isAvailable && (
                        <span className="slot-status">Available</span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="slots-info">
                  <Clock size={16} />
                  <span>All slots are in your local timezone</span>
                </div>
              </>
            ) : (
              <div className="no-slots">
                <div className="no-slots-icon">
                  <CalendarIcon size={48} />
                </div>
                <h3>No Slots Available</h3>
                <p>Please select another date to view available time slots</p>
              </div>
            )}
          </section>
        </div>

        <div className="booking-summary">
          <div className="summary-card">
            <h3>Booking Summary</h3>
            <div className="summary-items">
              <div className="summary-item">
                <span className="item-label">
                  Services ({selectedServices.length})
                </span>
                <span className="item-value">₹{calculateTotalAmount()}</span>
              </div>
              {selectedExpert ? (
                <div className="summary-item">
                  <span className="item-label">Specialist</span>
                  <span className="item-value">{selectedExpertData?.name}</span>
                </div>
              ) : (
                <div className="summary-item placeholder">
                  <span>No specialist selected</span>
                </div>
              )}
              {selectedSlot ? (
                <div className="summary-item">
                  <span className="item-label">Date & Time</span>
                  <span className="item-value">
                    {format(selectedDate, "MMM d, yyyy")} •{" "}
                    {selectedSlot.startTime.substring(0, 5)}
                  </span>
                </div>
              ) : (
                <div className="summary-item placeholder">
                  <span>No time slot selected</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="sticky-footer">
          <div className="footer-content">
            <div className="selection-preview">
              {selectedExpert && selectedSlot ? (
                <>
                  <span className="preview-label">Ready to book</span>
                  <div className="preview-details">
                    <span className="preview-expert">
                      {selectedExpertData?.name}
                    </span>
                    <span className="preview-divider">•</span>
                    <span className="preview-time">
                      {format(selectedDate, "MMM d")} •{" "}
                      {selectedSlot.startTime.substring(0, 5)}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <span className="preview-label">Selection pending</span>
                  <p className="placeholder-text">
                    {!selectedExpert
                      ? "Choose a specialist"
                      : "Select a time slot"}
                  </p>
                </>
              )}
            </div>
            <button
              className="confirm-btn"
              onClick={handleConfirm}
              disabled={
                !selectedExpert ||
                !selectedSlot ||
                selectedServices.length === 0
              }
            >
              <span>Continue to Summary</span>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Services Details Modal */}
      {showServicesModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowServicesModal(false)}
        >
          <div className="services-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Selected Services</h3>
              <button onClick={() => setShowServicesModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {selectedServices.map((service) => (
                <div key={service.id} className="modal-service-item">
                  <div className="service-info">
                    <h4>{service.name}</h4>
                    <p className="service-duration">
                      ⏳ {service.duration} mins
                    </p>
                    {service.description && (
                      <p className="service-description">
                        {service.description}
                      </p>
                    )}
                  </div>
                  <div className="service-actions">
                    <span className="service-price">₹{service.rate}</span>
                    <button
                      className="remove-service-modal-btn"
                      onClick={() => removeService(service.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <div className="modal-total">
                <span>Total Duration: {calculateTotalDuration()} mins</span>
                <span className="total-amount">
                  Total: ₹{calculateTotalAmount()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SelectSlotScreen;
