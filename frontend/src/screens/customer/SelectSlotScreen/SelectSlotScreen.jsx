import React, { useState, useEffect, useCallback } from "react";
import Calendar from "react-calendar";
import { format, parseISO, addDays } from "date-fns";
import {
  CheckCircle2, ChevronRight, Loader2, AlertCircle,
  Calendar as CalendarIcon, Star, Clock, ShoppingBag,
  X, Award, User, ArrowLeft, Sparkles,
} from "lucide-react";
import "react-calendar/dist/Calendar.css";
import "./SelectSlotScreen.css";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "../../../components/Header/Header";
import { BASE_URL } from "../../../constants/urls";

/* ── Dummy data ── */
const DUMMY_EXPERTS = [
  { id: 1, name: "Priya Sharma",  specialist: "Hair & Makeup", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200", rating: 4.9, reviews: 148 },
  { id: 2, name: "Anjali Rao",    specialist: "Bridal & Skin",  image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200", rating: 4.8, reviews: 92  },
  { id: 3, name: "Sunita Verma",  specialist: "Nails & Lashes", image: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=200", rating: 4.7, reviews: 76  },
];

const DUMMY_SERVICES = [
  { id: 1, name: "Hair Smoothing", duration: 90, rate: 1200 },
];

const generateDummySlots = () => {
  const slots = {};
  const times = ["09:00:00","10:00:00","11:00:00","12:00:00","14:00:00","15:00:00","16:00:00","17:00:00"];
  for (let i = 0; i < 14; i++) {
    const date = format(addDays(new Date(), i), "yyyy-MM-dd");
    if (i % 7 !== 6) {
      slots[date] = times.map((t, idx) => ({
        id: i * 10 + idx + 1,
        shopId: "s1",
        slotDate: date,
        startTime: t,
        isAvailable: idx !== 2 && idx !== 5,
      }));
    }
  }
  return slots;
};

/* ── Helpers ── */
const fmtTime = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":");
  const d = new Date(); d.setHours(+h, +m);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
};

export default function SelectSlotScreen() {
  const { id, serviceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [experts, setExperts]               = useState([]);
  const [slotsByDate, setSlotsByDate]       = useState({});
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [selectedDate, setSelectedDate]     = useState(new Date());
  const [selectedSlot, setSelectedSlot]     = useState(null);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState("");
  const [showModal, setShowModal]           = useState(false);

  /* ── Load services ── */
  useEffect(() => {
    const saved = sessionStorage.getItem("selectedServices");
    if (saved) {
      setSelectedServices(JSON.parse(saved));
      sessionStorage.removeItem("selectedServices");
    } else if (location.state?.selectedServices) {
      setSelectedServices(location.state.selectedServices);
    } else if (serviceId) {
      fetch(`${BASE_URL}/customer/service/${serviceId}`)
        .then(r => r.json())
        .then(d => { if (d?.length > 0) setSelectedServices(d); else setSelectedServices(DUMMY_SERVICES); })
        .catch(() => setSelectedServices(DUMMY_SERVICES));
    } else {
      setSelectedServices(DUMMY_SERVICES);
    }
  }, [serviceId, location.state]);

  /* ── Load experts ── */
  const fetchExperts = useCallback(async () => {
    try {
      setLoading(true);
      const res  = await fetch(`${BASE_URL}/customer/experts/${id}`);
      const data = await res.json();
      setExperts(data.experts?.length > 0 ? data.experts : DUMMY_EXPERTS);
    } catch { setExperts(DUMMY_EXPERTS); }
    finally  { setLoading(false); }
  }, [id]);

  /* ── Load slots ── */
  const fetchSlots = useCallback(async () => {
    try {
      const res  = await fetch(`${BASE_URL}/customer/slots/${id}`);
      const data = await res.json();
      if (data.slots?.length > 0) {
        const grouped = data.slots.reduce((acc, slot) => {
          const key = format(parseISO(slot.slotDate), "yyyy-MM-dd");
          (acc[key] = acc[key] || []).push(slot);
          return acc;
        }, {});
        setSlotsByDate(grouped);
      } else { setSlotsByDate(generateDummySlots()); }
    } catch { setSlotsByDate(generateDummySlots()); }
  }, [id]);

  useEffect(() => { fetchExperts(); fetchSlots(); }, [fetchExperts, fetchSlots]);

  /* ── Derived ── */
  const dateKey        = format(selectedDate, "yyyy-MM-dd");
  const daySlots       = slotsByDate[dateKey] || [];
  const expertData     = experts.find(e => e.id === selectedExpert);
  const totalAmount    = selectedServices.reduce((s, sv) => s + sv.rate, 0);
  const totalDuration  = selectedServices.reduce((s, sv) => s + sv.duration, 0);
  const step           = selectedExpert && selectedSlot ? 3 : selectedExpert ? 2 : 1;
  const canProceed     = selectedExpert && selectedSlot && selectedServices.length > 0;

  /* ── Calendar helpers ── */
  const tileClassName = ({ date, view }) => {
    if (view !== "month") return null;
    const k = format(date, "yyyy-MM-dd");
    return slotsByDate[k]?.some(s => s.isAvailable) ? "has-slots-indicator" : null;
  };
  const tileDisabled = ({ date, view }) => {
    if (view !== "month") return false;
    const k = format(date, "yyyy-MM-dd");
    return !slotsByDate[k]?.some(s => s.isAvailable);
  };

  /* ── Actions ── */
  const removeService = (sid) => {
    const next = selectedServices.filter(s => s.id !== sid);
    if (next.length === 0) { navigate(-1); return; }
    setSelectedServices(next);
  };

  const handleConfirm = () => {
    if (!selectedExpert) { setError("Please select a specialist to continue"); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    if (!selectedSlot)   { setError("Please select a time slot to continue"); return; }

    const params = new URLSearchParams();
    params.append("slotId",   selectedSlot.id);
    params.append("expertId", selectedExpert);
    params.append("shopId",   selectedSlot.shopId);
    params.append("services", selectedServices.map(s => s.id).join(","));
    const summaryUrl = `/summary?${params.toString()}`;

    // Require sign-in before booking
    if (!localStorage.getItem("token")) {
      sessionStorage.setItem("redirectAfterLogin", summaryUrl);
      navigate("/signin");
      return;
    }

    navigate(summaryUrl);
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="ss-loader-page">
      <Header />
      <div className="ss-loader-body">
        <div className="ss-loader-ring"><Loader2 size={32} className="ss-spin" /></div>
        <p>Finding available slots for you…</p>
      </div>
    </div>
  );

  return (
    <div className="ss-page">
      <Header />

      {/* ── Progress bar ── */}
      <div className="ss-progress-bar">
        <div className="ss-progress-inner">
          {["Select Specialist","Choose Date & Time","Confirm"].map((label, i) => (
            <React.Fragment key={i}>
              <div className={`ss-step ${step > i ? "done" : step === i + 1 ? "active" : ""}`}>
                <div className="ss-step-circle">
                  {step > i + 1 ? <CheckCircle2 size={16} /> : <span>{i + 1}</span>}
                </div>
                <span className="ss-step-label">{label}</span>
              </div>
              {i < 2 && <div className={`ss-step-line ${step > i + 1 ? "filled" : ""}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="ss-body">
        {/* ── Left column ── */}
        <div className="ss-main">

          {/* Services strip */}
          <div className="ss-services-strip">
            <div className="ss-strip-left">
              <ShoppingBag size={16} />
              <span className="ss-strip-label">{selectedServices.length} service{selectedServices.length !== 1 ? "s" : ""} selected</span>
              <div className="ss-strip-chips">
                {selectedServices.slice(0, 3).map(sv => (
                  <div key={sv.id} className="ss-chip">
                    <span>{sv.name}</span>
                    <span className="ss-chip-price">₹{sv.rate}</span>
                    <button className="ss-chip-remove" onClick={() => removeService(sv.id)}><X size={12} /></button>
                  </div>
                ))}
                {selectedServices.length > 3 && <span className="ss-chip-more">+{selectedServices.length - 3} more</span>}
              </div>
            </div>
            <button className="ss-strip-detail" onClick={() => setShowModal(true)}>View details</button>
          </div>

          {error && (
            <div className="ss-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* ── Step 1: Experts ── */}
          <section className="ss-section">
            <div className="ss-section-head">
              <div className="ss-section-icon"><User size={18} /></div>
              <div>
                <h2>Choose your specialist</h2>
                <p>Our certified professionals are ready to serve you</p>
              </div>
            </div>

            <div className="ss-experts-grid">
              {experts.map(expert => {
                const active = selectedExpert === expert.id;
                return (
                  <button
                    key={expert.id}
                    className={`ss-expert-card ${active ? "active" : ""}`}
                    onClick={() => { setSelectedExpert(expert.id); setError(""); }}
                  >
                    <div className="ss-expert-img-wrap">
                      <img src={expert.image} alt={expert.name} onError={e => { e.target.src = "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200"; }} />
                      {active && <div className="ss-expert-check"><CheckCircle2 size={20} /></div>}
                    </div>
                    <div className="ss-expert-info">
                      <h3>{expert.name}</h3>
                      <span className="ss-expert-spec">{expert.specialist}</span>
                      <div className="ss-expert-meta">
                        <span><Star size={11} fill="#FFD700" color="#FFD700" /> {expert.rating || "4.9"}</span>
                        <span className="ss-dot">·</span>
                        <span>{expert.reviews || "128"} reviews</span>
                        <span className="ss-dot">·</span>
                        <span><Award size={11} /> 5+ yrs</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── Step 2: Date + Time ── */}
          <section className="ss-section">
            <div className="ss-section-head">
              <div className="ss-section-icon"><CalendarIcon size={18} /></div>
              <div>
                <h2>Pick a date & time</h2>
                <p>Dates with available slots are highlighted</p>
              </div>
            </div>

            <div className="ss-datetime-grid">
              {/* Calendar */}
              <div className="ss-calendar-card">
                <Calendar
                  onChange={date => { setSelectedDate(date); setSelectedSlot(null); }}
                  value={selectedDate}
                  minDate={new Date()}
                  tileClassName={tileClassName}
                  tileDisabled={tileDisabled}
                  prev2Label={null}
                  next2Label={null}
                  formatShortWeekday={(_, d) => format(d, "EEEEE")}
                />
                <div className="ss-cal-legend">
                  <div className="ss-leg-item"><span className="ss-leg-dot pink" />Available</div>
                  <div className="ss-leg-item"><span className="ss-leg-dot dark" />Selected</div>
                  <div className="ss-leg-item"><span className="ss-leg-dot ring" />Today</div>
                </div>
              </div>

              {/* Time slots */}
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
                        {daySlots.filter(s => +s.startTime.split(":")[0] < 12).map(slot => (
                          <SlotBtn key={slot.id} slot={slot} selected={selectedSlot?.id === slot.id} onClick={() => { setSelectedSlot(slot); setError(""); }} />
                        ))}
                      </div>
                    </div>
                    <div className="ss-time-period">
                      <span className="ss-period-label">Afternoon</span>
                      <div className="ss-slots-row">
                        {daySlots.filter(s => +s.startTime.split(":")[0] >= 12).map(slot => (
                          <SlotBtn key={slot.id} slot={slot} selected={selectedSlot?.id === slot.id} onClick={() => { setSelectedSlot(slot); setError(""); }} />
                        ))}
                      </div>
                    </div>
                    <p className="ss-tz-note"><Clock size={12} /> All times in your local timezone</p>
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

        {/* ── Right sidebar: live summary ── */}
        <aside className="ss-sidebar">
          <div className="ss-summary-card">
            <div className="ss-summary-head">
              <Sparkles size={16} />
              <span>Booking Summary</span>
            </div>

            {/* Services */}
            <div className="ss-summ-block">
              <span className="ss-summ-label">Services</span>
              {selectedServices.map(sv => (
                <div key={sv.id} className="ss-summ-row">
                  <span>{sv.name} <span className="ss-summ-dur">({sv.duration} min)</span></span>
                  <span className="ss-summ-price">₹{sv.rate}</span>
                </div>
              ))}
            </div>

            {/* Expert */}
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
                <div className="ss-summ-pending"><User size={14} /> Not selected yet</div>
              )}
            </div>

            {/* Date / Time */}
            <div className="ss-summ-block">
              <span className="ss-summ-label">Date & Time</span>
              {selectedSlot ? (
                <div className="ss-summ-row">
                  <CalendarIcon size={13} />
                  <span>{format(selectedDate, "d MMM yyyy")} · {fmtTime(selectedSlot.startTime)}</span>
                </div>
              ) : (
                <div className="ss-summ-pending"><CalendarIcon size={14} /> Not selected yet</div>
              )}
            </div>

            <div className="ss-summ-divider" />

            {/* Total */}
            <div className="ss-summ-total">
              <div>
                <span className="ss-summ-tot-label">Total</span>
                <span className="ss-summ-dur">{totalDuration} min session</span>
              </div>
              <span className="ss-summ-tot-amt">₹{totalAmount}</span>
            </div>

            <button className="ss-confirm-btn" onClick={handleConfirm} disabled={!canProceed}>
              {canProceed ? <>Continue </> : "Complete all steps above"}
            </button>

            {!canProceed && (
              <div className="ss-steps-left">
                {!selectedExpert && <span>① Choose a specialist</span>}
                {!selectedSlot   && <span>② Pick a time slot</span>}
              </div>
            )}
          </div>

          {/* Trust badges */}
          <div className="ss-trust">
            <div className="ss-trust-item">✓ Free cancellation up to 24 hrs</div>
            <div className="ss-trust-item">✓ Instant confirmation</div>
            <div className="ss-trust-item">✓ Certified professionals</div>
          </div>
        </aside>
      </div>

      {/* ── Mobile sticky CTA ── */}
      <div className={`ss-mobile-cta ${canProceed ? "ready" : ""}`}>
        <div className="ss-mobile-cta-info">
          <span className="ss-mobile-total">₹{totalAmount}</span>
          <span className="ss-mobile-sub">{canProceed ? `${expertData?.name} · ${fmtTime(selectedSlot?.startTime)}` : "Complete your selection"}</span>
        </div>
        <button className="ss-mobile-btn" onClick={handleConfirm} disabled={!canProceed}>
          Continue <ChevronRight size={16} />
        </button>
      </div>

      {/* ── Services modal ── */}
      {showModal && (
        <div className="ss-modal-bg" onClick={() => setShowModal(false)}>
          <div className="ss-modal" onClick={e => e.stopPropagation()}>
            <div className="ss-modal-head">
              <h3>Selected Services</h3>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <div className="ss-modal-body">
              {selectedServices.map(sv => (
                <div key={sv.id} className="ss-modal-row">
                  <div>
                    <h4>{sv.name}</h4>
                    <span><Clock size={12} /> {sv.duration} mins</span>
                    {sv.description && <p>{sv.description}</p>}
                  </div>
                  <div className="ss-modal-right">
                    <strong>₹{sv.rate}</strong>
                    <button className="ss-modal-remove" onClick={() => removeService(sv.id)}>Remove</button>
                  </div>
                </div>
              ))}
              <div className="ss-modal-total">
                <span>Total ({totalDuration} min)</span>
                <strong>₹{totalAmount}</strong>
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
      className={`ss-slot-btn ${selected ? "selected" : ""} ${!slot.isAvailable ? "booked" : ""}`}
      onClick={onClick}
    >
      {fmtTime(slot.startTime)}
      {!slot.isAvailable && <span className="ss-slot-tag">Booked</span>}
    </button>
  );
}
