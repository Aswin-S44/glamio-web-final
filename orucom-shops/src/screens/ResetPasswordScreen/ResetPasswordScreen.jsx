import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { primaryColor } from '../../constants/colors';
import { resetPassword } from '../../apis/auth';

const PasswordInput = ({
  label,
  value,
  onChangeText,
  secureTextEntry,
  toggleSecureEntry,
}) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
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
        value={value}
        onChangeText={onChangeText}
      />
      <TouchableOpacity onPress={toggleSecureEntry}>
        <Ionicons
          name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'}
          size={22}
          color="#888"
        />
      </TouchableOpacity>
    </View>
  </View>
);

const ResetPasswordScreen = ({ navigation, route }) => {
  const { email } = route.params;
  const [passwords, setPasswords] = useState({ new: true, confirm: true });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleSecureEntry = field => {
    setPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const result = await resetPassword(email, newPassword);
      if (result.success) {
        Alert.alert('Success', result.message);
        navigation.navigate('SignIn');
      } else {
        Alert.alert('Error', result.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <StatusBar backgroundColor={primaryColor} barStyle="light-content" />
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={24} color="#fff" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.mainTitle}>Reset Password</Text>
          <PasswordInput
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={passwords.new}
            toggleSecureEntry={() => toggleSecureEntry('new')}
          />
          <PasswordInput
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={passwords.confirm}
            toggleSecureEntry={() => toggleSecureEntry('confirm')}
          />
          <TouchableOpacity
            style={[styles.changeButton, loading && styles.disabledButton]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.changeButtonText}>RESET PASSWORD</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: primaryColor },
  backButton: {
    position: 'absolute',
    top: 55,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  backButtonText: { color: '#fff', fontSize: 18, marginLeft: 5 },
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
  inputGroup: { marginBottom: 25 },
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
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: 50, fontSize: 16, color: '#333' },
  changeButton: {
    backgroundColor: primaryColor,
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: { opacity: 0.7 },
  changeButtonText: { color: '#fff', fontSize: 16, fontWeight: '500' },
});

export default ResetPasswordScreen;
