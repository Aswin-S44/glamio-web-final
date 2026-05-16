import React, { useState, useEffect, useCallback } from "react";
import Calendar from "react-calendar";
import { format, parseISO } from "date-fns";
import {
  CheckCircle2,
  ChevronRight,
  Loader2,
  AlertCircle,
  Calendar as CalendarIcon,
  Star,
  Clock,
  ShoppingBag,
  X,
  Award,
  User,
  Sparkles,
} from "lucide-react";
import "react-calendar/dist/Calendar.css";
import "./SelectSlotScreen.css";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "../../../components/Header/Header";
import { BASE_URL } from "../../../constants/urls";

const fmtTime = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":");
  const d = new Date();
  d.setHours(+h, +m);
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export default function SelectSlotScreen() {
  const { id, serviceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [experts, setExperts] = useState([]);
  const [slotsByDate, setSlotsByDate] = useState({});
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const selectedServiceIds = selectedServices.map((service) => service.id);

  useEffect(() => {
    const saved = sessionStorage.getItem("selectedServices");

    if (saved) {
      setSelectedServices(JSON.parse(saved));
      sessionStorage.removeItem("selectedServices");
      return;
    }

    if (location.state?.selectedServices) {
      setSelectedServices(location.state.selectedServices);
      return;
    }

    if (!serviceId) {
      setSelectedServices([]);
      setError("Please choose a service before selecting a slot.");
      return;
    }

    fetch(`${BASE_URL}/customer/service/${serviceId}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to load selected service.");
        }

        return response.json();
      })
      .then((data) => {
        const serviceList = Array.isArray(data) ? data : data ? [data] : [];

        if (serviceList.length > 0) {
          setSelectedServices(serviceList);
        } else {
          setError("This service is no longer available.");
        }
      })
      .catch((err) => {
        setSelectedServices([]);
        setError(err.message || "Failed to load selected service.");
      });
  }, [serviceId, location.state]);

  const fetchExperts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (selectedServiceIds.length > 0) {
        params.set("serviceIds", selectedServiceIds.join(","));
      }

      const query = params.toString();
      const res = await fetch(
        `${BASE_URL}/customer/experts/${id}${query ? `?${query}` : ""}`
      );

      if (!res.ok) {
        throw new Error("Failed to load specialists.");
      }

      const data = await res.json();
      setExperts(Array.isArray(data.experts) ? data.experts : []);
    } catch (err) {
      setExperts([]);
      setError((prev) => prev || err.message || "Failed to load specialists.");
    } finally {
      setLoading(false);
    }
  }, [id, selectedServiceIds.join(",")]);

  const fetchSlots = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/customer/slots/${id}`);

      if (!res.ok) {
        throw new Error("Failed to load slots.");
      }

      const data = await res.json();
      if (data.slots?.length > 0) {
        const grouped = data.slots.reduce((acc, slot) => {
          const key = format(parseISO(slot.slotDate), "yyyy-MM-dd");
          (acc[key] = acc[key] || []).push(slot);
          return acc;
        }, {});

        setSlotsByDate(grouped);
      } else {
        setSlotsByDate({});
      }
    } catch (err) {
      setSlotsByDate({});
      setError((prev) => prev || err.message || "Failed to load slots.");
    }
  }, [id]);

  useEffect(() => {
    fetchExperts();
    fetchSlots();
  }, [fetchExperts, fetchSlots]);

  const dateKey = format(selectedDate, "yyyy-MM-dd");
  const daySlots = slotsByDate[dateKey] || [];
  const expertData = experts.find((e) => e.id === selectedExpert);
  const totalAmount = selectedServices.reduce((s, sv) => s + Number(sv.rate || 0), 0);
  const totalDuration = selectedServices.reduce(
    (s, sv) => s + Number(sv.duration || 0),
    0
  );
  const step = selectedExpert && selectedSlot ? 3 : selectedExpert ? 2 : 1;
  const canProceed =
    selectedExpert && selectedSlot && selectedServices.length > 0;

  const tileClassName = ({ date, view }) => {
    if (view !== "month") return null;
    const key = format(date, "yyyy-MM-dd");
    return slotsByDate[key]?.some((slot) => slot.isAvailable)
      ? "has-slots-indicator"
      : null;
  };

  const tileDisabled = ({ date, view }) => {
    if (view !== "month") return false;
    const key = format(date, "yyyy-MM-dd");
    return !slotsByDate[key]?.some((slot) => slot.isAvailable);
  };

  const removeService = (sid) => {
    const next = selectedServices.filter((service) => service.id !== sid);

    if (next.length === 0) {
      navigate(-1);
      return;
    }

    setSelectedServices(next);
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

    const params = new URLSearchParams();
    params.append("slotId", selectedSlot.id);
    params.append("expertId", selectedExpert);
    params.append("shopId", selectedSlot.shopId);
    params.append(
      "services",
      selectedServices.map((service) => service.id).join(",")
    );
    const summaryUrl = `/summary?${params.toString()}`;

    if (!localStorage.getItem("token")) {
      sessionStorage.setItem("redirectAfterLogin", summaryUrl);
      navigate("/signin");
      return;
    }

    navigate(summaryUrl);
  };

  if (loading) {
    return (
      <div className="ss-loader-page">
        <Header />
        <div className="ss-loader-body">
          <div className="ss-loader-ring">
            <Loader2 size={32} className="ss-spin" />
          </div>
          <p>Finding available slots for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ss-page">
      <Header />

      <div className="ss-progress-bar">
        <div className="ss-progress-inner">
          {["Select Specialist", "Choose Date & Time", "Confirm"].map(
            (label, i) => (
              <React.Fragment key={i}>
                <div
                  className={`ss-step ${
                    step > i ? "done" : step === i + 1 ? "active" : ""
                  }`}
                >
                  <div className="ss-step-circle">
                    {step > i + 1 ? <CheckCircle2 size={16} /> : <span>{i + 1}</span>}
                  </div>
                  <span className="ss-step-label">{label}</span>
                </div>
                {i < 2 && (
                  <div className={`ss-step-line ${step > i + 1 ? "filled" : ""}`} />
                )}
              </React.Fragment>
            )
          )}
        </div>
      </div>

      <div className="ss-body">
        <div className="ss-main">
          <div className="ss-services-strip">
            <div className="ss-strip-left">
              <ShoppingBag size={16} />
              <span className="ss-strip-label">
                {selectedServices.length} service
                {selectedServices.length !== 1 ? "s" : ""} selected
              </span>
              <div className="ss-strip-chips">
                {selectedServices.slice(0, 3).map((service) => (
                  <div key={service.id} className="ss-chip">
                    <span>{service.name}</span>
                    <span className="ss-chip-price">Rs {service.rate}</span>
                    <button
                      className="ss-chip-remove"
                      onClick={() => removeService(service.id)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {selectedServices.length > 3 && (
                  <span className="ss-chip-more">
                    +{selectedServices.length - 3} more
                  </span>
                )}
              </div>
            </div>
            <button className="ss-strip-detail" onClick={() => setShowModal(true)}>
              View details
            </button>
          </div>

          {error && (
            <div className="ss-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <section className="ss-section">
            <div className="ss-section-head">
              <div className="ss-section-icon">
                <User size={18} />
              </div>
              <div>
                <h2>Choose your specialist</h2>
                <p>Our certified professionals are ready to serve you</p>
              </div>
            </div>

            <div className="ss-experts-grid">
              {experts.length > 0 ? (
                experts.map((expert) => {
                  const active = selectedExpert === expert.id;
                  return (
                    <button
                      key={expert.id}
                      className={`ss-expert-card ${active ? "active" : ""}`}
                      onClick={() => {
                        setSelectedExpert(expert.id);
                        setError("");
                      }}
                    >
                      <div className="ss-expert-img-wrap">
                        <img
                          src={expert.image}
                          alt={expert.name}
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200";
                          }}
                        />
                        {active && (
                          <div className="ss-expert-check">
                            <CheckCircle2 size={20} />
                          </div>
                        )}
                      </div>
                      <div className="ss-expert-info">
                        <h3>{expert.name}</h3>
                        <span className="ss-expert-spec">{expert.specialist}</span>
                        <div className="ss-expert-meta">
                          <span>
                            <Star size={11} fill="#FFD700" color="#FFD700" />{" "}
                            {expert.rating || "N/A"}
                          </span>
                          <span className="ss-dot">.</span>
                          <span>{expert.reviews || 0} reviews</span>
                          <span className="ss-dot">.</span>
                          <span>
                            <Award size={11} /> Available
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="ss-no-slots">
                  <User size={36} />
                  <p>No specialists available</p>
                  <span>Try another service or check back later.</span>
                </div>
              )}
            </div>
          </section>

          <section className="ss-section">
            <div className="ss-section-head">
              <div className="ss-section-icon">
                <CalendarIcon size={18} />
              </div>
              <div>
                <h2>Pick a date & time</h2>
                <p>Dates with available slots are highlighted</p>
              </div>
            </div>

            <div className="ss-datetime-grid">
              <div className="ss-calendar-card">
                <Calendar
                  onChange={(date) => {
                    setSelectedDate(date);
                    setSelectedSlot(null);
                  }}
                  value={selectedDate}
                  minDate={new Date()}
                  tileClassName={tileClassName}
                  tileDisabled={tileDisabled}
                  prev2Label={null}
                  next2Label={null}
                  formatShortWeekday={(_, date) => format(date, "EEEEE")}
                />
                <div className="ss-cal-legend">
                  <div className="ss-leg-item">
                    <span className="ss-leg-dot pink" />
                    Available
                  </div>
                  <div className="ss-leg-item">
                    <span className="ss-leg-dot dark" />
                    Selected
                  </div>
                  <div className="ss-leg-item">
                    <span className="ss-leg-dot ring" />
                    Today
                  </div>
                </div>
              </div>

              <div className="ss-slots-card">
                <div className="ss-slots-header">
                  <CalendarIcon size={14} />
                  <span>{format(selectedDate, "EEE, d MMM yyyy")}</span>
                </div>

                {daySlots.length > 0 ? (
                  <>
                    <div className="ss-time-period">
                      <span className="ss-period-label">Morning</span>
                      <div className="ss-slots-row">
                        {daySlots
                          .filter((slot) => +slot.startTime.split(":")[0] < 12)
                          .map((slot) => (
                            <SlotBtn
                              key={slot.id}
                              slot={slot}
                              selected={selectedSlot?.id === slot.id}
                              onClick={() => {
                                setSelectedSlot(slot);
                                setError("");
                              }}
                            />
                          ))}
                      </div>
                    </div>
                    <div className="ss-time-period">
                      <span className="ss-period-label">Afternoon</span>
                      <div className="ss-slots-row">
                        {daySlots
                          .filter((slot) => +slot.startTime.split(":")[0] >= 12)
                          .map((slot) => (
                            <SlotBtn
                              key={slot.id}
                              slot={slot}
                              selected={selectedSlot?.id === slot.id}
                              onClick={() => {
                                setSelectedSlot(slot);
                                setError("");
                              }}
                            />
                          ))}
                      </div>
                    </div>
                    <p className="ss-tz-note">
                      <Clock size={12} /> All times in your local timezone
                    </p>
                  </>
                ) : (
                  <div className="ss-no-slots">
                    <CalendarIcon size={36} />
                    <p>No slots on this date</p>
                    <span>Pick another date</span>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        <aside className="ss-sidebar">
          <div className="ss-summary-card">
            <div className="ss-summary-head">
              <Sparkles size={16} />
              <span>Booking Summary</span>
            </div>

            <div className="ss-summ-block">
              <span className="ss-summ-label">Services</span>
              {selectedServices.map((service) => (
                <div key={service.id} className="ss-summ-row">
                  <span>
                    {service.name}{" "}
                    <span className="ss-summ-dur">({service.duration} min)</span>
                  </span>
                  <span className="ss-summ-price">Rs {service.rate}</span>
                </div>
              ))}
            </div>

            <div className="ss-summ-block">
              <span className="ss-summ-label">Specialist</span>
              {expertData ? (
                <div className="ss-summ-expert">
                  <img src={expertData.image} alt={expertData.name} />
                  <div>
                    <strong>{expertData.name}</strong>
                    <span>{expertData.specialist}</span>
                  </div>
                </div>
              ) : (
                <div className="ss-summ-pending">
                  <User size={14} /> Not selected yet
                </div>
              )}
            </div>

            <div className="ss-summ-block">
              <span className="ss-summ-label">Date & Time</span>
              {selectedSlot ? (
                <div className="ss-summ-row">
                  <CalendarIcon size={13} />
                  <span>
                    {format(selectedDate, "d MMM yyyy")} .{" "}
                    {fmtTime(selectedSlot.startTime)}
                  </span>
                </div>
              ) : (
                <div className="ss-summ-pending">
                  <CalendarIcon size={14} /> Not selected yet
                </div>
              )}
            </div>

            <div className="ss-summ-divider" />

            <div className="ss-summ-total">
              <div>
                <span className="ss-summ-tot-label">Total</span>
                <span className="ss-summ-dur">{totalDuration} min session</span>
              </div>
              <span className="ss-summ-tot-amt">Rs {totalAmount}</span>
            </div>

            <button
              className="ss-confirm-btn"
              onClick={handleConfirm}
              disabled={!canProceed}
            >
              {canProceed ? <>Continue </> : "Complete all steps above"}
            </button>

            {!canProceed && (
              <div className="ss-steps-left">
                {!selectedExpert && <span>1 Choose a specialist</span>}
                {!selectedSlot && <span>2 Pick a time slot</span>}
              </div>
            )}
          </div>

          <div className="ss-trust">
            <div className="ss-trust-item">Free cancellation up to 24 hrs</div>
            <div className="ss-trust-item">Instant confirmation</div>
            <div className="ss-trust-item">Certified professionals</div>
          </div>
        </aside>
      </div>

      <div className={`ss-mobile-cta ${canProceed ? "ready" : ""}`}>
        <div className="ss-mobile-cta-info">
          <span className="ss-mobile-total">Rs {totalAmount}</span>
          <span className="ss-mobile-sub">
            {canProceed
              ? `${expertData?.name} . ${fmtTime(selectedSlot?.startTime)}`
              : "Complete your selection"}
          </span>
        </div>
        <button
          className="ss-mobile-btn"
          onClick={handleConfirm}
          disabled={!canProceed}
        >
          Continue <ChevronRight size={16} />
        </button>
      </div>

      {showModal && (
        <div className="ss-modal-bg" onClick={() => setShowModal(false)}>
          <div className="ss-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ss-modal-head">
              <h3>Selected Services</h3>
              <button onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="ss-modal-body">
              {selectedServices.map((service) => (
                <div key={service.id} className="ss-modal-row">
                  <div>
                    <h4>{service.name}</h4>
                    <span>
                      <Clock size={12} /> {service.duration} mins
                    </span>
                    {service.description && <p>{service.description}</p>}
                  </div>
                  <div className="ss-modal-right">
                    <strong>Rs {service.rate}</strong>
                    <button
                      className="ss-modal-remove"
                      onClick={() => removeService(service.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <div className="ss-modal-total">
                <span>Total ({totalDuration} min)</span>
                <strong>Rs {totalAmount}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SlotBtn({ slot, selected, onClick }) {
  return (
    <button
      disabled={!slot.isAvailable}
      className={`ss-slot-btn ${selected ? "selected" : ""} ${
        !slot.isAvailable ? "booked" : ""
      }`}
      onClick={onClick}
    >
      {fmtTime(slot.startTime)}
      {!slot.isAvailable && <span className="ss-slot-tag">Booked</span>}
    </button>
  );
}
