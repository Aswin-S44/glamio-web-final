import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { DEFAULT_AVATAR } from '../constants/images';
import { USER_TYPES } from '../constants/variables';
import axios from 'axios';
import { generateRandomName } from '../utils/utils';

export const googleSignUp = async data => {
  await firestore().collection('customers').doc(user.uid).set({
    uid: user.uid,
    fullName: generateRandomName(),
    phone: '',
    email,
    createdAt: firestore.FieldValue.serverTimestamp(),
    profileImage: DEFAULT_AVATAR,
    fcmToken: null,
    emailVerified: false,
    otp: '123456',
  });
};

export const signup = async (email, password) => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(
      email,
      password,
    );
    const user = userCredential.user;
    await firestore().collection('customers').doc(user.uid).set({
      uid: user.uid,
      fullName: generateRandomName(),
      phone: '',
      email,
      createdAt: firestore.FieldValue.serverTimestamp(),
      profileImage: DEFAULT_AVATAR,
      fcmToken: null,
      emailVerified: false,
      otp: '123456',
    });

    return user;
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

export const resentOTP = async email => {
  const res = await axios.post(
    `https://beauty-parlor-app-backend.onrender.com/api/v1/user/send-otp`,
    {
      email,
      userType: USER_TYPES.CUSTOMER,
    },
  );
};
