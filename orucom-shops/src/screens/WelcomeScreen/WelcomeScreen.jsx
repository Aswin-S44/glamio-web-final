import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import firestore from '@react-native-firebase/firestore';
import auth, { GoogleAuthProvider } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { WEB_CLIENT_ID } from '@env';
import { primaryColor } from '../../constants/colors';
import { COLLECTIONS } from '../../constants/collections';
import { generateRandomName } from '../../utils/utils';
import { GOOGLE_ICON, NO_IMAGE } from '../../constants/images';

const WelcomeScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const lighterPrimaryColor = '#FBCDFF';
  console.log('WEB_CLIENT_ID-------------', WEB_CLIENT_ID);
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '273666754104-8kqhpnril7nlsnvgf7mmddsc1mbf9r91.apps.googleusercontent.com',
      offlineAccess: false,
    });
  }, []);

  async function onGoogleButtonPress() {
    setIsLoading(true);
    try {
      await GoogleSignin.signOut();
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const signInResult = await GoogleSignin.signIn();
      let idToken = signInResult.data?.idToken || signInResult.idToken;

      if (!idToken) {
        throw new Error('No ID token found');
      }

      const googleCredential = GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(
        googleCredential,
      );
      const firebaseUser = userCredential.user;

      const querySnapshot = await firestore()
        .collection(COLLECTIONS.SHOP_OWNERS)
        .where('email', '==', firebaseUser.email)
        .get();

      if (querySnapshot.empty) {
        const updateData = {
          uid: firebaseUser.uid,
          fullName: firebaseUser.displayName || generateRandomName(),
          phone: '',
          email: firebaseUser.email,
          createdAt: new Date(),
          parlourName: '',
          about: '',
          address: '',
          isOnboarded: false,
          profileImage: NO_IMAGE,
          isOTPVerified: false,
          accountInitiated: true,
          profileCompleted: false,
          emailVerified: true,
          openingHours: [],
        };
        await firestore()
          .collection(COLLECTIONS.SHOP_OWNERS)
          .doc(firebaseUser.uid)
          .set(updateData);
      }
    } catch (error) {
      console.log('GOOGLE SIGN-IN ERROR =====>', error);
      Alert.alert('Error', 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <LinearGradient
      colors={[primaryColor, lighterPrimaryColor]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar backgroundColor={primaryColor} barStyle="light-content" />

      <Image
        source={require('../../assets/images/splash_logo.png')}
        style={styles.welcomeImage}
      />
      <Text style={styles.title}>Beauty Expert App</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.signInButton}
          onPress={onGoogleButtonPress}
          disabled={isLoading}
        >
          <Image source={{ uri: GOOGLE_ICON }} style={styles.googleIcon} />
          <Text style={styles.signInButtonText}>Sign in with Google</Text>
        </TouchableOpacity>
      </View>

      <Modal
        transparent={true}
        animationType="fade"
        visible={isLoading}
        onRequestClose={() => {}}
      >
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={primaryColor} />
            <Text style={styles.loadingText}>Signing in...</Text>
          </View>
        </View>
      </Modal>
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
  signInButtonText: {
    color: primaryColor,
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
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
  },
  loadingText: {
    marginTop: 10,
    color: primaryColor,
    fontWeight: '500',
  },
});

export default WelcomeScreen;
