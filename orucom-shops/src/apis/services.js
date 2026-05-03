import firestore from '@react-native-firebase/firestore';
import {
  APPOINTMENT_STATUS_MAPPINGS,
  APPOINTMENT_STATUSES,
  APPOINTMENT_TYPES,
  BACKEND_URL,
  CLOUDINARY_UPLOAD_PRESET,
  CLOUDINARY_URL,
  NOTIFICATION_TYPES,
} from '../constants/variables';
import { COLLECTIONS } from '../constants/collections';
import axios from 'axios';

export const addServices = async (shopId, data, imageUri) => {
  try {
    let imageUrl = '';
    if (imageUri) {
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'upload.jpg',
      });
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
      });
      const responseData = await response.json();
      if (responseData.secure_url) {
        imageUrl = responseData.secure_url;
      } else {
        return false;
      }
    }

    await firestore()
      .collection(COLLECTIONS.SERVICES)
      .add({
        shopId: shopId,
        ...data,
        imageUrl,
        createdAt: new Date(),
      });

    return true;
  } catch (error) {
    return false;
  }
};

export const getShopServices = async shopId => {
  try {
    const querySnapshot = await firestore()
      .collection(COLLECTIONS.SERVICES)
      .where('shopId', '==', shopId)
      .get();

    const services = [];
    querySnapshot.forEach(doc => {
      services.push({ id: doc.id, ...doc.data() });
    });

    return services;
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
};

export const addBeautyExpert = async (shopId, data, imageUri) => {
  try {
    let imageUrl = '';
    if (imageUri) {
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'upload.jpg',
      });
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
      });
      const responseData = await response.json();
      if (responseData.secure_url) {
        imageUrl = responseData.secure_url;
      } else {
        return false;
      }
    }

    await firestore()
      .collection(COLLECTIONS.BEAUTY_EXPERTS)
      .add({
        shopId: shopId,
        ...data,
        imageUrl,
        createdAt: new Date(),
      });

    return true;
  } catch (error) {
    return false;
  }
};

export const getBeautyExperts = async shopId => {
  try {
    const querySnapshot = await firestore()
      .collection(COLLECTIONS.BEAUTY_EXPERTS)
      .where('shopId', '==', shopId)
      .get();

    const experts = [];
    querySnapshot.forEach(doc => {
      experts.push({ id: doc.id, ...doc.data() });
    });

    return experts;
  } catch (error) {
    console.error('Error fetching experts:', error);
    return [];
  }
};

export const getUserData = async uid => {
  try {
    const docSnap = await firestore()
      .collection(COLLECTIONS.SHOP_OWNERS)
      .doc(uid)
      .get();

    if (docSnap.exists) {
      return docSnap.data();
    }
    return null;
  } catch (e) {
    return null;
  }
};

export const updateUserData = async (uid, updateData) => {
  try {
    if (
      updateData.profileImage &&
      typeof updateData.profileImage === 'string' &&
      updateData.profileImage.startsWith('file://')
    ) {
      const formData = new FormData();
      formData.append('file', {
        uri: updateData.profileImage,
        type: 'image/jpeg',
        name: 'upload.jpg',
      });
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
      });
      const responseData = await response.json();
      if (responseData.secure_url) {
        updateData.profileImage = responseData.secure_url;
      } else {
        return false;
      }
    }

    await firestore()
      .collection(COLLECTIONS.SHOP_OWNERS)
      .doc(uid)
      .update(updateData);
    return true;
  } catch (error) {
    console.error('Error updating user data:', error);
    return false;
  }
};

export const addOffer = async (shopId, data) => {
  try {
    let imageUrl = '';
    if (data.imageUrl) {
      const formData = new FormData();
      formData.append('file', {
        uri: data.imageUrl,
        type: 'image/jpeg',
        name: 'offer_upload.jpg',
      });
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();
      if (responseData.secure_url) {
        imageUrl = responseData.secure_url;
      } else {
        console.error(
          'Error uploading offer image to Cloudinary: ',
          responseData,
        );
        return false;
      }
    }

    await firestore()
      .collection(COLLECTIONS.OFFERS)
      .add({
        shopId: shopId,
        ...data,
        imageUrl,
        createdAt: new Date(),
      });

    return true;
  } catch (error) {
    console.error('Error while adding offer: ', error);
    return false;
  }
};

