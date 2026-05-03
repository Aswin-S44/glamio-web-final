import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { primaryColor } from '../../constants/colors';
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { auth } from '../../config/firebase';
import { AuthContext } from '../../context/AuthContext';

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

const ChangePasswordScreen = ({ navigation }) => {
  const [passwords, setPasswords] = useState({
    old: true,
    new: true,
    confirm: true,
  });
  const { user, logout } = useContext(AuthContext);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalSuccess, setModalSuccess] = useState(false);

  const toggleSecureEntry = field => {
    setPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const showModal = (message, success) => {
    setModalMessage(message);
    setModalSuccess(success);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    if (modalSuccess) {
      logout();
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      showModal('Please fill all fields', false);
      return;
    }

    if (newPassword !== confirmPassword) {
      showModal('New passwords do not match', false);
      return;
    }

    if (newPassword.length < 6) {
      showModal('Password must be at least 6 characters', false);
      return;
    }

    setLoading(true);

    try {
      if (user && user?.email) {
        const credential = EmailAuthProvider.credential(
          user.email,
          oldPassword,
        );
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        showModal('Password changed successfully', true);
      } else {
        showModal(
          'No user is currently signed in or user email not found.',
          false,
        );
      }
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        showModal('Current password is incorrect', false);
      } else if (error.code === 'auth/requires-recent-login') {
        showModal('Please sign in again to change your password', false);
      } else {
        showModal(error.message, false);
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
          <Text style={styles.mainTitle}>Change Password</Text>

          <PasswordInput
            label="Old Password"
            value={oldPassword}
            onChangeText={setOldPassword}
            secureTextEntry={passwords.old}
            toggleSecureEntry={() => toggleSecureEntry('old')}
          />
          <PasswordInput
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={passwords.new}
            toggleSecureEntry={() => toggleSecureEntry('new')}
          />
          <PasswordInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={passwords.confirm}
            toggleSecureEntry={() => toggleSecureEntry('confirm')}
          />

          <TouchableOpacity
            style={[styles.changeButton, loading && styles.disabledButton]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.changeButtonText}>CHANGE PASSWORD</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons
                name={modalSuccess ? 'checkmark-circle' : 'close-circle'}
                size={70}
                color={modalSuccess ? primaryColor : '#FF3B30'}
              />
            </View>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
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
  inputGroup: {
    marginBottom: 25,
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
  changeButton: {
    backgroundColor: primaryColor,
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  changeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    marginBottom: 20,
  },
  modalMessage: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 25,
    color: '#333',
    fontWeight: '500',
  },
  modalButton: {
    backgroundColor: primaryColor,
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 15,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ChangePasswordScreen;
