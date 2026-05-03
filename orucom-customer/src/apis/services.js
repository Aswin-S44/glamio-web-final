import api from '../config/api';
import { GOOGLE_MAPS_API_KEY, CLOUDINARY_DOC } from '@env';

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_DOC}/image/upload`;
const CLOUDINARY_UPLOAD_PRESET = 'cloudinary_react';

// ─── Shops ─────────────────────────────────────────────────────────────────

export const getAllParlours = async () => {
  const { data } = await api.get('/customer/shops');
  return data.shops || [];
};

export const getAllNearbyParlors = async onUpdate => {
  try {
    const shops = await getAllParlours();
    onUpdate(shops);
  } catch {
    onUpdate([]);
  }
  return () => {};
};

export const getParlourById = async id => {
  const { data } = await api.get(`/customer/shop/${id}`);
  return data;
};

// ─── Services ──────────────────────────────────────────────────────────────

export const getServicesByShop = async shopId => {
  const { data } = await api.get('/customer/services');
  return (data.services || []).filter(s => s.shopId === shopId);
};

export const getServiceById = async (_shopId, serviceId) => {
  const { data } = await api.get(`/customer/service/${serviceId}`);
  return data;
};

// ─── Experts ───────────────────────────────────────────────────────────────

export const getExpertsByShopId = async shopId => {
  const { data } = await api.get(`/customer/experts/${shopId}`);
  return data.experts || [];
};

export const getExpertsWithShopDetailsByShopId = async expertId => {
  try {
    const { data } = await api.get(`/customer/service/${expertId}`);
    return data;
  } catch {
    return null;
  }
};

// ─── Offers ────────────────────────────────────────────────────────────────

export const getOffersByShop = async _shopId => {
  return [];
};

export const getOfferByServiceAndShop = async (_serviceId, _shopId) => {
  return null;
};

// ─── Appointments ──────────────────────────────────────────────────────────

export const createAppointment = async (_userId, appointmentData) => {
  try {
    const { data } = await api.post('/customer/booking', appointmentData);
    return { success: true, id: data.appointment?.id, message: 'Appointment created' };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const getAppointmentsByCustomerId = async _customerId => {
  try {
    const { data } = await api.get('/appointments/my');
    return data.appointments || [];
  } catch {
    return [];
  }
};

// ─── Customer profile ──────────────────────────────────────────────────────

export const getCustomerById = async _id => {
  try {
    const { data } = await api.get('/auth/me');
    return data;
  } catch {
    return null;
  }
};

export const updateUserData = async (_uid, updateData) => {
  try {
    if (
      updateData.profileImage &&
      typeof updateData.profileImage === 'string' &&
      (updateData.profileImage.startsWith('file://') ||
        updateData.profileImage.startsWith('data:image/'))
    ) {
      const formData = new FormData();
      formData.append('file', {
        uri: updateData.profileImage,
        type: 'image/jpeg',
        name: 'upload.jpg',
      });
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: formData });
      const resData = await res.json();
      if (resData.secure_url) {
        updateData.profileImage = resData.secure_url;
      } else {
        return false;
      }
    }

    await api.patch('/auth/profile', updateData);
    return true;
  } catch {
    return false;
  }
};

export const updateCustomer = async (_uid, dataToUpdate) => {
  try {
    await api.patch('/auth/profile', dataToUpdate);
    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  }
};

// ─── Notifications ─────────────────────────────────────────────────────────

export const getNotificationsByCustomerId = async _userId => {
  try {
    const { data } = await api.get('/customer/notifications');
    return data.notifications || [];
  } catch {
    return [];
  }
};

export const getNotificationsCountByCustomerId = async _customerId => {
  try {
    const { data } = await api.get('/customer/notifications');
    const list = data.notifications || [];
    return list.filter(n => !n.isRead).length;
  } catch {
    return 0;
  }
};

export const markNotificationAsRead = async id => {
  try {
    await api.patch(`/customer/notifications/${id}/read`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  }
};

export const deleteNotificationById = async _id => {
  return { success: true };
};

export const sendAppointmentNotification = async (
  customerId,
  shopId,
  appointmentType,
  appointmentId,
) => {
  try {
    await api.post('/notifications', { customerId, shopId, appointmentType, appointmentId });
  } catch {}
};

// ─── Gallery / Reviews (Google Maps) ───────────────────────────────────────

export const getReviews = async (placeId, _page = 0) => {
  try {
    const { data } = await api.get(`/customer/reviews/${placeId}`);
    return data;
  } catch {
    return { rating: 0, reviews: [] };
  }
};

export const getGalleryImages = async (placeId, _page = 0) => {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${GOOGLE_MAPS_API_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const photos = data.result?.photos || [];
    return photos.map(
      p =>
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${p.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`,
    );
  } catch {
    return [];
  }
};

export const getGalleryImagesByShopId = async _shopId => {
  return [];
};

export const getShopStatus = async placeId => {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=opening_hours&key=${GOOGLE_MAPS_API_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const isOpen = data?.result?.opening_hours?.open_now;
    if (isOpen === true) return 'Open';
    if (isOpen === false) return 'Closed';
    return 'Unavailable';
  } catch {
    return 'Unknown';
  }
};

// ─── Slots ─────────────────────────────────────────────────────────────────

export const updateSlotInFirestore = async (slotId, slotData) => {
  return { success: true };
};

// ─── Notifications (shop-specific) ─────────────────────────────────────────

export const createNotification = async () => {
  return { success: true };
};

export const updateShopViewers = async _shopId => {};

export const getDocumentFieldById = async (_collection, _id, _field) => {
  return null;
};