export const getOffersByShop = async shopId => {
  try {
    const querySnapshot = await firestore()
      .collection(COLLECTIONS.OFFERS)
      .where('shopId', '==', shopId)
      .get();

    const offers = await Promise.all(
      querySnapshot.docs.map(async offerDoc => {
        const offerData = offerDoc.data();
        const serviceSnap = await firestore()
          .collection(COLLECTIONS.SERVICES)
          .doc(offerData.serviceId)
          .get();

        return {
          id: offerDoc.id,
          ...offerData,
          service: serviceSnap.exists
            ? { id: serviceSnap.id, ...serviceSnap.data() }
            : null,
        };
      }),
    );

    return offers;
  } catch (error) {
    console.error('Error fetching offers:', error);
    return [];
  }
};

export const getUserRequests = async shopId => {
  try {
    const querySnapshot = await firestore()
      .collection(COLLECTIONS.APPOINTMENTS)
      .where('shopId', '==', shopId)
      .get();

    const userRequests = [];
    querySnapshot.forEach(doc => {
      userRequests.push({ id: doc.id, ...doc.data() });
    });

    return userRequests;
  } catch (error) {
    console.error('Error fetching user requests:', error);
    return [];
  }
};

export const getAppointmentsByShopId = async shopId => {
  try {
    const querySnapshot = await firestore()
      .collection(COLLECTIONS.APPOINTMENTS)
      .where('shopId', '==', shopId)
      .where('appointmentStatus', 'in', [
        APPOINTMENT_STATUS_MAPPINGS.CONFIRMED,
        APPOINTMENT_STATUS_MAPPINGS.PENDING,
        APPOINTMENT_STATUS_MAPPINGS.REJECT,
      ])
      .get();

    const offerSnap = await firestore()
      .collection(COLLECTIONS.OFFERS)
      .where('shopId', '==', shopId)
      .get();

    const offers = offerSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const results = await Promise.all(
      querySnapshot.docs.map(async appointmentDoc => {
        const appointmentData = appointmentDoc.data();
        const { expertId, serviceIds = [], customerId } = appointmentData;

        let expertData = null;
        if (expertId) {
          const expertSnap = await firestore()
            .collection(COLLECTIONS.BEAUTY_EXPERTS)
            .doc(expertId)
            .get();
          if (expertSnap.exists)
            expertData = { id: expertSnap.id, ...expertSnap.data() };
        }

        const serviceData = await Promise.all(
          serviceIds.map(async serviceId => {
            const serviceSnap = await firestore()
              .collection(COLLECTIONS.SERVICES)
              .doc(serviceId)
              .get();
            return serviceSnap.exists
              ? { id: serviceSnap.id, ...serviceSnap.data() }
              : null;
          }),
        );

        let customerData = null;
        if (customerId) {
          const customerSnap = await firestore()
            .collection(COLLECTIONS.CUSTOMERS)
            .doc(customerId.trim())
            .get();
          if (customerSnap.exists)
            customerData = { id: customerSnap.id, ...customerSnap.data() };
        }

        const shopOffers = offers.filter(o => o.shopId === shopId);

        return {
          id: appointmentDoc.id,
          ...appointmentData,
          expert: expertData,
          services: serviceData.filter(s => s !== null),
          customer: customerData,
          offers: shopOffers,
        };
      }),
    );

    return results;
  } catch (error) {
    throw error;
  }
};

