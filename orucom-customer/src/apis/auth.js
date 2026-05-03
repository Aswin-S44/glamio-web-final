import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';
import { USER_TYPES } from '../constants/variables';

export const signup = async (email, password, username) => {
  const { data } = await api.post('/auth/register', {
    email,
    password,
    username: username || email.split('@')[0],
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

export const getMe = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

export const resentOTP = async email => {
  await api.post('/auth/send-otp', {
    email,
    userType: USER_TYPES.CUSTOMER,
  });
};

export const googleSignIn = async idToken => {
  const { data } = await api.post('/auth/signin/google', { idToken });
  const { token, user } = data.data;
  await AsyncStorage.setItem('auth_token', token);
  await AsyncStorage.setItem('user_data', JSON.stringify(user));
  return user;
};
