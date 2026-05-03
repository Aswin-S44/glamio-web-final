import React, { createContext, useState, useEffect, useContext } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [userId, setUserId] = useState(null);

  const getUserId = async () => {
    try {
      const customerId = await AsyncStorage.getItem('user_uid');
      if (customerId !== null) {
        return customerId;
      } else {
        return null;
      }
    } catch (error) {
      // Error getting user UID from AsyncStorage
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async firebaseUser => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsEmailVerified(firebaseUser.emailVerified);

        const customerId = await getUserId(); // Get ID from AsyncStorage
        setUserId(customerId); // Set userId state with the AsyncStorage ID

        if (customerId) {
          // Only attempt to fetch if customerId is available
          try {
            const docSnap = await firestore()
              .collection('customers')
              .doc(customerId) // Use customerId from AsyncStorage for Firestore
              .get();

            if (docSnap.exists) {
              setUserData(docSnap.data());
            } else {
              setUserData(null);
            }
          } catch (error) {
            // Error fetching user data in onAuthStateChanged
            setUserData(null);
          }
        } else {
          setUserData(null); // No customerId in AsyncStorage, so no userData
        }
      } else {
        setUser(null);
        setUserData(null);
        setIsEmailVerified(false);
        setUserId(null);
        await AsyncStorage.removeItem('user_uid'); // Clear UID on logout
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const logout = async () => {
    await auth().signOut();
    setUser(null);
    setUserData(null);
    setIsEmailVerified(false);
    setUserId(null);
    await AsyncStorage.removeItem('user_uid'); // Clear UID on logout
  };

  const refreshUser = async () => {
    const firebaseUser = auth().currentUser;
    if (firebaseUser) {
      await firebaseUser.reload();
      setUser(auth().currentUser); // Update user state with reloaded user
      setIsEmailVerified(auth().currentUser.emailVerified);

      const customerId = await getUserId(); // Get ID from AsyncStorage
      setUserId(customerId); // Set userId state with the AsyncStorage ID

      if (customerId) {
        // Only attempt to fetch if customerId is available
        try {
          const docSnap = await firestore()
            .collection('customers')
            .doc(customerId) // Use customerId from AsyncStorage for Firestore
            .get();
          if (docSnap.exists) {
            setUserData(docSnap.data());
          } else {
            setUserData(null); // Clear userData if document no longer exists
          }
        } catch (error) {
          // Error fetching user data in refreshUser
          setUserData(null);
        }
      } else {
        setUserData(null); // No customerId in AsyncStorage, so no userData
      }
    } else {
      // If no user after reload, clear relevant states
      setUser(null);
      setUserData(null);
      setIsEmailVerified(false);
      setUserId(null);
      await AsyncStorage.removeItem('user_uid');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        logout,
        loading,
        setLoading,
        isEmailVerified,
        refreshUser,
        userId,
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
    const snapshot = await firestore()
      .collection('customers')
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