export const getUserPendingRequests = async shopId => {
  try {
    const querySnapshot = await firestore()
      .collection(COLLECTIONS.APPOINTMENTS)
      .where('shopId', '==', shopId)
      .where('appointmentStatus', '==', APPOINTMENT_STATUSES.PENDING)
      .get();

    const offersSnapshot = await firestore()
      .collection(COLLECTIONS.OFFERS)
      .where('shopId', '==', shopId)
      .get();

    const shopOffers = offersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const results = await Promise.all(
      querySnapshot.docs.map(async appointmentDoc => {
        const appointmentData = appointmentDoc.data();
        const { expertId, serviceIds = [], customerId } = appointmentData;

        let expertData = null;
        if (expertId) {
          const expertSnap = await firestore()
            .collection(COLLECTIONS.BEAUTY_EXPERTS)
            .doc(expertId)
            .get();
          if (expertSnap.exists)
            expertData = { id: expertSnap.id, ...expertSnap.data() };
        }

        const services = await Promise.all(
          serviceIds.map(async serviceId => {
            const serviceSnap = await firestore()
              .collection(COLLECTIONS.SERVICES)
              .doc(serviceId)
              .get();
            return serviceSnap.exists
              ? { id: serviceSnap.id, ...serviceSnap.data() }
              : null;
          }),
        );

        const validServices = services.filter(s => s !== null);

        let customerData = null;
        if (customerId) {
          const customerSnap = await firestore()
            .collection(COLLECTIONS.CUSTOMERS)
            .doc(customerId.trim())
            .get();
          if (customerSnap.exists)
            customerData = { id: customerSnap.id, ...customerSnap.data() };
        }

        let offerAvailable = false;
        let offerPrice = null;

        if (serviceIds.length > 0 && shopOffers.length > 0) {
          const applicableOffers = shopOffers.filter(offer =>
            serviceIds.includes(offer.serviceId),
          );
          if (applicableOffers.length > 0) {
            offerAvailable = true;
            offerPrice =
              applicableOffers[0].price || applicableOffers[0].offerPrice;
          }
        }

        return {
          id: appointmentDoc.id,
          ...appointmentData,
          expert: expertData,
          customer: customerData,
          services: validServices,
          offerAvailable,
          ...(offerAvailable && { offerPrice }),
        };
      }),
    );

    return results;
  } catch (error) {
    console.error('Error fetching pending appointments:', error);
    throw error;
  }
};
export const createNotification = async (
  fromId,
  toId,
  message,
  shopName,
  profileImage,
) => {
  try {
    const notificationData = {
      fromId,
      toId,
      notificationType: NOTIFICATION_TYPES.APPOINTMENT_ACCEPTED,
      createdAt: new Date(),
      isRead: false,
      message,
      shopName,
      profileImage,
    };

    const docRef = await firestore()
      .collection(COLLECTIONS.NOTIFICATIONS)
      .add(notificationData);

    return {
      success: true,
      id: docRef.id,
      message: 'notification created successfully',
    };
  } catch (error) {
    console.error('Error creating notification:', error);
    return {
      success: false,
      message: error.message,
    };
  }
};

export const sendAppointmentNofification = async (
  customerId,
  shopId,
  appointmentType,
) => {
  try {
    const url = `${BACKEND_URL}/appointment`;
    await axios.post(url, {
      customerId,
      shopId,
      appointmentType,
    });
  } catch (error) {
    return error;
  }
};

export const confirmAppointment = async (
  id,
  shopId,
  shopName = null,
  profileImage,
) => {
  try {
    const appointmentRef = firestore()
      .collection(COLLECTIONS.APPOINTMENTS)
      .doc(id);
    const appointmentSnap = await appointmentRef.get();

    if (!appointmentSnap.exists) {
      throw new Error('Appointment not found');
    }

    const appointmentData = appointmentSnap.data();

    if (appointmentData.shopId !== shopId) {
      throw new Error('Appointment does not belong to this shop');
    }

    await appointmentRef.update({
      appointmentStatus: APPOINTMENT_STATUSES.CONFIRMED,
      confirmedAt: new Date(),
    });

    await sendAppointmentNofification(
      appointmentData.customerId,
      shopId,
      APPOINTMENT_TYPES.BOOKING_ACCEPTED,
    );
    let message = 'Your booking accepted';

    await createNotification(
      shopId,
      appointmentData.customerId,
      message,
      shopName,
      profileImage,
    );

    return { success: true, message: 'Appointment confirmed successfully' };
  } catch (error) {
    console.error('Error confirming appointment:', error);
    throw error;
  }
};

