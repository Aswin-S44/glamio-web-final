import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { primaryColor, primaryDark, dark, textMuted } from '../../constants/colors';
import { GOOGLE_ICON } from '../../constants/images';
import api from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../context/AuthContext';

const WelcomeScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { refreshUserData } = useContext(AuthContext);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '273666754104-8kqhpnril7nlsnvgf7mmddsc1mbf9r91.apps.googleusercontent.com',
      offlineAccess: false,
    });
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const result = await GoogleSignin.signIn();
      const idToken = result.data?.idToken || result.idToken;
      if (!idToken) throw new Error('No ID token from Google');

      const { data } = await api.post('/auth/signin/google', { idToken, userType: 'shop' });
      await AsyncStorage.setItem('auth_token', data.data.token);
      await refreshUserData();
    } catch (err) {
      if (err.code !== 'SIGN_IN_CANCELLED') {
        Alert.alert('Error', err.message || 'Failed to sign in with Google');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[primaryDark, primaryColor]}
      style={styles.root}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar backgroundColor={primaryDark} barStyle="light-content" />

      <View style={styles.content}>
        <View style={styles.logoCircle}>
          <Ionicons name="sparkles" size={44} color={primaryColor} />
        </View>
        <Text style={styles.appName}>Glamio</Text>
        <Text style={styles.tagline}>Business Portal</Text>
        <Text style={styles.subtitle}>Manage your salon, grow your business</Text>

        <TouchableOpacity
          style={[styles.googleBtn, isLoading && { opacity: 0.7 }]}
          onPress={handleGoogleSignIn}
          disabled={isLoading}
          activeOpacity={0.9}
        >
          {isLoading ? (
            <ActivityIndicator color={primaryColor} size="small" />
          ) : (
            <>
              <Image source={{ uri: GOOGLE_ICON }} style={styles.googleIcon} />
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.emailBtn}
          onPress={() => navigation?.navigate('SignIn')}
          activeOpacity={0.85}
        >
          <Ionicons name="mail-outline" size={20} color="#fff" />
          <Text style={styles.emailBtnText}>Sign in with Email</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation?.navigate('SignUp')}>
          <Text style={styles.signupLink}>
            New here?{' '}
            <Text style={{ fontWeight: '700', textDecorationLine: 'underline' }}>
              Create Account
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingBottom: 30,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  appName: { fontSize: 36, fontWeight: '800', color: '#fff', marginBottom: 4 },
  tagline: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 52 },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  googleIcon: { width: 22, height: 22 },
  googleBtnText: { fontSize: 16, fontWeight: '700', color: '#333' },
  emailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 24,
    gap: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  emailBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  signupLink: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
});

export default WelcomeScreen;
