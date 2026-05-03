import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { primaryColor } from '../../constants/colors';
import { login } from '../../apis/auth';
import api from '../../config/api';

export const resetPassword = async email => {
  try {
    await api.post('/auth/reset-password', { email });
    return true;
  } catch (err) {
    throw err;
  }
};

const SignInScreen = ({ navigation }) => {
  const [rememberMe, setRememberMe] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [isForgotModalVisible, setIsForgotModalVisible] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotEmailError, setForgotEmailError] = useState('');
  const [loginError, setLoginError] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const validateFields = () => {
    let isValid = true;
    if (!email) {
      setEmailError('Email is required.');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email address is invalid.');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleLogin = async () => {
    setLoginError('');
    if (!validateFields()) {
      return;
    }
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      setLoginError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!forgotEmail) {
      setForgotEmailError('Email is required to reset password.');
      return;
    }
    setForgotEmailError('');
    setIsSendingOtp(true);
    try {
      await resetPassword(forgotEmail);
      setIsForgotModalVisible(false);
      Alert.alert(
        'Password Reset',
        'We have sent a password reset link to your email. Please check your spam folder as well.',
      );
      setForgotEmail('');
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || 'Failed to send password reset email.',
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <StatusBar backgroundColor={primaryColor} barStyle="light-content" />

      <Modal
        transparent={true}
        visible={isForgotModalVisible}
        animationType="fade"
        onRequestClose={() => setIsForgotModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPressOut={() => setIsForgotModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Forgot Password</Text>
            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>Email</Text>
              <View style={styles.modalInputContainer}>
                <Feather
                  name="send"
                  size={20}
                  color="#888"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="demo@gmail.com"
                  placeholderTextColor="#888"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={forgotEmail}
                  onChangeText={setForgotEmail}
                />
              </View>
              {forgotEmailError ? (
                <Text style={styles.errorText}>{forgotEmailError}</Text>
              ) : null}
            </View>
            <TouchableOpacity
              style={[
                styles.modalButton,
                isSendingOtp && styles.disabledButton,
              ]}
              onPress={handlePasswordReset}
              disabled={isSendingOtp}
            >
              {isSendingOtp ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.modalButtonText}>SEND CODE</Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={24} color="#fff" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.mainTitle}>Sign In</Text>

          {loginError ? (
            <View style={styles.loginErrorBox}>
              <Text style={styles.loginErrorText}>{loginError}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputContainer}>
              <Feather
                name="send"
                size={20}
                color="#888"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="demo@gmail.com"
                placeholderTextColor="#888"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  if (emailError) validateFields();
                }}
              />
            </View>
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#888"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Type Password"
                placeholderTextColor="#888"
                secureTextEntry={secureTextEntry}
                value={password}
                onChangeText={text => {
                  setPassword(text);
                  if (passwordError) validateFields();
                }}
              />
              <TouchableOpacity
                onPress={() => setSecureTextEntry(!secureTextEntry)}
              >
                <Ionicons
                  name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color="#888"
                />
              </TouchableOpacity>
            </View>
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.rememberMe}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <Ionicons
                name={rememberMe ? 'checkbox' : 'square-outline'}
                size={22}
                color={rememberMe ? primaryColor : '#888'}
              />
              <Text style={styles.rememberMeText}>Remember me</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsForgotModalVisible(true)}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.signInButton, isLoading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.signInButtonText}>SIGN IN ACCOUNT</Text>
            )}
          </TouchableOpacity>

          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>If you have no an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const OTPVerificationScreen = ({ navigation, route }) => {
  const { email } = route.params;
  const firstInput = useRef();
  const secondInput = useRef();
  const thirdInput = useRef();
  const fourthInput = useRef();
  const fifthInput = useRef();
  const sixthInput = useRef();

  const [otp, setOtp] = useState({ 1: '', 2: '', 3: '', 4: '', 5: '', 6: '' });
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerifyOTP = async () => {
    setIsVerifying(true);
    const otpValue = Object.values(otp).join('');

    try {
      const res = await axios.post(BACKEND_URL + `/verify-otp`, {
        email,
        otp: otpValue,
      });

      if (res && res.data.success) {
        Alert.alert(
          'OTP Verified',
          'You can now reset your password. A reset link has been sent to your email.',
        );
        await resetPassword(email);
        navigation.navigate('SignIn');
      } else {
        Alert.alert('Invalid OTP');
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || 'An error occurred during OTP verification.',
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    setIsVerifying(true);
    try {
      await sendOtp(email);
      Alert.alert(
        'OTP Resent',
        'A new OTP has been sent to your email address.',
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to resend OTP.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        disabled={isVerifying}
      >
        <Ionicons name="arrow-back" size={28} color={primaryColor} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.mainTitle}>OTP Verification</Text>
        <Image
          source={require('../../assets/images/forgot-password.png')}
          style={styles.illustration}
        />

        <Text style={styles.infoText}>Enter OTP Sent To: {email}</Text>
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't get OTP code? </Text>
          <TouchableOpacity onPress={handleResendOTP} disabled={isVerifying}>
            <Text style={styles.resendLink}>RESEND</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.otpInputContainer}>
          {[1, 2, 3, 4, 5, 6].map((digit, index) => {
            const refs = [
              firstInput,
              secondInput,
              thirdInput,
              fourthInput,
              fifthInput,
              sixthInput,
            ];
            return (
              <View key={digit} style={styles.otpBox}>
                <TextInput
                  style={styles.otpInput}
                  keyboardType="number-pad"
                  maxLength={1}
                  ref={refs[index]}
                  onChangeText={text => {
                    setOtp({ ...otp, [digit]: text });

                    if (text && index < 5) {
                      refs[index + 1].current.focus();
                    }

                    if (!text && index > 0) {
                      refs[index - 1].current.focus();
                    }
                  }}
                  editable={!isVerifying}
                />
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleVerifyOTP}
          disabled={isVerifying}
        >
          {isVerifying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>NEXT</Text>
          )}
        </TouchableOpacity>

        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Back to SignIn? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('SignIn')}
            disabled={isVerifying}
          >
            <Text style={styles.signInLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal transparent={true} animationType="fade" visible={isVerifying}>
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: primaryColor,
  },
  backButton: {
    position: 'absolute',
    top: 55,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 5,
  },
  container: {
    flex: 1,
    marginTop: 100,
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 25,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '400',
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  loginErrorBox: {
    backgroundColor: '#ffe6e6',
    borderWidth: 1,
    borderColor: 'red',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  loginErrorText: {
    color: 'red',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberMeText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#555',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: primaryColor,
    fontWeight: '500',
  },
  signInButton: {
    backgroundColor: primaryColor,
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  disabledButton: {
    backgroundColor: '#A9A9A9',
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 15,
    color: '#555',
  },
  signUpLink: {
    fontSize: 15,
    color: primaryColor,
    fontWeight: '500',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    padding: 25,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  modalInputLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  modalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  modalButton: {
    backgroundColor: primaryColor,
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingTop: 0,
    alignItems: 'center',
  },
  illustration: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  resendContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  resendText: {
    fontSize: 15,
    color: '#555',
  },
  resendLink: {
    fontSize: 15,
    color: primaryColor,
    fontWeight: '500',
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    width: '100%',
    paddingHorizontal: 20,
  },
  otpBox: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpInput: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    width: '100%',
  },
  createButton: {
    backgroundColor: primaryColor,
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  signInText: {
    fontSize: 15,
    color: '#555',
  },
  signInLink: {
    fontSize: 15,
    color: primaryColor,
    fontWeight: '500',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SignInScreen;