export const getAppointmentStats = async shopId => {
  try {
    const querySnapshot = await firestore()
      .collection(COLLECTIONS.APPOINTMENTS)
      .where('shopId', '==', shopId)
      .get();

    let totalAppointments = 0;
    let pendingCount = 0;
    let confirmedCount = 0;
    let completedCount = 0;

    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      totalAppointments++;

      switch (data.appointmentStatus) {
        case APPOINTMENT_STATUSES.PENDING:
          pendingCount++;
          break;
        case APPOINTMENT_STATUSES.CONFIRMED:
          confirmedCount++;
          break;
        case APPOINTMENT_STATUSES.COMPLETED:
          completedCount++;
          break;
        default:
          break;
      }
    });

    return {
      totalAppointments,
      pendingCount,
      confirmedCount,
      completedCount,
    };
  } catch (error) {
    console.error('Error fetching appointment stats:', error);
    throw error;
  }
};

export const rejectAppointment = async (id, shopId) => {
  try {
    const appointmentRef = firestore()
      .collection(COLLECTIONS.APPOINTMENTS)
      .doc(id);
    const appointmentSnap = await appointmentRef.get();

    if (!appointmentSnap.exists) {
      throw new Error('Appointment not found');
    }

    const appointmentData = appointmentSnap.data();

    if (appointmentData.shopId !== shopId) {
      throw new Error('Appointment does not belong to this shop');
    }

    if (appointmentData.appointmentStatus !== 'pending') {
      throw new Error('Appointment is not in pending status');
    }

    await appointmentRef.update({
      appointmentStatus: APPOINTMENT_STATUSES.REJECT,
      cancelledAt: new Date(),
    });

    await sendAppointmentNofification(
      appointmentData.customerId,
      shopId,
      APPOINTMENT_TYPES.BOOKING_REJECTED,
    );

    return { success: true, message: 'Appointment cancelled successfully' };
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    throw error;
  }
};

