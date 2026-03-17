import React, { useState } from "react";
import "./NotificationScreen.css";

const initialNotifications = [
  {
    id: 1,
    name: "Aswin S",
    time: "27m ago",
    read: false,
  },
  {
    id: 2,
    name: "ARSHAD PE",
    time: "11/1/2026",
    read: false,
  },
  {
    id: 3,
    name: "Aswin S",
    time: "9/1/2026",
    read: false,
  },
  {
    id: 4,
    name: "Aswin S",
    time: "9/1/2026",
    read: true,
  },
];

function NotificationScreen() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [view, setView] = useState("all");

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, read: true } : item
      )
    );
  };

  const toggleRead = (id) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, read: !item.read } : item
      )
    );
  };

  const filteredNotifications = notifications.filter((item) => {
    if (view === "unread") return !item.read;
    if (view === "read") return item.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="notification-wrapper">
     

      <div className="view-tabs">
        <button
          className={view === "all" ? "active" : ""}
          onClick={() => setView("all")}
        >
          All
        </button>
        <button
          className={view === "unread" ? "active" : ""}
          onClick={() => setView("unread")}
        >
          Unread
        </button>
        <button
          className={view === "read" ? "active" : ""}
          onClick={() => setView("read")}
        >
          Read
        </button>
      </div>

      <div className="notification-list">
        {filteredNotifications.map((item) => (
          <div
            key={item.id}
            className={`notification-card ${
              !item.read ? "unread" : "read"
            }`}
            onClick={() => markAsRead(item.id)}
          >
            <div className="avatar">
              {item.name.charAt(0)}
            </div>

            <div className="content">
              <p className="heading">Appointment Request</p>
              <p className="sub-text">
                {item.name} sent an appointment request
              </p>
            </div>

            <div className="right">
              <span className="time">{item.time}</span>
              {!item.read && <span className="dot" />}
              <button
                className="toggle-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleRead(item.id);
                }}
              >
                {item.read ? "Unread" : "Read"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NotificationScreen;
