import React, { useEffect, useMemo, useState } from "react";
import "./NotificationScreen.css";
import { apiRequest } from "../../utils/api.util";

const getNotificationTitle = (typeName) => {
  switch (typeName) {
    case "accepted":
      return "Confirmed";
    case "rejected":
      return "Booking Rejected";
    case "completed":
      return "Appointment Completed";
    default:
      return "Appointment Request";
  }
};

const getNotificationSubText = (typeName, name) => {
  switch (typeName) {
    case "accepted":
      return `${name} confirmed your booking`;
    case "rejected":
      return `${name} declined your booking`;
    case "completed":
      return `Your appointment at ${name} is complete`;
    default:
      return `${name} sent an appointment request`;
  }
};

function NotificationScreen() {
  const [notifications, setNotifications] = useState([]);
  const [view, setView] = useState("all");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await apiRequest("/notifications");
        const mapped = Array.isArray(data?.data)
          ? data.data.map((notification) => ({
              id: notification.id,
              name:
                notification.fromUser?.username ||
                notification.fromUser?.email ||
                "Customer",
              time: notification.createdAt
                ? new Date(notification.createdAt).toLocaleDateString("en-IN")
                : "",
              read: Boolean(notification.isRead),
              typeName: notification.notificationType?.name ?? "requested",
              message: notification.notification?.message ?? "",
            }))
          : [];

        if (mapped.length > 0) {
          setNotifications(mapped);
        }
      } catch (error) {
        // Fall back to demo notifications when the API is unavailable.
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await apiRequest(`/notifications/notifications/${id}/read`, {
        method: "PATCH",
      });
    } catch (error) {
      // Keep the UI responsive even if marking as read fails.
    }

    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  };

  const toggleRead = (id) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, read: !item.read } : item
      )
    );
  };

  const filteredNotifications = useMemo(
    () =>
      notifications.filter((item) => {
        if (view === "unread") return !item.read;
        if (view === "read") return item.read;
        return true;
      }),
    [notifications, view]
  );

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
            className={`notification-card ${!item.read ? "unread" : "read"}`}
            onClick={() => markAsRead(item.id)}
          >
            <div className="avatar">{item.name.charAt(0)}</div>

            <div className="content">
              <p className="heading">{getNotificationTitle(item.typeName)}</p>
              <p className="sub-text">
                {item.message ||
                  getNotificationSubText(item.typeName, item.name)}
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
