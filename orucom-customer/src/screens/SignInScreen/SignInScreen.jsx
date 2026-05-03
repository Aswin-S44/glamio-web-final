import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { primaryColor, primaryDark, primaryPale, textMuted, dark } from '../../constants/colors';
import { login } from '../../apis/auth';
import { AuthContext } from '../../context/AuthContext';
import { LOGO } from '../../constants/images';

const SignInScreen = ({ navigation }) => {
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loginError, setLoginError] = useState('');

  const { refreshUser } = useContext(AuthContext);

  const isFormValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && password.length >= 6;

  useEffect(() => {
    const errs = {};
    if (submitted) {
      if (!email) errs.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        errs.email = 'Invalid email format';
      if (!password) errs.password = 'Password is required';
      else if (password.length < 6)
        errs.password = 'Password must be at least 6 characters';
    }
    setErrors(errs);
  }, [email, password, submitted]);

  const handleSignIn = async () => {
    setSubmitted(true);
    setLoginError('');
    if (!isFormValid) return;

    setIsLoading(true);
    try {
      await login(email, password);
      await refreshUser();
    } catch (err) {
      setLoginError(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor={primaryColor} barStyle="light-content" />

      <LinearGradient
        colors={[primaryDark, primaryColor]}
        style={styles.topSection}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={styles.brandRow}>
          <View style={styles.logoCircle}>
            <Ionicons name="sparkles" size={28} color={primaryColor} />
          </View>
          <Text style={styles.brandName}>Glamio</Text>
        </View>

        <Text style={styles.heroTitle}>Welcome{'\n'}Back</Text>
        <Text style={styles.heroSub}>Sign in to book your next look</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex1}
      >
        <ScrollView
          style={styles.card}
          contentContainerStyle={styles.cardContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {loginError ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={18} color="#D41172" />
              <Text style={styles.errorBannerText}>{loginError}</Text>
            </View>
          ) : null}

          <Text style={styles.sectionLabel}>Email address</Text>
          <View style={[styles.inputWrap, submitted && errors.email && styles.inputWrapError]}>
            <Ionicons name="mail-outline" size={20} color={textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="you@email.com"
              placeholderTextColor={textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          {submitted && errors.email ? (
            <Text style={styles.fieldError}>{errors.email}</Text>
          ) : null}

          <Text style={[styles.sectionLabel, { marginTop: 18 }]}>Password</Text>
          <View style={[styles.inputWrap, submitted && errors.password && styles.inputWrapError]}>
            <Ionicons name="lock-closed-outline" size={20} color={textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Min. 6 characters"
              placeholderTextColor={textMuted}
              secureTextEntry={secureTextEntry}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)}>
              <Ionicons
                name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={textMuted}
              />
            </TouchableOpacity>
          </View>
          {submitted && errors.password ? (
            <Text style={styles.fieldError}>{errors.password}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.btn, (!isFormValid || isLoading) && styles.btnDisabled]}
            onPress={handleSignIn}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.btnText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.signUpRow}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  flex1: { flex: 1 },
  topSection: {
    paddingTop: Platform.OS === 'ios' ? 60 : 45,
    paddingBottom: 36,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  brandName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 42,
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.82)',
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: -2,
  },
  cardContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F7',
    borderWidth: 1,
    borderColor: '#FFB3D9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 20,
    gap: 8,
  },
  errorBannerText: { color: primaryColor, fontSize: 13, flex: 1 },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: dark,
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: '#FAFAFA',
    height: 54,
  },
  inputWrapError: { borderColor: primaryColor },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: dark, height: 54 },
  fieldError: { color: primaryColor, fontSize: 12, marginTop: 4 },
  btn: {
    backgroundColor: primaryColor,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: primaryColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  btnDisabled: { backgroundColor: '#ccc', shadowOpacity: 0 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  signUpText: { fontSize: 14, color: textMuted },
  signUpLink: { fontSize: 14, color: primaryColor, fontWeight: '700' },
});

export default SignInScreen;
