import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_BASE = 'https://beauty-parlor-app-backend.onrender.com';
// const BACKEND_BASE = 'http://10.130.97.171:5000';

const api = axios.create({
  baseURL: `${BACKEND_BASE}/api/v1`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) config.headers.Authorization = token;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    const msg = err.response?.data?.message || err.message || 'Something went wrong';
    return Promise.reject(new Error(msg));
  },
);

export default api;
