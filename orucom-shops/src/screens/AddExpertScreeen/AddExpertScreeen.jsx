import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Switch,
} from 'react-native';
import React, { useContext, useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import { AuthContext } from '../../context/AuthContext';
import { addBeautyExpert } from '../../apis/services';
import { primaryColor } from '../../constants/colors';

const AddExpertScreen = ({ navigation }) => {
  const [expertName, setExpertName] = useState('');
  const [specialist, setSpecialist] = useState(null);
  const [about, setAbout] = useState('');
  const [address, setAddress] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [useShopAddress, setUseShopAddress] = useState(false);

  const { user, userData } = useContext(AuthContext);

  const [open, setOpen] = useState(false);
  const [specialistOptions, setSpecialistOptions] = useState([
    { label: 'Hair Cut', value: 'hair_cut' },
    { label: 'Hair Styling', value: 'hair_styling' },
    { label: 'Hair Coloring', value: 'hair_coloring' },
    { label: 'Facial', value: 'facial' },
    { label: 'Manicure', value: 'manicure' },
    { label: 'Pedicure', value: 'pedicure' },
    { label: 'Makeup', value: 'makeup' },
    { label: 'Bridal Makeup', value: 'bridal_makeup' },
    { label: 'Waxing', value: 'waxing' },
    { label: 'Threading', value: 'threading' },
    { label: 'Spa Treatment', value: 'spa' },
    { label: 'Massage', value: 'massage' },
    { label: 'Skin Treatment', value: 'skin_treatment' },
    { label: 'Nail Art', value: 'nail_art' },
  ]);

  const validate = () => {
    const newErrors = {};
    if (!expertName.trim()) newErrors.expertName = 'Expert name is required';
    if (!specialist) newErrors.specialist = 'Specialty is required';
    if (!address.trim()) newErrors.address = 'Address is required';
    if (!imageUri) newErrors.image = 'Image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddBeautyExpert = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const expertData = {
        expertName,
        specialist,
        about,
        address,
      };

      const result = await addBeautyExpert(user.uid, expertData, imageUri);
      if (result) {
        setSuccessModalVisible(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add expert. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setSuccessModalVisible(false);
    setExpertName('');
    setSpecialist(null);
    setAbout('');
    setAddress('');
    setImageUri(null);
    setErrors({});
    setUseShopAddress(false);
    navigation.goBack();
  };

  const selectImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage);
        return;
      }
      const uri = response.assets?.[0]?.uri;
      if (uri) {
        setImageUri(uri);
        if (errors.image) setErrors(prev => ({ ...prev, image: null }));
      }
    });
  };

  const handleToggleShopAddress = value => {
    setUseShopAddress(value);
    if (value) {
      const shopAddress = userData?.address || '';
      setAddress(shopAddress);
      if (errors.address) setErrors(prev => ({ ...prev, address: null }));
    } else {
      setAddress('');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={primaryColor} />

      <View style={styles.headerContainer}>
        <Image
          source={require('../../assets/images/home_bg-1.png')}
          style={styles.headerBg}
          resizeMode="cover"
        />
        <View style={styles.headerOverlay} />
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <View style={styles.backBtnCircle}>
              <Icon name="chevron-back" size={22} color={primaryColor} />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Beauty Expert</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.mainContent}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Expert Name</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.expertName && styles.inputError,
                ]}
              >
                <View style={styles.iconContainer}>
                  <Icon name="person-outline" size={20} color={primaryColor} />
                </View>
                <TextInput
                  style={styles.textInput}
                  value={expertName}
                  onChangeText={text => {
                    setExpertName(text);
                    if (errors.expertName)
                      setErrors(prev => ({ ...prev, expertName: null }));
                  }}
                  placeholder="Ex: John"
                  placeholderTextColor="#999"
                />
              </View>
              {errors.expertName && (
                <Text style={styles.errorMsg}>{errors.expertName}</Text>
              )}
            </View>

            <View style={[styles.inputGroup, { zIndex: 2000 }]}>
              <Text style={styles.inputLabel}>Specialist</Text>
              <DropDownPicker
                open={open}
                value={specialist}
                items={specialistOptions}
                setOpen={setOpen}
                setValue={setSpecialist}
                setItems={setSpecialistOptions}
                onSelectItem={() => {
                  if (errors.specialist)
                    setErrors(prev => ({ ...prev, specialist: null }));
                }}
                searchable={true}
                placeholder="Select Specialty"
                style={[
                  styles.dropdownStyle,
                  errors.specialist && styles.inputError,
                ]}
                dropDownContainerStyle={styles.dropdownContainerStyle}
                textStyle={styles.dropdownText}
                labelStyle={styles.dropdownLabel}
                placeholderStyle={{ color: '#999' }}
                listMode="SCROLLVIEW"
                scrollViewProps={{
                  nestedScrollEnabled: true,
                }}
              />
              {errors.specialist && (
                <Text style={styles.errorMsg}>{errors.specialist}</Text>
              )}
            </View>

            <View style={[styles.inputGroup, { zIndex: 1000 }]}>
              <Text style={styles.inputLabel}>About</Text>
              <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                <View style={[styles.iconContainer, { height: '100%' }]}>
                  <Icon
                    name="information-circle-outline"
                    size={20}
                    color={primaryColor}
                  />
                </View>
                <TextInput
                  style={[styles.textInput, styles.textAreaInput]}
                  value={about}
                  onChangeText={setAbout}
                  placeholder="Tell us about the expert..."
                  placeholderTextColor="#999"
                  multiline={true}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={[styles.inputLabel, { marginBottom: 0 }]}>
                  Address
                </Text>
                <View style={styles.toggleContainer}>
                  <Text style={styles.toggleText}>Use shop address</Text>
                  <Switch
                    trackColor={{ false: '#767577', true: '#b39ddb' }}
                    thumbColor={useShopAddress ? primaryColor : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={handleToggleShopAddress}
                    value={useShopAddress}
                    style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                  />
                </View>
              </View>
              <View
                style={[
                  styles.inputWrapper,
                  styles.textAreaWrapper,
                  errors.address && styles.inputError,
                  useShopAddress && styles.disabledInput,
                ]}
              >
                <View style={[styles.iconContainer, { height: '100%' }]}>
                  <Icon
                    name="location-outline"
                    size={20}
                    color={primaryColor}
                  />
                </View>
                <TextInput
                  style={[styles.textInput, styles.textAreaInput]}
                  value={address}
                  onChangeText={text => {
                    setAddress(text);
                    if (errors.address)
                      setErrors(prev => ({ ...prev, address: null }));
                  }}
                  placeholder="Enter full address"
                  placeholderTextColor="#999"
                  multiline={true}
                  textAlignVertical="top"
                  editable={!useShopAddress}
                />
              </View>
              {errors.address && (
                <Text style={styles.errorMsg}>{errors.address}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Expert Image</Text>
              <TouchableOpacity
                style={[
                  styles.uploadContainer,
                  errors.image && styles.uploadError,
                ]}
                onPress={selectImage}
                activeOpacity={0.8}
              >
                {imageUri ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.imagePreview}
                    />
                    <View style={styles.editImageOverlay}>
                      <Icon name="camera" size={20} color="#fff" />
                    </View>
                  </View>
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <View style={styles.uploadIconCircle}>
                      <Icon
                        name="cloud-upload-outline"
                        size={28}
                        color={primaryColor}
                      />
                    </View>
                    <Text style={styles.uploadText}>Click to upload image</Text>
                    <Text style={styles.uploadSubText}>
                      Size 90x90 recommended
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              {errors.image && (
                <Text style={styles.errorMsg}>{errors.image}</Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
            onPress={handleAddBeautyExpert}
            disabled={isLoading}
            activeOpacity={0.9}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>ADD EXPERT</Text>
                <Icon
                  name="add-circle-outline"
                  size={22}
                  color="#fff"
                  style={{ marginLeft: 10 }}
                />
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        transparent={true}
        visible={isSuccessModalVisible}
        animationType="fade"
        onRequestClose={handleCloseSuccessModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successHeader}>
              <Icon name="checkmark-circle" size={60} color="#2ecc71" />
            </View>
            <Text style={styles.successTitle}>Success!</Text>
            <Text style={styles.successMessage}>
              New Beauty Expert has been added successfully.
            </Text>
            <TouchableOpacity
              style={styles.successBtn}
              onPress={handleCloseSuccessModal}
            >
              <Text style={styles.successBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: primaryColor,
  },
  headerContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
    justifyContent: 'flex-start',
  },
  headerBg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: primaryColor,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  backButton: {
    zIndex: 10,
  },
  backBtnCircle: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -40,
    paddingTop: 25,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  formSection: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingLeft: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
    fontWeight: '500',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495e',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: primaryColor,
    height: 54,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  disabledInput: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  textAreaWrapper: {
    height: 100,
    alignItems: 'flex-start',
  },
  inputError: {
    borderColor: '#ff6b6b',
    borderWidth: 1.5,
  },
  iconContainer: {
    width: 50,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FBFBFB',
    borderRightWidth: 1,
    borderRightColor: '#F0F0F0',
  },
  textInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 15,
    color: '#333',
    fontSize: 16,
  },
  textAreaInput: {
    paddingTop: 15,
    textAlignVertical: 'top',
  },
  dropdownStyle: {
    backgroundColor: '#fff',
    borderColor: primaryColor,
    borderRadius: 12,
    height: 54,
    paddingLeft: 15,
  },
  dropdownContainerStyle: {
    borderColor: '#E0E0E0',
    marginTop: 5,
    borderRadius: 12,
    elevation: 5,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownLabel: {
    fontSize: 16,
    color: '#333',
  },
  errorMsg: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
    fontWeight: '500',
  },
  uploadContainer: {
    height: 140,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: primaryColor,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  uploadError: {
    borderColor: '#ff6b6b',
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  uploadSubText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  imagePreviewContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  editImageOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 20,
  },
  submitBtn: {
    backgroundColor: primaryColor,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#8e44ad',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginTop: 10,
  },
  submitBtnDisabled: {
    backgroundColor: '#b39ddb',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successCard: {
    backgroundColor: '#fff',
    width: '85%',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    elevation: 10,
  },
  successHeader: {
    marginBottom: 15,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  successBtn: {
    backgroundColor: primaryColor,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  successBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddExpertScreen;