export const getShopSlots = async shopId => {
  try {
    const querySnapshot = await firestore()
      .collection(COLLECTIONS.SLOTS)
      .where('shopId', '==', shopId)
      .get();

    const slots = [];
    querySnapshot.forEach(doc => {
      slots.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: slots };
  } catch (error) {
    console.error('Error getting shop slots:', error);
    throw error;
  }
};

export const getSlotsByDate = async (shopId, date) => {
  try {
    const querySnapshot = await firestore()
      .collection(COLLECTIONS.SLOTS)
      .where('shopId', '==', shopId)
      .where('date', '==', date)
      .get();

    const slots = [];
    querySnapshot.forEach(doc => {
      slots.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: slots };
  } catch (error) {
    console.error('Error getting slots by date:', error);
    throw error;
  }
};

export const deleteSlot = async (slotId, shopId) => {
  try {
    const slotRef = firestore().collection(COLLECTIONS.SLOTS).doc(slotId);
    const slotSnap = await slotRef.get();

    if (!slotSnap.exists) {
      throw new Error('Slot not found');
    }

    const slotData = slotSnap.data();

    if (slotData.shopId !== shopId) {
      throw new Error('Slot does not belong to this shop');
    }

    await slotRef.delete();

    return { success: true, message: 'Slot deleted successfully' };
  } catch (error) {
    console.error('Error deleting slot:', error);
    throw error;
  }
};

// export const getNotificationsByShopId = async userId => {
//   try {
//     const querySnapshot = await firestore()
//       .collection(COLLECTIONS.NOTIFICATIONS)
//       .where('toId', '==', userId)
//       .get();

//     if (querySnapshot.empty) return [];

//     const notifications = querySnapshot.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data(),
//     }));

//     return notifications;
//   } catch (error) {
//     console.error('Error fetching notifications:', error);
//     return [];
//   }
// };

export const getNotificationsByShopId = async userId => {
  try {
    const querySnapshot = await firestore()
      .collection(COLLECTIONS.NOTIFICATIONS)
      .where('toId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    if (querySnapshot.empty) return [];

    const notifications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

export const markNotificationAsRead = async id => {
  try {
    const notificationRef = firestore()
      .collection(COLLECTIONS.NOTIFICATIONS)
      .doc(id);
    const docSnapshot = await notificationRef.get();

    if (!docSnapshot.exists) {
      return { success: false, message: 'Notification not found' };
    }

    await notificationRef.update({
      isRead: true,
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating notification:', error);
    return { success: false, error };
  }
};

export const deleteService = async (serviceId, shopId) => {
  try {
    const serviceRef = firestore()
      .collection(COLLECTIONS.SERVICES)
      .doc(serviceId);
    const serviceSnap = await serviceRef.get();

    if (!serviceSnap.exists) {
      throw new Error('Services not exist not found');
    }

    const serviceData = serviceSnap.data();

    if (serviceData.shopId !== shopId) {
      throw new Error('Service does not belong to this shop');
    }

    await serviceRef.delete();

    return { success: true, message: 'Service deleted successfully' };
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
};

export const updateService = async (uid, updateData) => {
  try {
    if (!updateData.imageUri.startsWith('https://')) {
      const formData = new FormData();
      formData.append('file', {
        uri: updateData.imageUri,
        type: 'image/jpeg',
        name: 'offer_upload.jpg',
      });
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();
      if (responseData.secure_url) {
        updateData.imageUrl = responseData.secure_url;
      }
    }

    await firestore()
      .collection(COLLECTIONS.SERVICES)
      .doc(uid)
      .update(updateData);
    return true;
  } catch (error) {
    console.error('Error updating user data:', error);
    return false;
  }
};

export const deleteExpert = async (expertId, shopId) => {
  try {
    const expertRef = firestore()
      .collection(COLLECTIONS.BEAUTY_EXPERTS)
      .doc(expertId);
    const expertSnap = await expertRef.get();

    if (!expertSnap.exists) {
      throw new Error('Expert not found');
    }

    const expertData = expertSnap.data();

    if (expertData.shopId !== shopId) {
      throw new Error('Expert does not belong to this shop');
    }

    await expertRef.delete();

    return { success: true, message: 'Expert deleted successfully' };
  } catch (error) {
    console.error('Error deleting expert:', error);
    throw error;
  }
};

export const updateBeautyExpert = async (uid, updateData) => {
  try {
    if (!updateData.imageUri.startsWith('https://')) {
      const formData = new FormData();
      formData.append('file', {
        uri: updateData.imageUri,
        type: 'image/jpeg',
        name: 'offer_upload.jpg',
      });
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();
      if (responseData.secure_url) {
        updateData.imageUrl = responseData.secure_url;
      }
    }

    await firestore()
      .collection(COLLECTIONS.BEAUTY_EXPERTS)
      .doc(uid)
      .update(updateData);
    return true;
  } catch (error) {
    console.error('Error updating beauty expert:', error);
    return false;
  }
};

export const deleteOffer = async (offerId, shopId) => {
  try {
    const offerRef = firestore().collection(COLLECTIONS.OFFERS).doc(offerId);
    const offerSnap = await offerRef.get();

    if (!offerSnap.exists) {
      throw new Error('Offer not found');
    }

    const offerData = offerSnap.data();

    if (offerData.shopId !== shopId) {
      throw new Error('Offer does not belong to this shop');
    }

    await offerRef.delete();

    return { success: true, message: 'Offer deleted successfully' };
  } catch (error) {
    console.error('Error deleting offer:', error);
    throw error;
  }
};

export const updateServiceOffer = async (uid, updateData) => {
  try {
    await firestore()
      .collection(COLLECTIONS.OFFERS)
      .doc(uid)
      .update(updateData);
    return true;
  } catch (error) {
    console.error('Error updating offer:', error);
    return false;
  }
};

export const getNotificationsCountByShopId = async shopId => {
  try {
    const querySnapshot = await firestore()
      .collection(COLLECTIONS.NOTIFICATIONS)
      .where('toId', '==', shopId)
      .where('isRead', '==', false)
      .get();

    return querySnapshot?.size ?? 0;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return 0;
  }
};

export const getPendingRequestsCount = async shopId => {
  try {
    const querySnapshot = await firestore()
      .collection(COLLECTIONS.APPOINTMENTS)
      .where('shopId', '==', shopId)
      .where('appointmentStatus', '==', APPOINTMENT_STATUSES.PENDING)
      .get();

    return querySnapshot?.size ?? 0;
  } catch (error) {
    return error;
  }
};

export const getNotificationDetails = async notificationId => {
  try {
    const notificationDoc = await firestore()
      .collection(COLLECTIONS.NOTIFICATIONS)
      .doc(notificationId)
      .get();

    if (!notificationDoc.exists) return null;

    const notificationData = {
      id: notificationDoc.id,
      ...notificationDoc.data(),
    };
    const appointmentId = notificationData.appointmentId;
    const fromId = notificationData.fromId;

    const appointmentDoc = await firestore()
      .collection(COLLECTIONS.APPOINTMENTS)
      .doc(appointmentId)
      .get();

    const customerDoc = await firestore()
      .collection(COLLECTIONS.CUSTOMERS)
      .doc(fromId)
      .get();

    const appointmentDetails = appointmentDoc.exists
      ? { id: appointmentDoc.id, ...appointmentDoc.data() }
      : null;
    const customerDetails = customerDoc.exists
      ? { id: customerDoc.id, ...customerDoc.data() }
      : null;

    let serviceDetails = [];
    if (
      appointmentDetails &&
      appointmentDetails.serviceIds &&
      appointmentDetails.serviceIds.length > 0
    ) {
      const servicePromises = appointmentDetails.serviceIds.map(serviceId =>
        firestore().collection(COLLECTIONS.SERVICES).doc(serviceId).get(),
      );
      const serviceSnapshots = await Promise.all(servicePromises);
      serviceDetails = serviceSnapshots
        .map(doc => (doc.exists ? { id: doc.id, ...doc.data() } : null))
        .filter(Boolean);
    }

    return {
      ...notificationData,
      appointment: {
        ...appointmentDetails,
        services: serviceDetails,
      },
      customer: customerDetails,
    };
  } catch (error) {
    console.error('Error fetching notification details:', error);
    return null;
  }
};

export const subscribeToUserPendingRequests = (shopId, onUpdate, onError) => {
  const unsubscribe = firestore()
    .collection(COLLECTIONS.APPOINTMENTS)
    .where('shopId', '==', shopId)
    .where('appointmentStatus', '==', APPOINTMENT_STATUSES.PENDING)
    .onSnapshot(
      async querySnapshot => {
        try {
          const offersSnapshot = await firestore()
            .collection(COLLECTIONS.OFFERS)
            .where('shopId', '==', shopId)
            .get();

          const shopOffers = offersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

          const results = await Promise.all(
            querySnapshot.docs.map(async appointmentDoc => {
              const appointmentData = appointmentDoc.data();
              const { expertId, serviceIds = [], customerId } = appointmentData;

              let expertData = null;
              if (expertId) {
                const expertSnap = await firestore()
                  .collection(COLLECTIONS.BEAUTY_EXPERTS)
                  .doc(expertId)
                  .get();
                if (expertSnap.exists)
                  expertData = { id: expertSnap.id, ...expertSnap.data() };
              }

              const services = await Promise.all(
                serviceIds.map(async serviceId => {
                  const serviceSnap = await firestore()
                    .collection(COLLECTIONS.SERVICES)
                    .doc(serviceId)
                    .get();
                  return serviceSnap.exists
                    ? { id: serviceSnap.id, ...serviceSnap.data() }
                    : null;
                }),
              );

              const validServices = services.filter(s => s !== null);

              let customerData = null;
              if (customerId) {
                const customerSnap = await firestore()
                  .collection(COLLECTIONS.CUSTOMERS)
                  .doc(customerId.trim())
                  .get();
                if (customerSnap.exists)
                  customerData = {
                    id: customerSnap.id,
                    ...customerSnap.data(),
                  };
              }

              let offerAvailable = false;
              let offerPrice = null;

              if (serviceIds.length > 0 && shopOffers.length > 0) {
                const applicableOffers = shopOffers.filter(offer =>
                  serviceIds.includes(offer.serviceId),
                );
                if (applicableOffers.length > 0) {
                  offerAvailable = true;
                  offerPrice =
                    applicableOffers[0].price || applicableOffers[0].offerPrice;
                }
              }

              return {
                id: appointmentDoc.id,
                ...appointmentData,
                expert: expertData,
                customer: customerData,
                services: validServices,
                offerAvailable,
                ...(offerAvailable && { offerPrice }),
              };
            }),
          );
          onUpdate(results);
        } catch (error) {
          onError(error);
        }
      },
      error => {
        onError(error);
      },
    );
  return unsubscribe;
};
