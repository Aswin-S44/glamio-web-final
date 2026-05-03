import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';
import { USER_TYPES } from '../constants/variables';

export const signup = async (email, password, username) => {
  const { data } = await api.post('/auth/register', {
    email,
    password,
    username: username || email.split('@')[0],
    userType: 'shop',
  });
  const { token, user } = data.data;
  await AsyncStorage.setItem('auth_token', token);
  await AsyncStorage.setItem('user_data', JSON.stringify(user));
  return user;
};

export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  const { token, user } = data.data;
  await AsyncStorage.setItem('auth_token', token);
  await AsyncStorage.setItem('user_data', JSON.stringify(user));
  return user;
};

export const logout = async () => {
  await AsyncStorage.multiRemove(['auth_token', 'user_data']);
};

export const verifyOtp = async (email, otp) => {
  try {
    const { data } = await api.post('/auth/verify-otp', { email, otp });
    return data;
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const resentOTP = async email => {
  try {
    await api.post('/auth/send-otp', {
      email,
      userType: USER_TYPES.BEAUTY_SHOP,
    });
  } catch {}
};

export const updateShop = async (_uid, dataToUpdate) => {
  try {
    await api.patch('/shops', dataToUpdate);
    return { success: true };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const resetPassword = async (email, newPassword) => {
  try {
    await api.post('/auth/reset-password', { email, newPassword });
    return { success: true };
  } catch (err) {
    return { success: false, message: err.message };
  }
};
