import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  Calendar,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Umbrella,
  RefreshCw,
  X,
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addDays,
  isAfter,
  isBefore,
  startOfDay,
} from "date-fns";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./SlotScreen.css";
import { BASE_URL } from "../../constants/urls";

function SlotScreen() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState({});
  const [holidays, setHolidays] = useState({});
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [repeatModalOpen, setRepeatModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [slotDate, setSlotDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [isBooked, setIsBooked] = useState(false);
  const [repeatUntilDate, setRepeatUntilDate] = useState("");
  const token = localStorage.getItem("token");

  const dateKey = format(selectedDate, "yyyy-MM-dd");
  const isPastDate = isBefore(startOfDay(selectedDate), startOfDay(new Date()));
  const todayDateStr = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/slots`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      });
      const data = await res.json();
      if (data.slots) {
        const grouped = data.slots.reduce((acc, slot) => {
          // Avoid parseISO timezone shift — slotDate is already "YYYY-MM-DD"
          const d = typeof slot.slotDate === "string"
            ? slot.slotDate.substring(0, 10)
            : format(slot.slotDate, "yyyy-MM-dd");
          if (!acc[d]) acc[d] = [];
          acc[d].push({
            ...slot,
            slotDate: d,
            startTime: slot.startTime.substring(0, 5),
            endTime:   slot.endTime.substring(0, 5),
          });
          return acc;
        }, {});
        setSlots(grouped);
      }
    } catch (error) {
      toast.error("Failed to fetch slots");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleHoliday = () => {
    if (isPastDate) return;
    setHolidays((prev) => ({
      ...prev,
      [dateKey]: !prev[dateKey],
    }));
    toast.info(
      holidays[dateKey] ? "Shop is now Open" : "Day marked as Holiday"
    );
  };

  const handleSaveSlot = async () => {
    const now = new Date();
    const currentTimeStr = format(now, "HH:mm");

    if (slotDate < todayDateStr) {
      toast.error("Cannot create slots for past dates");
      return;
    }

    if (slotDate === todayDateStr && startTime <= currentTimeStr) {
      toast.error("Cannot create slots for past time today");
      return;
    }

    if (startTime >= endTime) {
      toast.error("End time must be after start time");
      return;
    }

    const existingSlots = slots[slotDate] || [];
    const isDuplicate = existingSlots.some(
      (s) =>
        s.startTime === startTime &&
        s.endTime === endTime &&
        s.id !== editingSlot?.id
    );

    if (isDuplicate) {
      Swal.fire({
        title: "Slot Already exists",
        text: `A slot from ${startTime} to ${endTime} already exists for this date.`,
        icon: "error",
        confirmButtonColor: "#d4a373",
      });
      return;
    }

    const newSlotData = {
      slotDate: slotDate,
      startTime: startTime.length === 5 ? `${startTime}:00` : startTime,
      endTime: endTime.length === 5 ? `${endTime}:00` : endTime,
      isAvailable: !isBooked,
      bookedCount: isBooked ? 1 : 0,
      maxCapacity: 1,
    };

    try {
      const url = editingSlot
        ? `${BASE_URL}/slots/${editingSlot.id}`
        : `${BASE_URL}/slots`;

      const res = await fetch(url, {
        method: editingSlot ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify(newSlotData),
      });

      if (res.ok) {
        fetchSlots();
        toast.success(editingSlot ? "Slot updated" : "New slot created");
        closeModal();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Failed to save slot");
      }
    } catch (error) {
      toast.error("Error saving slot");
    }
  };

  const handleDeleteSlot = async (id) => {
    if (isPastDate) {
      toast.error("Cannot delete past slots");
      return;
    }
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this slot!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d4a373",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${BASE_URL}/slots/${id}`, {
            method: "DELETE",
            headers: { Authorization: `${token}` },
          });
          if (res.ok) {
            setSlots((prev) => ({
              ...prev,
              [dateKey]: prev[dateKey].filter((s) => s.id !== id),
            }));
            toast.success("Slot deleted");
          }
        } catch (error) {
          toast.error("Delete failed");
        }
      }
    });
  };

  const handleRepeatSync = async () => {
    if (isPastDate) return;
    if (!repeatUntilDate) {
      toast.warning("Select an end date");
      return;
    }
    const currentDaySlots = slots[dateKey] || [];
    if (currentDaySlots.length === 0) {
      toast.error("No slots to repeat");
      return;
    }

    setLoading(true);
    try {
      let tempDate = addDays(selectedDate, 1);
      const endDate = parseISO(repeatUntilDate);

      while (!isAfter(tempDate, endDate)) {
        const targetDateStr = format(tempDate, "yyyy-MM-dd");
        for (const slot of currentDaySlots) {
          await fetch(`${BASE_URL}/slots`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`,
            },
            body: JSON.stringify({
              slotDate: targetDateStr,
              startTime: `${slot.startTime}:00`,
              endTime: `${slot.endTime}:00`,
              isAvailable: slot.isAvailable,
              bookedCount: 0,
              maxCapacity: 1,
            }),
          });
        }
        tempDate = addDays(tempDate, 1);
      }
      toast.success("Schedule synced successfully");
      setRepeatModalOpen(false);
      fetchSlots();
    } catch (error) {
      toast.error("Sync interrupted");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (slot = null) => {
    if (isPastDate && !slot) {
      toast.warning("Cannot add slots to past dates");
      return;
    }
    if (slot) {
      setEditingSlot(slot);
      // slot.slotDate is already normalised to "YYYY-MM-DD" in fetchSlots
      setSlotDate(slot.slotDate.substring(0, 10));
      setStartTime(slot.startTime);
      setEndTime(slot.endTime);
      setIsBooked(!slot.isAvailable);
    } else {
      setEditingSlot(null);
      setSlotDate(dateKey);
      // Default: current time rounded to next hour
      const now = new Date();
      const nextHour = new Date(now);
      nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
      setStartTime(format(now, "HH:mm"));
      setEndTime(format(nextHour, "HH:mm"));
      setIsBooked(false);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setRepeatModalOpen(false);
    setEditingSlot(null);
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <div className="modern-calendar">
        <div className="cal-nav">
          <h3>{format(currentMonth, "MMMM yyyy")}</h3>
          <div className="nav-btns">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div className="cal-grid">
          {weekDays.map((d) => (
            <div key={d} className="cal-label">
              {d}
            </div>
          ))}
          {calendarDays.map((day, idx) => {
            const dayKey = format(day, "yyyy-MM-dd");
            const hasSlots = slots[dayKey]?.length > 0;
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const isPast = isBefore(startOfDay(day), startOfDay(new Date()));
            const isOff = !isSameMonth(day, monthStart);
            return (
              <div
                key={idx}
                className={`cal-cell ${isOff ? "off" : ""} ${
                  isSelected ? "selected" : ""
                } ${isToday ? "today" : ""} ${isPast ? "is-past" : ""}`}
                onClick={() => setSelectedDate(day)}
              >
                <span>{format(day, "d")}</span>
                {hasSlots && <div className="dot-indicator" />}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const currentDaySlots = holidays[dateKey] ? [] : slots[dateKey] || [];

  return (
    <div className="slot-mgmt-wrapper">
      <ToastContainer position="top-center" theme="colored" />
      <div className="sv-title-sec">
        <h1>All Slots</h1>
        <p>Manage and organize your parlor slots here</p>
      </div>
      <div className="slot-layout">
        <aside className="slot-sidebar">
          <div className="sidebar-card calendar-card">{renderCalendar()}</div>

          <div
            className={`sidebar-card holiday-card ${
              isPastDate ? "disabled-card" : ""
            }`}
          >
            <div className="card-info">
              <Umbrella
                size={22}
                className={holidays[dateKey] ? "icon-active" : ""}
              />
              <div>
                <h4>Holiday Mode</h4>
                <p>{holidays[dateKey] ? "Store Closed" : "Open for Booking"}</p>
              </div>
            </div>
            <label className="slot-switch">
              <input
                type="checkbox"
                disabled={isPastDate}
                checked={!!holidays[dateKey]}
                onChange={handleToggleHoliday}
              />
              <span className="slot-slider"></span>
            </label>
          </div>

          <button
            className="sync-action-btn"
            disabled={isPastDate || currentDaySlots.length === 0}
            onClick={() => setRepeatModalOpen(true)}
          >
            <RefreshCw size={18} />
            <span>Repeat Slots</span>
          </button>
        </aside>

        <main className="slot-content">
          <div className="content-header">
            <div className="date-display">
              <div className="header-row">
                <h2>{format(selectedDate, "EEEE, MMMM do")}</h2>
                {isPastDate && <span className="past-badge">Past Date</span>}
              </div>
              <p>{currentDaySlots.length} active slots</p>
            </div>
            {!holidays[dateKey] && !isPastDate && (
              <button className="primary-add-btn" onClick={() => openModal()}>
                <Plus size={18} /> Add Slot
              </button>
            )}
          </div>

          {loading ? (
            <div className="slot-loading-state">
              <div className="modern-spinner"></div>
            </div>
          ) : holidays[dateKey] ? (
            <div className="slot-empty-state holiday">
              <div className="empty-icon">
                <Umbrella size={48} />
              </div>
              <h3>Closed for Holiday</h3>
              <p>Customers cannot book appointments on this date.</p>
            </div>
          ) : currentDaySlots.length > 0 ? (
            <div className="slots-grid-view">
              {currentDaySlots.map((slot) => (
                <div
                  key={slot.id}
                  className={`slot-item-card ${
                    !slot.isAvailable ? "is-booked" : ""
                  } ${isPastDate ? "read-only" : ""}`}
                >
                  <div className="item-top">
                    <div className="item-time">
                      <Clock size={16} />
                      <span>
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                    {!isPastDate && (
                      <div className="item-actions">
                        <button title="Edit" onClick={() => openModal(slot)}>
                          <Edit2 size={16} />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="danger"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="item-footer">
                    <span
                      className={`status-pill ${
                        slot.isAvailable ? "free" : "busy"
                      }`}
                    >
                      {slot.isAvailable ? "Available" : "Booked"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="slot-empty-state">
              <div className="empty-icon">
                <CalendarDays size={48} />
              </div>
              <h3>
                {isPastDate
                  ? "No slots were available"
                  : "No slots created yet"}
              </h3>
              <p>
                {isPastDate
                  ? "You cannot modify slots for past dates."
                  : "Setup your appointment availability for this day."}
              </p>
              {!isPastDate && (
                <button className="ghost-add-btn" onClick={() => openModal()}>
                  Create First Slot
                </button>
              )}
            </div>
          )}
        </main>
      </div>

      {(modalOpen || repeatModalOpen) && (
        <div className="slot-modal-backdrop" onClick={closeModal} />
      )}

      {modalOpen && (
        <div className="slot-modal-box animate-pop">
          <div className="modal-top">
            <h4>{editingSlot ? "Edit Time Slot" : "Create New Slot"}</h4>
            <button className="close-x" onClick={closeModal}>
              <X size={20} />
            </button>
          </div>
          <div className="modal-mid">
            <div className="field-group">
              <label>Date</label>
              <input
                type="date"
                disabled={!!editingSlot}
                min={todayDateStr}
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
              />
            </div>
            <div className="field-row">
              <div className="field-group">
                <label>Start</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="field-group">
                <label>End</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
            <div className="field-toggle-row">
              <div className="toggle-label">
                <AlertCircle size={16} />
                <span>Mark as already booked</span>
              </div>
              <label className="slot-switch">
                <input
                  type="checkbox"
                  checked={isBooked}
                  onChange={(e) => setIsBooked(e.target.checked)}
                />
                <span className="slot-slider"></span>
              </label>
            </div>
          </div>
          <div className="modal-bot">
            <button className="slot-btn-secondary" onClick={closeModal}>
              Cancel
            </button>
            <button className="slot-btn-primary" onClick={handleSaveSlot}>
              Save Appointment Slot
            </button>
          </div>
        </div>
      )}

      {repeatModalOpen && (
        <div className="slot-modal-box small animate-pop">
          <div className="modal-top">
            <h4>Batch Schedule Sync</h4>
            <button
              className="close-x"
              onClick={() => setRepeatModalOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
          <div className="modal-mid">
            <p className="hint">
              This will copy today's slots to all future dates until the
              selected date.
            </p>
            <div className="field-group">
              <label>Repeat Until Date</label>
              <input
                type="date"
                min={format(addDays(new Date(), 1), "yyyy-MM-dd")}
                value={repeatUntilDate}
                onChange={(e) => setRepeatUntilDate(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-bot">
            <button
              className="slot-btn-primary full"
              onClick={handleRepeatSync}
            >
              Start Batch Sync
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SlotScreen;
