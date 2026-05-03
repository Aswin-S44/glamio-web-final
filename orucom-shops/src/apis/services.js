import api from '../config/api';
import {
  APPOINTMENT_TYPES,
  CLOUDINARY_UPLOAD_PRESET,
  CLOUDINARY_URL,
} from '../constants/variables';

// ─── Image upload helper ────────────────────────────────────────────────────

const uploadToCloudinary = async uri => {
  const formData = new FormData();
  formData.append('file', { uri, type: 'image/jpeg', name: 'upload.jpg' });
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: formData });
  const data = await res.json();
  return data.secure_url || null;
};

// ─── Services ──────────────────────────────────────────────────────────────

export const addServices = async (_shopId, data, imageUri) => {
  try {
    if (imageUri) {
      const url = await uploadToCloudinary(imageUri);
      if (!url) return false;
      data.imageUrl = url;
    }
    await api.post('/services', data);
    return true;
  } catch {
    return false;
  }
};

export const getShopServices = async _shopId => {
  try {
    const { data } = await api.get('/services');
    return data.services || [];
  } catch {
    return [];
  }
};

export const updateService = async (id, updateData) => {
  try {
    if (updateData.imageUri && !updateData.imageUri.startsWith('https://')) {
      const url = await uploadToCloudinary(updateData.imageUri);
      if (url) updateData.imageUrl = url;
    }
    await api.patch(`/services/${id}`, updateData);
    return true;
  } catch {
    return false;
  }
};

export const deleteService = async (serviceId, _shopId) => {
  try {
    await api.delete(`/services/${serviceId}`);
    return { success: true };
  } catch (err) {
    throw err;
  }
};

// ─── Experts ───────────────────────────────────────────────────────────────

export const addBeautyExpert = async (_shopId, data, imageUri) => {
  try {
    if (imageUri) {
      const url = await uploadToCloudinary(imageUri);
      if (!url) return false;
      data.imageUrl = url;
    }
    await api.post('/expert', data);
    return true;
  } catch {
    return false;
  }
};

export const getBeautyExperts = async _shopId => {
  try {
    const { data } = await api.get('/expert');
    return data.experts || [];
  } catch {
    return [];
  }
};

export const updateBeautyExpert = async (id, updateData) => {
  try {
    if (updateData.imageUri && !updateData.imageUri.startsWith('https://')) {
      const url = await uploadToCloudinary(updateData.imageUri);
      if (url) updateData.imageUrl = url;
    }
    await api.patch(`/expert/${id}`, updateData);
    return true;
  } catch {
    return false;
  }
};

export const deleteExpert = async (expertId, _shopId) => {
  try {
    await api.delete(`/expert/${expertId}`);
    return { success: true };
  } catch (err) {
    throw err;
  }
};

// ─── Offers ────────────────────────────────────────────────────────────────

export const addOffer = async (_shopId, data) => {
  try {
    if (data.imageUrl && !data.imageUrl.startsWith('https://')) {
      const url = await uploadToCloudinary(data.imageUrl);
      if (!url) return false;
      data.imageUrl = url;
    }
    await api.post('/offers', data);
    return true;
  } catch {
    return false;
  }
};

export const getOffersByShop = async _shopId => {
  try {
    const { data } = await api.get('/offers');
    return data.offers || [];
  } catch {
    return [];
  }
};

export const updateServiceOffer = async (id, updateData) => {
  try {
    await api.patch(`/offers/${id}`, updateData);
    return true;
  } catch {
    return false;
  }
};

export const deleteOffer = async (offerId, _shopId) => {
  try {
    await api.delete(`/offers/${offerId}`);
    return { success: true };
  } catch (err) {
    throw err;
  }
};

// ─── Slots ─────────────────────────────────────────────────────────────────

export const getShopSlots = async _shopId => {
  try {
    const { data } = await api.get('/slots');
    return { success: true, data: data.slots || [] };
  } catch {
    return { success: true, data: [] };
  }
};

