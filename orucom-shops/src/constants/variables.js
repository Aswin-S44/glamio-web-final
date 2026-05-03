export const APPOINTMENT_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  REJECT: 'rejected',
};

export const BACKEND_URL =
  'https://beauty-parlor-app-backend.onrender.com/api/v1/user';

export const USER_TYPES = {
  CUSTOMER: 'CUSTOMER',
  BEAUTY_SHOP: 'BEAUTY_SHOP',
};

export const CLOUDINARY_URL =
  'https://api.cloudinary.com/v1_1/personalprojectaswins/image/upload';

export const CLOUDINARY_UPLOAD_PRESET = 'cloudinary_react';

export const APPOINTMENT_STATUS_MAPPINGS = {
  CONFIRMED: 'confirmed',
  PENDING: 'pending',
  REJECT: 'rejected',
};

export const NO_IMAGE = 'https://via.placeholder.com/150';

export const NOTIFICATION_TYPES = {
  APPOINTMENT_REQUEST: 'appointment_request',
  STATUS_CHANGE_REMINDER: 'status_change_reminder',
  WELCOME_NOTIFICATION: 'welcome_notification',
  APPOINTMENT_ACCEPTED: 'appointment_accepted',
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
