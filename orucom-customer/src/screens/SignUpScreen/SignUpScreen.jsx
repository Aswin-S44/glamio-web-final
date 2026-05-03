import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import {
  primaryColor,
  primaryDark,
  textMuted,
  dark,
} from '../../constants/colors';
import { signup } from '../../apis/auth';

const SignUpScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [signupError, setSignupError] = useState('');

  const isFormValid =
    name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    password.length >= 6 &&
    confirmPassword === password &&
    acceptedTerms;

  useEffect(() => {
    if (!submitted) return;
    const errs = {};
    if (!name.trim()) errs.name = 'Full name is required';
    if (!email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'At least 6 characters';
    if (confirmPassword !== password) errs.confirmPassword = 'Passwords do not match';
    if (!acceptedTerms) errs.terms = 'You must accept the terms';
    setErrors(errs);
  }, [name, email, password, confirmPassword, acceptedTerms, submitted]);

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!isFormValid) return;

    setIsLoading(true);
    setSignupError('');
    try {
      await signup(email, password, name.trim());
      navigation.navigate('OTPVerificationScreen', { userEmail: email });
    } catch (err) {
      setSignupError(err.message || 'Failed to create account. Please try again.');
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
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.brandRow}>
          <View style={styles.logoCircle}>
            <Ionicons name="sparkles" size={28} color={primaryColor} />
          </View>
          <Text style={styles.brandName}>Glamio</Text>
        </View>
        <Text style={styles.heroTitle}>Create{'\n'}Account</Text>
        <Text style={styles.heroSub}>Join thousands who trust Glamio</Text>
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
          {signupError ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={18} color={primaryColor} />
              <Text style={styles.errorBannerText}>{signupError}</Text>
            </View>
          ) : null}

          {/* Full Name */}
          <Text style={styles.label}>Full Name</Text>
          <View style={[styles.inputWrap, submitted && errors.name && styles.inputWrapError]}>
            <Ionicons name="person-outline" size={20} color={textMuted} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Your full name"
              placeholderTextColor={textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>
          {submitted && errors.name ? <Text style={styles.fieldError}>{errors.name}</Text> : null}

          {/* Email */}
          <Text style={[styles.label, { marginTop: 16 }]}>Email</Text>
          <View style={[styles.inputWrap, submitted && errors.email && styles.inputWrapError]}>
            <Ionicons name="mail-outline" size={20} color={textMuted} style={styles.icon} />
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
          {submitted && errors.email ? <Text style={styles.fieldError}>{errors.email}</Text> : null}

          {/* Password */}
          <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
          <View style={[styles.inputWrap, submitted && errors.password && styles.inputWrapError]}>
            <Ionicons name="lock-closed-outline" size={20} color={textMuted} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Min. 6 characters"
              placeholderTextColor={textMuted}
              secureTextEntry={securePassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setSecurePassword(!securePassword)}>
              <Ionicons
                name={securePassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={textMuted}
              />
            </TouchableOpacity>
          </View>
          {submitted && errors.password ? <Text style={styles.fieldError}>{errors.password}</Text> : null}

          {/* Confirm Password */}
          <Text style={[styles.label, { marginTop: 16 }]}>Confirm Password</Text>
          <View style={[styles.inputWrap, submitted && errors.confirmPassword && styles.inputWrapError]}>
            <Ionicons name="lock-closed-outline" size={20} color={textMuted} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Repeat password"
              placeholderTextColor={textMuted}
              secureTextEntry={secureConfirm}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setSecureConfirm(!secureConfirm)}>
              <Ionicons
                name={secureConfirm ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={textMuted}
              />
            </TouchableOpacity>
          </View>
          {submitted && errors.confirmPassword ? (
            <Text style={styles.fieldError}>{errors.confirmPassword}</Text>
          ) : null}

          {/* Terms */}
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setAcceptedTerms(!acceptedTerms)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
              {acceptedTerms && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
            <Text style={styles.termsText}>
              I accept the{' '}
              <Text style={styles.termsLink}>Terms & Privacy Policy</Text>
            </Text>
          </TouchableOpacity>
          {submitted && errors.terms ? <Text style={styles.fieldError}>{errors.terms}</Text> : null}

          <TouchableOpacity
            style={[styles.btn, (!isFormValid || isLoading) && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.btnText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.signInRow}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text style={styles.signInLink}>Sign In</Text>
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
  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  brandName: { fontSize: 22, fontWeight: '700', color: '#fff' },
  heroTitle: { fontSize: 34, fontWeight: '800', color: '#fff', lineHeight: 40, marginBottom: 6 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.82)' },
  card: { flex: 1 },
  cardContent: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F7',
    borderWidth: 1,
    borderColor: '#FFB3D9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 8,
  },
  errorBannerText: { color: primaryColor, fontSize: 13, flex: 1 },
  label: { fontSize: 14, fontWeight: '600', color: dark, marginBottom: 8 },
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
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: dark, height: 54 },
  fieldError: { color: primaryColor, fontSize: 12, marginTop: 4 },
  termsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 6 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxChecked: { backgroundColor: primaryColor, borderColor: primaryColor },
  termsText: { fontSize: 14, color: textMuted },
  termsLink: { color: primaryColor, fontWeight: '600' },
  btn: {
    backgroundColor: primaryColor,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: primaryColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  btnDisabled: { backgroundColor: '#ccc', shadowOpacity: 0 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  signInRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  signInText: { fontSize: 14, color: textMuted },
  signInLink: { fontSize: 14, color: primaryColor, fontWeight: '700' },
});

export default SignUpScreen;
