import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import React, { useContext, useEffect, useState, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { updateUserData } from '../../apis/services';
import { launchImageLibrary } from 'react-native-image-picker';
import { primaryColor } from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import { TextInput } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const EditProfileScreen = ({ navigation }) => {
  const { user, refreshUser, userData, userId } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const initialImage = require('../../assets/images/user.png');

  const toastAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (userData) {
      setProfileLoading(true);
      setName(userData?.fullName || '');
      setPhone(userData.phone || '');
      setEmail(userData.email || '');
      setImageUri(userData.profileImage || null);
      setProfileLoading(false);
    }
  }, [user.uid]);

  useEffect(() => {
    if (toastMessage) {
      Animated.sequence([
        Animated.timing(toastAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.delay(2000),
        Animated.timing(toastAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease),
        }),
      ]).start(() => setToastMessage(''));
    }
  }, [toastMessage]);

  const selectImage = () => {
    launchImageLibrary(
      { mediaType: 'photo', includeBase64: true, quality: 0.7 },
      response => {
        if (response.didCancel) {
          return;
        } else if (response.errorCode) {
          setToastMessage('Failed to select image.');
        } else {
          const asset = response.assets?.[0];
          if (asset && asset.base64) {
            const uri = `data:${asset.type};base64,${asset.base64}`;
            setImageUri(uri);
          }
        }
      },
    );
  };

  const validateInputs = () => {
    let isValid = true;
    setNameError('');
    setPhoneError('');

    if (!name.trim()) {
      setNameError('Full name cannot be empty');
      isValid = false;
    }

    if (!phone.trim()) {
      setPhoneError('Phone number cannot be empty');
      isValid = false;
    } else if (!/^\d{10}$/.test(phone)) {
      setPhoneError('Phone number must be 10 digits');
      isValid = false;
    }

    return isValid;
  };

  const handleEditProfile = async () => {
    if (!user) {
      setToastMessage('User not logged in.');
      return;
    }

    if (!validateInputs()) {
      return;
    }

    setIsSaving(true);

    const updatedData = {
      fullName: name,
      email,
      profileImage: imageUri,
      phone,
    };

    try {
      await updateUserData(userId, updatedData);
      await refreshUser();
      setToastMessage('Profile updated successfully!');
      // navigation.goBack(); // Keep user on screen to see toast
    } catch (error) {
      setToastMessage('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const imageSource = imageUri ? { uri: imageUri } : initialImage;

  const toastStyle = {
    opacity: toastAnim,
    transform: [
      {
        translateY: toastAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={primaryColor} />
      <LinearGradient
        colors={['#FF6B6B', primaryColor]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity
            onPress={handleEditProfile}
            disabled={isSaving}
            style={styles.saveButton}
          >
            <Text style={styles.saveText}>
              {isSaving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.imageContainer}>
          <View style={styles.avatarBorder}>
            <Image source={imageSource} style={styles.avatar} />
          </View>
          <TouchableOpacity style={styles.editImageIcon} onPress={selectImage}>
            <Icon name="camera" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, nameError && styles.inputError]}
              value={name}
              onChangeText={text => {
                setName(text);
                setNameError('');
              }}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
            />
            {nameError ? (
              <Text style={styles.errorText}>{nameError}</Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email address"
              placeholderTextColor="#999"
              keyboardType="email-address"
              editable={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={[styles.input, phoneError && styles.inputError]}
              value={phone}
              onChangeText={text => {
                setPhone(text);
                setPhoneError('');
              }}
              placeholder="Enter your phone number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              maxLength={10}
            />
            {phoneError ? (
              <Text style={styles.errorText}>{phoneError}</Text>
            ) : null}
          </View>
        </View>
      </ScrollView>

      {(profileLoading || isSaving) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>
            {isSaving ? 'Saving profile...' : 'Loading profile...'}
          </Text>
        </View>
      )}

      {toastMessage ? (
        <Animated.View
          style={[
            styles.toastContainer,
            toastStyle,
            toastMessage.includes('Failed')
              ? styles.toastError
              : styles.toastSuccess,
          ]}
        >
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    marginBottom: -20, // Overlap with scrollview
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  saveButton: {
    padding: 5,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  imageContainer: {
    alignItems: 'center',
  },
  avatarBorder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#E0E0E0',
    borderWidth: 2,
    borderColor: '#fff',
  },
  editImageIcon: {
    position: 'absolute',
    bottom: 5,
    right: '33%',
    backgroundColor: '#4CAF50', // A nice green for edit action
    padding: 10,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  scrollContent: {
    paddingTop: 40, // Account for the overlap
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  inputError: {
    borderColor: '#FF6B6B', // Softer red for error
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 15,
    color: '#fff',
    fontSize: 17,
    fontWeight: '500',
  },
  toastContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toastSuccess: {
    backgroundColor: '#4CAF50',
  },
  toastError: {
    backgroundColor: '#FF6B6B',
  },
  toastText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default EditProfileScreen;