export const getSlotsByDate = async (_shopId, date) => {
  try {
    const { data } = await api.get('/slots');
    const slots = (data.slots || []).filter(s => s.date === date);
    return { success: true, data: slots };
  } catch {
    return { success: true, data: [] };
  }
};

export const deleteSlot = async (slotId, _shopId) => {
  try {
    await api.delete(`/slots/${slotId}`);
    return { success: true };
  } catch (err) {
    throw err;
  }
};

// ─── Appointments ──────────────────────────────────────────────────────────

export const getAppointmentsByShopId = async _shopId => {
  try {
    const { data } = await api.get('/appointments');
    return data.appointments || [];
  } catch {
    return [];
  }
};

export const getUserPendingRequests = async _shopId => {
  try {
    const { data } = await api.get('/appointments');
    return (data.appointments || []).filter(
      a => (a.appointmentStatus || a.status || '').toLowerCase() === 'pending',
    );
  } catch {
    return [];
  }
};

export const getUserRequests = getUserPendingRequests;

export const getAppointmentStats = async _shopId => {
  try {
    const { data } = await api.get('/shops/stats');
    return {
      totalAppointments: data.totalAppointments ?? 0,
      pendingCount: data.pendingCount ?? 0,
      confirmedCount: data.confirmedCount ?? 0,
      completedCount: data.completedCount ?? 0,
    };
  } catch {
    return { totalAppointments: 0, pendingCount: 0, confirmedCount: 0, completedCount: 0 };
  }
};

export const confirmAppointment = async (id, _shopId) => {
  try {
    await api.patch(`/appointments/${id}/approve`, { status: 'confirmed' });
    return { success: true };
  } catch (err) {
    throw err;
  }
};

export const rejectAppointment = async (id, _shopId) => {
  try {
    await api.patch(`/appointments/${id}/approve`, { status: 'rejected' });
    return { success: true };
  } catch (err) {
    throw err;
  }
};

export const subscribeToUserPendingRequests = (shopId, onUpdate, onError) => {
  let cancelled = false;
  (async () => {
    try {
      const result = await getUserPendingRequests(shopId);
      if (!cancelled) onUpdate(result);
    } catch (err) {
      if (!cancelled) onError(err);
    }
  })();
  return () => { cancelled = true; };
};

// ─── User / Shop profile ───────────────────────────────────────────────────

export const getUserData = async _uid => {
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
      updateData.profileImage.startsWith('file://')
    ) {
      const url = await uploadToCloudinary(updateData.profileImage);
      if (url) updateData.profileImage = url;
      else return false;
    }
    await api.patch('/auth/profile', updateData);
    return true;
  } catch {
    return false;
  }
};

// ─── Notifications ─────────────────────────────────────────────────────────

export const getNotificationsByShopId = async _shopId => {
  try {
    const { data } = await api.get('/shops/notifications');
    return data.notifications || [];
  } catch {
    return [];
  }
};

export const getNotificationsCountByShopId = async _shopId => {
  try {
    const { data } = await api.get('/shops/notifications');
    return (data.notifications || []).filter(n => !n.isRead).length;
  } catch {
    return 0;
  }
};

export const markNotificationAsRead = async id => {
  try {
    await api.patch(`/shops/notifications/${id}/read`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  }
};

export const getNotificationDetails = async notificationId => {
  try {
    const { data } = await api.get(`/shops/notifications/${notificationId}`);
    return data;
  } catch {
    return null;
  }
};

export const getPendingRequestsCount = async _shopId => {
  try {
    const list = await getUserPendingRequests(_shopId);
    return list.length;
  } catch {
    return 0;
  }
};

export const createNotification = async () => ({ success: true });

export const sendAppointmentNofification = async (customerId, shopId, appointmentType) => {
  try {
    await api.post('/notifications', { customerId, shopId, appointmentType });
  } catch {}
};
