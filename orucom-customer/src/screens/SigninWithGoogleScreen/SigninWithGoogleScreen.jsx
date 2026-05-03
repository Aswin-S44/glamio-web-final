import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { primaryColor, primaryDark, textMuted } from '../../constants/colors';

const SigninWithGoogleScreen = ({ navigation }) => {
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
        <Text style={styles.brandName}>Glamio</Text>
        <Text style={styles.tagline}>Your beauty, perfected</Text>

        <TouchableOpacity
          style={styles.emailBtn}
          onPress={() => navigation.navigate('SignIn')}
          activeOpacity={0.85}
        >
          <Ionicons name="mail-outline" size={20} color="#fff" />
          <Text style={styles.emailBtnText}>Sign in with Email</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupBtn}
          onPress={() => navigation.navigate('SignUp')}
          activeOpacity={0.85}
        >
          <Ionicons name="person-add-outline" size={20} color={primaryColor} />
          <Text style={styles.signupBtnText}>Create Account</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          By continuing, you agree to our Terms & Privacy Policy
        </Text>
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
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  brandName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.78)',
    marginBottom: 52,
  },
  emailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 14,
    gap: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  emailBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  signupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 28,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  signupBtnText: { fontSize: 16, fontWeight: '700', color: primaryColor },
  footerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});

export default SigninWithGoogleScreen;
