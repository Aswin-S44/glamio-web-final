import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Modal,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { primaryColor } from '../../constants/colors';
import { launchImageLibrary } from 'react-native-image-picker';
import { AuthContext } from '../../context/AuthContext';
import { getUserData, updateUserData } from '../../apis/services';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');
const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const EditProfileScreen = ({ navigation }) => {
  const { user, refreshUserData } = useContext(AuthContext);

  // State variables
  const [name, setName] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [about, setAbout] = useState('');
  const [address, setAddress] = useState('');
  const [openingHours, setOpeningHours] = useState([]);
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');

  // Loading & Feedback states
  const [profileLoading, setProfileLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const initialImage = require('../../assets/images/home_bg-1.png');

  // Fetch Data
  useEffect(() => {
    if (user && user.uid) {
      setProfileLoading(true);
      const fetchUserData = async () => {
        try {
          const res = await getUserData(user.uid);
          if (res) {
            setName(res.parlourName || '');
            setAbout(res.about || '');
            setAddress(res.address || '');
            setImageUri(res.profileImage || null);
            setOpeningHours(res.openingHours || []);
            setGoogleReviewUrl(res.googleReviewUrl || '');
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        } finally {
          setProfileLoading(false);
        }
      };
      fetchUserData();
    } else {
      setProfileLoading(false);
    }
  }, [user]);

  // Auto-hide Toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Logic Functions
  const selectImage = () => {
    launchImageLibrary(
      { mediaType: 'photo', includeBase64: true },
      response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          console.error('ImagePicker Error: ', response.errorMessage);
          return;
        }
        const asset = response.assets?.[0];
        if (asset && asset.base64) {
          setImageUri(`data:${asset.type};base64,${asset.base64}`);
        }
      },
    );
  };

  const toggleDaySelection = day => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day],
    );
  };

  const onTimeChange = (event, selectedDate, type) => {
    if (type === 'start') {
      setShowStartTimePicker(Platform.OS === 'ios');
      if (selectedDate) setStartTime(selectedDate);
    } else {
      setShowEndTimePicker(Platform.OS === 'ios');
      if (selectedDate) setEndTime(selectedDate);
    }
  };

  const formatTime = date =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const addOpeningHour = () => {
    if (selectedDays.length === 0) {
      setToastMessage('Please select at least one day.');
      return;
    }

    // Basic sorting logic (simplified for brevity)
    const displayDays = selectedDays.join(', ');
    const newHourString = `${displayDays}: ${formatTime(
      startTime,
    )} - ${formatTime(endTime)}`;

    if (!openingHours.includes(newHourString)) {
      setOpeningHours([...openingHours, newHourString]);
      setIsModalVisible(false);
      setSelectedDays([]);
    } else {
      setToastMessage('This schedule already exists.');
    }
  };

  const removeOpeningHour = indexToRemove => {
    setOpeningHours(openingHours.filter((_, index) => index !== indexToRemove));
  };

  const handleEditProfile = async () => {
    if (!user) return;
    setIsSaving(true);

    const updatedData = {
      parlourName: name,
      address,
      profileImage: imageUri,
      about,
      openingHours,
      googleReviewUrl,
    };
    try {
      await updateUserData(user.uid, updatedData);
      await refreshUserData();
      setToastMessage('Profile updated successfully!');
      setTimeout(() => navigation.goBack(), 1000);
    } catch (error) {
      console.error('Error:', error);
      setToastMessage('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const imageSource = imageUri ? { uri: imageUri } : initialImage;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBtn}
        >
          <Icon name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          onPress={handleEditProfile}
          disabled={isSaving}
          style={styles.saveBtn}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={primaryColor} />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Image Uploader */}
        <View style={styles.imageSection}>
          <View style={styles.imageWrapper}>
            <Image source={imageSource} style={styles.avatar} />
            <TouchableOpacity style={styles.cameraBtn} onPress={selectImage}>
              <Icon name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.changePhotoText}>Change Profile Photo</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {/* Shop Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Shop Name</Text>
            <View style={styles.inputWrapper}>
              <Icon
                name="business-outline"
                size={20}
                color="#888"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter Shop Name"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* About */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>About</Text>
            <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={about}
                onChangeText={setAbout}
                placeholder="Tell customers about your services..."
                placeholderTextColor="#999"
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
              <Icon
                name="location-outline"
                size={20}
                color="#888"
                style={styles.inputIconTop}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                value={address}
                onChangeText={setAddress}
                placeholder="Full shop address"
                placeholderTextColor="#999"
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Opening Hours */}
          <View style={styles.inputGroup}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.label}>Opening Hours</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                <Text style={styles.addLink}>+ Add New</Text>
              </TouchableOpacity>
            </View>

            {openingHours.length === 0 ? (
              <View style={styles.emptyStateBox}>
                <Text style={styles.emptyStateText}>
                  No opening hours added
                </Text>
              </View>
            ) : (
              <View style={styles.chipsContainer}>
                {openingHours.map((hour, index) => (
                  <View key={index} style={styles.hourChip}>
                    <Icon name="time-outline" size={16} color={primaryColor} />
                    <Text style={styles.hourChipText}>{hour}</Text>
                    <TouchableOpacity onPress={() => removeOpeningHour(index)}>
                      <Icon name="close-circle" size={18} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Google Review URL */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Google Review URL</Text>
            <View style={styles.inputWrapper}>
              <Icon
                name="logo-google"
                size={20}
                color="#888"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={googleReviewUrl}
                onChangeText={setGoogleReviewUrl}
                placeholder="https://g.page/..."
                placeholderTextColor="#999"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      {/* Add Hours Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Set Schedule</Text>
            <Text style={styles.modalSubtitle}>Select working days</Text>

            <View style={styles.daysGrid}>
              {daysOfWeek.map(day => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayBtn,
                    selectedDays.includes(day) && styles.dayBtnSelected,
                  ]}
                  onPress={() => toggleDaySelection(day)}
                >
                  <Text
                    style={[
                      styles.dayBtnText,
                      selectedDays.includes(day) && styles.dayBtnTextSelected,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalSubtitle}>Select Time</Text>
            <View style={styles.timeRow}>
              <TouchableOpacity
                style={styles.timeBox}
                onPress={() => setShowStartTimePicker(true)}
              >
                <Text style={styles.timeLabel}>Opens At</Text>
                <Text style={styles.timeValue}>{formatTime(startTime)}</Text>
              </TouchableOpacity>

              <Icon name="arrow-forward" size={20} color="#ccc" />

              <TouchableOpacity
                style={styles.timeBox}
                onPress={() => setShowEndTimePicker(true)}
              >
                <Text style={styles.timeLabel}>Closes At</Text>
                <Text style={styles.timeValue}>{formatTime(endTime)}</Text>
              </TouchableOpacity>
            </View>

            {/* Time Pickers (conditionally rendered) */}
            {showStartTimePicker && (
              <DateTimePicker
                value={startTime}
                mode="time"
                display="default"
                onChange={(e, d) => onTimeChange(e, d, 'start')}
              />
            )}
            {showEndTimePicker && (
              <DateTimePicker
                value={endTime}
                mode="time"
                display="default"
                onChange={(e, d) => onTimeChange(e, d, 'end')}
              />
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addBtn} onPress={addOpeningHour}>
                <Text style={styles.addBtnText}>Add Schedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Loading Overlay */}
      {profileLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      )}

      {/* Toast Notification */}
      {toastMessage ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  saveText: {
    color: primaryColor,
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  imageSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  imageWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#f0f0f0',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: primaryColor,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  changePhotoText: {
    color: primaryColor,
    fontWeight: '500',
    fontSize: 14,
  },
  formContainer: {
    paddingHorizontal: 25,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginLeft: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 12,
    height: 50,
  },
  textAreaWrapper: {
    height: 100,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputIconTop: {
    marginRight: 10,
    marginTop: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
  },
  textArea: {
    textAlignVertical: 'top',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addLink: {
    color: primaryColor,
    fontWeight: '600',
    fontSize: 14,
  },
  emptyStateBox: {
    padding: 15,
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    color: '#999',
    fontSize: 14,
  },
  chipsContainer: {
    marginTop: 5,
  },
  hourChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 8,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  hourChipText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    marginLeft: 10,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 15,
    marginBottom: 10,
    fontWeight: '500',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  dayBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dayBtnSelected: {
    backgroundColor: primaryColor,
    borderColor: primaryColor,
  },
  dayBtnText: {
    fontSize: 13,
    color: '#555',
  },
  dayBtnTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
    marginBottom: 20,
  },
  timeBox: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  timeLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#666',
    fontWeight: '600',
  },
  addBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: primaryColor,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '600',
  },

  // Utilities
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toast: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default EditProfileScreen;
