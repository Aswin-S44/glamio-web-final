import React, { createContext, useState, useEffect, useContext } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { COLLECTIONS } from '../constants/collections';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    let unsubscribeFirestore = () => {};

    const unsubscribeAuth = auth().onAuthStateChanged(async firebaseUser => {
      if (firebaseUser) {
        try {
          await firebaseUser.reload();
          setUser(firebaseUser);
          setIsEmailVerified(firebaseUser.emailVerified);

          const docRef = firestore()
            .collection(COLLECTIONS.SHOP_OWNERS)
            .doc(firebaseUser.uid);

          unsubscribeFirestore = docRef.onSnapshot(
            docSnap => {
              if (docSnap.exists) {
                setUserData(docSnap.data());
              } else {
                setUserData(null);
              }
              setLoading(false);
            },
            error => {
              setUserData(null);
              setLoading(false);
            },
          );
        } catch (error) {
          await auth().signOut();
          setUser(null);
          setUserData(null);
          setIsEmailVerified(false);
          setLoading(false);
        }
      } else {
        setUser(null);
        setUserData(null);
        setIsEmailVerified(false);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeFirestore();
    };
  }, []);

  const logout = async () => {
    try {
      await auth().signOut();
      setUser(null);
      setUserData(null);
      setIsEmailVerified(false);
    } catch (e) {
      console.error(e);
    }
  };

  const refreshUserData = async () => {
    if (user) {
      try {
        const docSnap = await firestore()
          .collection(COLLECTIONS.SHOP_OWNERS)
          .doc(user.uid)
          .get();
        if (docSnap.exists) {
          setUserData(docSnap.data());
        }
      } catch (error) {
        console.error(error);
      }
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
        setUserData,
        refreshUserData,
        isEmailVerified,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
