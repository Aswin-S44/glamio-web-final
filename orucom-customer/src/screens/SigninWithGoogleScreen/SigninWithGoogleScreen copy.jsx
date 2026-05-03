import React, { useContext, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Button,
  StyleSheet,
  StatusBar,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {
  GoogleSignin,
  statusCodes,
  GoogleSigninButton,
} from '@react-native-google-signin/google-signin';
// import { WEB_CLIENT_ID } from '@env';
import {
  GoogleAuthProvider,
  getAuth,
  signInWithCredential,
} from '@react-native-firebase/auth';
import { Alert } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { Image } from 'react-native';
import { GOOGLE_ICON } from '../../constants/images';
import { lightPurple, primaryColor } from '../../constants/colors';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SigninWithGoogleScreen = () => {
  const { user, refreshUser, userData } = useContext(AuthContext);
  let WEB_CLIENT_ID =
    '297588641134-hi002t6fubg9iilqa4r2bjp9sdnasg3i.apps.googleusercontent.com';
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      offlineAccess: false,
    });
  }, []);

  async function onGoogleButtonPress() {
    try {
      const test = await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Sign in
      const signInResult = await GoogleSignin.signIn();

      let idToken = signInResult.data?.idToken || signInResult.idToken;

      const user = signInResult.data?.user;

      if (!idToken) throw new Error('No ID token found');

      if (!idToken) {
        Alert.alert('Error', 'Error while signin');
        return;
      }

      const googleCredential = GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(
        googleCredential,
      );
      const firebaseUser = userCredential.user;

      const customerRef = firestore()
        .collection('customers')
        .doc(firebaseUser.uid);
      const docSnap = await customerRef.get();

      let updateData = {
        uid: firebaseUser.uid,
        fullName: firebaseUser.displayName || generateRandomName(),
        phone: '',
        email: firebaseUser.email,
        createdAt: firestore.FieldValue.serverTimestamp(),
        profileImage: firebaseUser.photoURL || DEFAULT_AVATAR,
        fcmToken: null,
        emailVerified: firebaseUser.emailVerified,
        otp: null, // OTP not applicable for Google Sign-In
      };

      if (!docSnap.exists) {
        let updateData = {
          uid: firebaseUser.uid,
          fullName: firebaseUser.displayName || generateRandomName(),
          phone: '',
          email: firebaseUser.email,
          createdAt: firestore.FieldValue.serverTimestamp(),
          profileImage: firebaseUser.photoURL || DEFAULT_AVATAR,
          fcmToken: null,
          emailVerified: firebaseUser.emailVerified,
          otp: null, // OTP not applicable for Google Sign-In
        };

        await customerRef.set(updateData);
      } else {
        await firestore()
          .collection('customers')
          .doc(firebaseUser.uid)
          .set(updateData);
      }
      let res = await signInWithCredential(getAuth(), googleCredential);
      refreshUser();
      await AsyncStorage.setItem('user_uid', firebaseUser?.uid);
      //return await signInWithCredential(getAuth(), googleCredential);
      return firebaseUser;
    } catch (error) {
      // Google signin error
    }
  }

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // In progress
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // Play servies not available
      } else {
        return error;
      }
    }
  };

  return (
    <LinearGradient
      colors={[primaryColor, lightPurple]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar backgroundColor={primaryColor} barStyle="light-content" />
      <Image
        source={require('../../assets/images/splash_logo.png')}
        style={styles.welcomeImage}
      />
      <Text style={styles.title}>Beauty Customer App</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => onGoogleButtonPress().then(() => {})}
        >
          <Image source={{ uri: GOOGLE_ICON }} style={styles.googleIcon} />
          <Text style={styles.signInButtonText}>Sign in with Google</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 60,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  signInButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  googleIcon: {
    marginRight: 10,
    // color: 'darkcyan',
  },
  signInButtonText: {
    color: primaryColor,
    fontSize: 16,
    fontWeight: 'bold',
  },
  signUpButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#fff',
    paddingVertical: 15,
    width: '90%',
    alignItems: 'center',
    borderRadius: 12,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  welcomeImage: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
});

export default SigninWithGoogleScreen;
