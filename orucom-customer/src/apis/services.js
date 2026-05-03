import firestore, {
  doc,
  getDoc,
  getFirestore,
  updateDoc,
} from '@react-native-firebase/firestore';
import axios from 'axios';
import { BACKEND_URL, NOTIFICATION_TYPES } from '../constants/variables';

import { GOOGLE_MAPS_API_KEY, CLOUDINARY_DOC } from '@env';
import { DEFAULT_AVATAR } from '../constants/images';

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_DOC}/image/upload`;
const CLOUDINARY_UPLOAD_PRESET = 'cloudinary_react';

export const getAllNearbyParlors = async onUpdate => {
  return firestore()
    .collection('shop-owners')
    .where('isOnboarded', '==', true)
    .where('profileCompleted', '==', true)
    .onSnapshot(snapshot => {
      const parlors = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      onUpdate(parlors);
    });
};

export const getAllParlours = async () => {
  const shopSnapshot = await firestore()
    .collection('shop-owners')
    .where('isOnboarded', '==', true)
    .where('profileCompleted', '==', true)
    .get();

  const shops = shopSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  const shopIds = shops.map(shop => shop.uid);

  const [servicesSnapshot, offersSnapshot, expertsSnapshot] = await Promise.all(
    [
      firestore().collection('services').where('shopId', 'in', shopIds).get(),
      firestore().collection('offers').where('shopId', 'in', shopIds).get(),
      firestore()
        .collection('beauty_experts')
        .where('shopId', 'in', shopIds)
        .get(),
    ],
  );

  const services = servicesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
  const offers = offersSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
  const experts = expertsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  return shops.map(shop => ({
    ...shop,
    services: services.filter(s => s.shopId === shop.uid),
    offers: offers.filter(o => o.shopId === shop.uid),
    experts: experts.filter(e => e.shopId === shop.uid),
  }));
};

export const getParlourById = async id => {
  try {
    const docSnap = await firestore().collection('shop-owners').doc(id).get();

    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('No such parlour exists');
    }
  } catch (error) {
    throw error;
  }
};

export const getServicesByShop = async shopId => {
  const querySnapshot = await firestore()
    .collection('services')
    .where('shopId', '==', shopId)
    .get();

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const getServiceById = async (shopId, serviceId) => {
  const docSnap = await firestore().collection('services').doc(serviceId).get();

  if (docSnap.exists && docSnap.data().shopId === shopId) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

export const createAppointment = async (userId, appointmentData) => {
  try {
    const docRef = await firestore()
      .collection('appointments')
      .add({
        ...appointmentData,
        userId,
        // createdAt: firestore.FieldValue.serverTimestamp(),
        createdAt: new Date(),
      });

    return {
      success: true,
      id: docRef.id,
      message: 'Appointment created successfully',
    };
  } catch (error) {
    // Error creating appointment
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getOffersByShop = async shopId => {
  const querySnapshot = await firestore()
    .collection('offers')
    .where('shopId', '==', shopId)
    .get();

  const offers = await Promise.all(
    querySnapshot.docs.map(async offerDoc => {
      const offerData = offerDoc.data();
      const serviceSnap = await firestore()
        .collection('services')
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
};

export const getExpertsByShopId = async shopId => {
  const querySnapshot = await firestore()
    .collection('beauty_experts')
    .where('shopId', '==', shopId)
    .get();

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const getAppointmentsByCustomerId = async customerId => {
  try {
    const appointmentsQuerySnapshot = await firestore()
      .collection('appointments')
      .where('customerId', '==', customerId)
      .get();

    if (appointmentsQuerySnapshot.empty) return [];

    const expertIds = [
      ...new Set(
        appointmentsQuerySnapshot.docs
          .map(doc => doc.data().expertId)
          .filter(id => id && id.trim() !== ''),
      ),
    ];

    let expertsMap = {};
    if (expertIds.length > 0) {
      const expertsQuerySnapshot = await firestore()
        .collection('beauty_experts')
        .where(firestore.FieldPath.documentId(), 'in', expertIds)
        .get();

      expertsMap = Object.fromEntries(
        expertsQuerySnapshot.docs.map(doc => [
          doc.id,
          { id: doc.id, ...doc.data() },
        ]),
      );
    }

    return appointmentsQuerySnapshot.docs.map(appointmentDoc => {
      const data = appointmentDoc.data();
      return {
        id: appointmentDoc.id,
        ...data,
        expert: expertsMap[data.expertId] || null,
      };
    });
  } catch (error) {
    // Error fetching appointments with expert data
    throw error;
  }
};

export const searchShopsByService = async searchTerm => {
  try {
    const servicesSnapshot = await firestore().collection('services').get();
    const allServices = servicesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const filteredServices = allServices.filter(
      service =>
        service.serviceName &&
        service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const shopIds = [
      ...new Set(filteredServices.map(service => service.shopId)),
    ];

    if (shopIds.length === 0) return [];

    const shopsPromises = shopIds.map(async shopId => {
      const shopOwner = await getShopOwnerByShopId(shopId);
      if (shopOwner) {
        const services = await getServicesByShopId(shopId);
        return {
          id: shopId,
          ...shopOwner,
          services,
        };
      }
      return null;
    });

    const shops = await Promise.all(shopsPromises);
    return shops.filter(shop => shop !== null);
  } catch (error) {
    // Search shops by service error
    throw error;
  }
};

export const searchShops = async searchTerm => {
  try {
    const shopsSnapshot = await firestore()
      .collection('shop-owners')
      .where('profileCompleted', '==', true)
      .get();
    const allShops = shopsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (!searchTerm) {
      return allShops;
    }

    const filteredShops = allShops.filter(
      shop =>
        shop.parlourName &&
        shop.parlourName.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    return filteredShops;
  } catch (error) {
    // Search shops error
    throw error;
  }
};

const getShopOwnerByShopId = async shopId => {
  try {
    const shopsSnapshot = await firestore()
      .collection('shop-owners')
      .where('profileCompleted', '==', true)
      .get();
    const allShops = shopsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return allShops.find(shop => shop.uid === shopId || shop.id === shopId);
  } catch (error) {
    // Get shop owner error
    return null;
  }
};

const getServicesByShopId = async shopId => {
  try {
    const servicesSnapshot = await firestore().collection('services').get();
    const allServices = servicesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return allServices.filter(service => service.shopId === shopId);
  } catch (error) {
    // Get services error:
    return [];
  }
};

export const getCustomerById = async id => {
  try {
    const docSnap = await firestore().collection('customers').doc(id).get();

    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  }
};

export const updateUserData = async (uid, updateData) => {
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

    await firestore().collection('customers').doc(uid).update(updateData);
    return true;
  } catch (error) {
    // Error updating user data
    return false;
  }
};

export const getGalleryImagesByShopId = async shopId => {
  const querySnapshot = await firestore()
    .collection('services')
    .where('shopId', '==', shopId)
    .get();
  const images = [];
  querySnapshot.docs.map((doc, index) => {
    const data = doc.data();
    if (data.imageUrl) {
      images.push({
        id: doc.id,
        image: data.imageUrl,
      });
    }
  });
  return images;
};

export const getExpertsWithShopDetailsByShopId = async expertId => {
  try {
    const expertDoc = await firestore()
      .collection('beauty_experts')
      .doc(expertId)
      .get();

    if (expertDoc.exists) {
      const expertData = expertDoc.data();
      const shopId = expertData?.shopId;

      if (shopId) {
        const shopOwnerDoc = await firestore()
          .collection('shop-owners')
          .doc(shopId)
          .get();

        if (shopOwnerDoc.exists) {
          return {
            expert: expertData,
            shopDetails: shopOwnerDoc.data(),
          };
        } else {
          // Shop owner not found for shopId
          return { expert: expertData, shopDetails: null };
        }
      } else {
        // Expert data does not contain a shopId
        return { expert: expertData, shopDetails: null };
      }
    } else {
      // 'No expert found with expertId
      return null;
    }
  } catch (error) {
    // Error fetching expert data
    throw error;
  }
};

export const getNotificationsByCustomerId = userId => {
  return new Promise(resolve => {
    const unsubscribe = firestore()
      .collection('notifications')
      .where('toId', '==', userId)
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        querySnapshot => {
          if (querySnapshot.empty) {
            resolve([]);
            return;
          }

          const notifications = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              shop: {
                parlourName: data.fromShopName || '',
                profileImage: data.fromShopProfileImage || DEFAULT_AVATAR,
              },
            };
          });

          resolve(notifications);
        },
        () => resolve([]),
      );

    return unsubscribe;
  });
};
export const markNotificationAsRead = async id => {
  try {
    const notificationRef = firestore().collection('notifications').doc(id);
    const docSnapshot = await notificationRef.get();

    if (!docSnapshot.exists) {
      return { success: false, message: 'Notification not found' };
    }

    await notificationRef.update({
      isRead: true,
    });

    return { success: true };
  } catch (error) {
    // Error updating notification
    return { success: false, error };
  }
};

export const deleteNotificationById = async id => {
  try {
    const notificationRef = firestore().collection('notifications').doc(id);
    await notificationRef.delete();
    return { success: true };
  } catch (error) {
    // 'Error deleting notification:
    return { success: false, error };
  }
};

export const getNotificationsCountByCustomerId = async customerId => {
  try {
    const querySnapshot = await firestore()
      .collection('notifications')
      .where('toId', '==', customerId)
      .where('isRead', '==', false)
      .get();

    return querySnapshot?.size ?? 0;
  } catch (error) {
    // Error fetching notifications
    return 0;
  }
};

export const updateCustomer = async (uid, dataToUpdate) => {
  try {
    const db = getFirestore();
    const customerRef = doc(db, 'customers', uid);
    const docSnapshot = await getDoc(customerRef);

    if (!docSnapshot.exists()) {
      return { success: false, message: 'Customer not found' };
    }

    await updateDoc(customerRef, dataToUpdate);

    return { success: true };
  } catch (error) {
    // Error updating customer
    return { success: false, error };
  }
};

export const getReviews = async (placeId, page = 0) => {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews&key=${GOOGLE_MAPS_API_KEY}`;
  try {
    const res = await axios.get(url);
    if (res?.data?.result) {
      return res.data.result;
    } else {
      return { rating: 0, reviews: [] };
    }
  } catch (error) {
    return { rating: 0, reviews: [] };
  }
};

