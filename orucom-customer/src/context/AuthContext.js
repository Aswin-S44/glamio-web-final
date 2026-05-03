import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        setUserData(null);
        return;
      }
      const { data } = await api.get('/auth/me');
      setUserData(data);
    } catch {
      await AsyncStorage.multiRemove(['auth_token', 'user_data']);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const logout = async () => {
    await AsyncStorage.multiRemove(['auth_token', 'user_data']);
    setUserData(null);
  };

  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUserData(data);
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        user: userData,
        userData,
        logout,
        loading,
        setLoading,
        isEmailVerified: userData?.emailVerified ?? false,
        refreshUser,
        userId: userData?.id ?? null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const verifyOtp = async (email, otp) => {
  try {
    const { data } = await api.post('/auth/verify-otp', { email, otp });
    return data;
  } catch (err) {
    return { success: false, message: err.message };
  }
};
