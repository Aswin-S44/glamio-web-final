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
} from "lucide-react";
import "react-calendar/dist/Calendar.css";
import "./SelectSlotScreen.css";
import { useParams, useNavigate } from "react-router-dom";
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

  const { id, serviceId } = useParams();
  const navigate = useNavigate();

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
      setError("Please select an expert to continue.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!selectedSlot) {
      setError("Please select a convenient time slot.");
      return;
    }

    const params = new URLSearchParams();
    params.append("slotId", selectedSlot.id);
    params.append("expertId", selectedExpert);
    params.append("serviceId", serviceId);
    params.append("shopId", selectedSlot.shopId);
    navigate(`/summary?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="loader-overlay">
        <Loader2 className="spinner-icon" />
        <p>Loading available slots...</p>
      </div>
    );
  }

  return (
    <div className="screens">
      <Header />
      <div className="slot-screen-container">
        <header className="slot-header">
          <h1>Book Appointment</h1>
          <p>Customize your experience with our professionals</p>
        </header>

        {error && (
          <div className="error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <section className="expert-section">
          <div className="section-title-area">
            <User size={20} />
            <h2>Select Specialist</h2>
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
                <div className="expert-img-wrapper">
                  <img src={expert.image} alt={expert.name} />
                  {selectedExpert === expert.id && (
                    <div className="check-badge-overlay">
                      <CheckCircle2 className="check-badge" />
                    </div>
                  )}
                </div>
                <div className="expert-info">
                  <h3>{expert.name}</h3>
                  <p>{expert.specialist}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="booking-main-grid">
          <section className="calendar-card">
            <div className="section-title-area">
              <Clock size={20} />
              <h2>Pick Date</h2>
            </div>
            <div className="calendar-ui-wrapper">
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                minDate={new Date()}
                tileClassName={tileClassName}
                prev2Label={null}
                next2Label={null}
              />
            </div>
          </section>

          <section className="slots-card">
            <div className="section-title-area">
              <Clock size={20} />
              <h2>Available Hours</h2>
            </div>
            {currentDaySlots.length > 0 ? (
              <div className="slots-flex">
                {currentDaySlots.map((slot) => (
                  <button
                    key={slot.id}
                    disabled={!slot.isAvailable}
                    className={`slot-item ${
                      selectedSlot?.id === slot.id ? "selected" : ""
                    } ${!slot.isAvailable ? "booked" : ""}`}
                    onClick={() => handleSlotSelect(slot)}
                  >
                    {slot.startTime.substring(0, 5)}
                  </button>
                ))}
              </div>
            ) : (
              <div className="no-slots-msg">
                <p>No slots available for this date.</p>
              </div>
            )}
          </section>
        </div>

        <div className="sticky-footer">
          <div className="footer-content">
            <div className="selection-preview">
              {selectedSlot ? (
                <div className="preview-details">
                  <span className="preview-date">
                    {format(selectedDate, "MMM dd, yyyy")}
                  </span>
                  <span className="preview-time">
                    {selectedSlot.startTime.substring(0, 5)}
                  </span>
                </div>
              ) : (
                <p className="placeholder-text">Selection pending...</p>
              )}
            </div>
            <button className="confirm-btn" onClick={handleConfirm}>
              <span>Continue</span>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SelectSlotScreen;