export const getOfferByServiceAndShop = async (serviceId, shopId) => {
  try {
    const querySnapshot = await firestore()
      .collection('offers')
      .where('serviceId', '==', serviceId)
      .where('shopId', '==', shopId)
      .get();

    if (!querySnapshot.empty) {
      const offerDoc = querySnapshot.docs[0];
      return { id: offerDoc.id, ...offerDoc.data() };
    }
    return null;
  } catch (error) {
    // Error fetching offer
    return null;
  }
};

export const getGalleryImages = async (placeId, page = 0) => {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const photos = data.result.photos || [];

    const photoUrls = photos.map(
      p =>
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${p.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`,
    );

    let galleryImages = [];

    if (photoUrls && photoUrls.length > 0) {
      galleryImages = photoUrls;
    }

    return galleryImages;
  } catch (error) {
    return { rating: 0, reviews: [] };
  }
};

export const getShopStatus = async placeId => {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=opening_hours&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const isOpen = data?.result?.opening_hours?.open_now;

    if (isOpen === true) return 'Open';
    if (isOpen === false) return 'Closed';

    // If Google does not provide status
    return 'Unavailable';
  } catch (error) {
    return 'Unknown';
  }
};

export const updateSlotInFirestore = (slotId, slotData) => {
  firestore()
    .collection('slots')
    .doc(slotId)
    .update({
      ...slotData,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  return { success: true };
};

export const createNotification = async (
  fromId,
  toId,
  appointmentId,
  customerName,
  profileImage,
) => {
  await firestore()
    .collection('notifications')
    .add({
      fromId,
      toId,
      notificationType: NOTIFICATION_TYPES.APPOINTMENT_REQUEST,
      createdAt: firestore.FieldValue.serverTimestamp(),
      isRead: false,
      message: `${customerName} sent an appointment request`,
      appointmentId,
      profileImage,
    });
  return { success: true };
};

export const sendAppointmentNotification = async (
  customerId,
  shopId,
  appointmentType,
  appointmentId = null,
) => {
  await axios
    .post(`${BACKEND_URL}/api/v1/user/appointment`, {
      customerId,
      shopId,
      appointmentType,
      appointmentId,
    })
    .catch(error => {
      // Error sending notification
    });
};
export const updateShopViewers = async shopId => {
  try {
    const shopRef = firestore().collection('shopViewers').doc(shopId);
    const shopSnap = await shopRef.get();

    if (!shopSnap.exists) {
      // Create new shop document
      await shopRef.set({
        shopId,
        totalViewers: 1,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    } else {
      // Increment safely with merge fallback
      await shopRef.set(
        {
          totalViewers: firestore.FieldValue.increment(1),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }, // 👈 ensures creation if not present
      );
    }
  } catch (error) {
    //  Error updating shop viewers:
  }
};

export const getDocumentFieldById = async (collectionName, id, field) => {
  try {
    const docSnap = await firestore().collection(collectionName).doc(id).get();
    if (!docSnap.exists) throw new Error('Document not found');
    const data = docSnap.data();
    return { id: docSnap.id, [field]: data[field] };
  } catch (err) {
    throw err;
  }
};
