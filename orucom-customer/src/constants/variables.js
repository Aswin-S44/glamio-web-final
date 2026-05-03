export const APPOINTMENT_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};

export const BACKEND_URL = `https://beauty-parlor-app-backend.onrender.com`;

//export const BACKEND_URL = `http://10.130.97.171:5000`;

export const NOTIFICATION_TYPES = {
  APPOINTMENT_REQUEST: 'appointment_request',
  STATUS_CHANGE_REMINDER: 'status_change_reminder',
  WELCOME_NOTIFICATION: 'welcome_notification',
};

export const USER_TYPES = {
  CUSTOMER: 'CUSTOMER',
  BEAUTY_SHOP: 'BEAUTY_SHOP',
};

export const APPOINTMENT_TYPES = {
  BOOKING_ACCEPTED: 'BOOKING_ACCEPTED',
  BOOKING_REJECTED: 'BOOKING_REJECTED',
  BOOKING_REQUEST_SENT: 'BOOKING_REQUEST_SENT',
};

export const getNotificationTitle = notificationType => {
  if (notificationType == APPOINTMENT_TYPES.BOOKING_ACCEPTED) {
    return 'Booking accepted';
  } else if (notificationType == APPOINTMENT_TYPES.BOOKING_REJECTED) {
    return 'Booking rejected';
  } else if (notificationType == APPOINTMENT_TYPES.BOOKING_REQUEST_SENT) {
    return 'New booking Request';
  }
};
