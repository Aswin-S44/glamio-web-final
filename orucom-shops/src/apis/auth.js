import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { NO_IMAGE } from '../constants/images';
import axios from 'axios';
import { BACKEND_URL, USER_TYPES } from '../constants/variables';
import { COLLECTIONS } from '../constants/collections';

export const resentOTP = async email => {
  try {
    await axios.post(`${BACKEND_URL}/send-otp`, {
      email,
      userType: USER_TYPES.BEAUTY_SHOP,
    });
  } catch (error) {
    return error;
  }
};

export const signup = async (email, password) => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(
      email,
      password,
    );

    const user = userCredential.user;
    await firestore().collection(COLLECTIONS.SHOP_OWNERS).doc(user.uid).set({
      uid: user.uid,
      fullName: '',
      phone: '',
      email,
      createdAt: new Date(),
      parlourName: '',
      about: '',
      address: '',
      isOnboarded: false,
      profileImage: NO_IMAGE,
      isOTPVerified: false,
      accountInitiated: true,
      profileCompleted: false,
      emailVerified: false,
      openingHours: [],
      otp: '123456',
    });

    return userCredential.user;
  } catch (error) {
    throw error;
  }
};
export const login = async (email, password) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(
      email,
      password,
    );

    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await auth().signOut();
  } catch (error) {
    throw error;
  }
};

export const verifyOtp = async (email, otp) => {
  try {
    const snapshot = await firestore()
      .collection(COLLECTIONS.SHOP_OWNERS)
      .where('email', '==', email)
      .get();

    if (snapshot.empty) {
      return { success: false, message: 'No user found with this email' };
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    if (userData.otp && userData.otp === otp) {
      return {
        success: true,
        message: 'OTP verified successfully',
        userData: userData,
      };
    }

    return { success: false, message: 'Invalid OTP' };
  } catch (error) {
    return {
      success: false,
      message: 'Error verifying OTP',
      error: error.message,
    };
  }
};

export const updateShop = async (uid, dataToUpdate) => {
  try {
    await firestore()
      .collection(COLLECTIONS.SHOP_OWNERS)
      .doc(uid)
      .update(dataToUpdate);

    return {
      success: true,
      message: 'Shop updated successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error updating shop',
      error: error.message,
    };
  }
};

export const resetPassword = async (email, newPassword) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(
      email,
      newPassword,
    );
    const user = userCredential.user;

    await user.updatePassword(newPassword);

    return { success: true, message: 'Password updated successfully' };
  } catch (error) {
    console.error('RESET PASSWORD ERROR:', error);
    return { success: false, message: error.message };
  }
};
