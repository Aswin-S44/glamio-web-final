import React, { useState, useRef, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';

import { primaryColor } from '../../constants/colors';
import { AuthContext } from '../../context/AuthContext';
import { resentOTP, verifyOtp } from '../../apis/auth';
import auth from '@react-native-firebase/auth';
import { firestore } from '../../config/firebase';
import { COLLECTIONS } from '../../constants/collections';

export const resetPassword = async email => {
  try {
    await auth().sendPasswordResetEmail(email);
    return true;
  } catch (error) {
    throw error;
  }
};

const OTPVerificationScreen = ({ navigation, route }) => {
  const firstInput = useRef();
  const secondInput = useRef();
  const thirdInput = useRef();
  const fourthInput = useRef();
  const fifthInput = useRef();
  const sixthInput = useRef();

  const [otp, setOtp] = useState({ 1: '', 2: '', 3: '', 4: '', 5: '', 6: '' });
  const [isVerifying, setIsVerifying] = useState(false);

  const { user, setUserData } = useContext(AuthContext);
  const emailFromRoute = route.params?.email || user?.email;

  const handleVerifyOTP = async () => {
    setIsVerifying(true);
    const otpValue = Object.values(otp).join('');

    try {
      if (!emailFromRoute) {
        Alert.alert('Error', 'Email not found for OTP verification.');
        return;
      }

      const res = await verifyOtp(emailFromRoute, otpValue);

      if (res && res.success) {
        const uidToUpdate = user?.uid || res.userData?.uid;

        if (uidToUpdate) {
          await firestore()
            .collection(COLLECTIONS.SHOP_OWNERS)
            .doc(uidToUpdate)
            .update({ isOTPVerified: true });

          setUserData(prevData => ({ ...prevData, isOTPVerified: true }));
        } else {
          Alert.alert('Error', 'User ID not found after OTP verification.');
        }
      } else {
        Alert.alert('Invalid OTP', 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('OTP Verification Error:', error);
      Alert.alert('Error', 'An error occurred during OTP verification.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResentOTP = async () => {
    if (emailFromRoute) {
      try {
        await resentOTP(emailFromRoute);
        setOtp({ 1: '', 2: '', 3: '', 4: '', 5: '', 6: '' });
        Alert.alert('OTP Resent', 'A new OTP has been sent to your email.');
      } catch (error) {
        console.error('Error while resending OTP:', error);
        Alert.alert('Error', 'Failed to resend OTP. Please try again.');
      }
    } else {
      Alert.alert('Error', 'Email not found to resend OTP.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.mainTitle}>OTP Verification</Text>
        <Image
          source={require('../../assets/images/forgot-password.png')}
          style={styles.illustration}
        />

        <Text style={styles.infoText}>Enter OTP Sent To:</Text>
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't get OTP code? </Text>
          <TouchableOpacity disabled={isVerifying} onPress={handleResentOTP}>
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
                  value={otp[digit]}
                  editable={!isVerifying}
                />
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleVerifyOTP}
          disabled={isVerifying || Object.values(otp).join('').length !== 6}
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '400',
    color: '#333',
    marginBottom: 20,
  },
  illustration: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#888',
  },
  resendContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  resendText: {
    fontSize: 15,
    color: '#888',
  },
  resendLink: {
    fontSize: 15,
    color: primaryColor,
    fontWeight: 'bold',
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 40,
  },
  otpBox: {
    width: 45,
    height: 60,
    borderBottomWidth: 2,
    borderBottomColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  otpInput: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
  createButton: {
    backgroundColor: primaryColor,
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 30,
    width: '80%',
    marginTop: 20,
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
    marginTop: 4,
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default OTPVerificationScreen;
