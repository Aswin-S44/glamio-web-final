import React, { useContext, useEffect, useState } from 'react';
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
  FlatList,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { AuthContext } from '../../context/AuthContext';
import { addOffer, getShopServices } from '../../apis/services';
import { primaryColor } from '../../constants/colors';

const AddOffersScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [regularPrice, setRegularPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [myServices, setMyServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [servicesForCategory, setServicesForCategory] = useState([]);

  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isServiceModalVisible, setServiceModalVisible] = useState(false);
  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user && user.uid) {
      setLoading(true);
      const fetchServices = async () => {
        try {
          const res = await getShopServices(user.uid);
          const services = res || [];
          setMyServices(services);
          const uniqueCategories = [
            ...new Set(services.map(item => item.category)),
          ];
          setCategories(uniqueCategories);
        } catch (error) {
          console.error('Failed to fetch services:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchServices();
    } else {
      setLoading(false);
    }
  }, [user]);

  const resetForm = () => {
    setSelectedCategory(null);
    setSelectedService(null);
    setRegularPrice('');
    setOfferPrice('');
    setImageUri(null);
    setServicesForCategory([]);
  };

  const handleSelectCategory = category => {
    setSelectedCategory(category);
    const filteredServices = myServices.filter(
      service => service.category === category,
    );
    setServicesForCategory(filteredServices);
    setSelectedService(null);
    setRegularPrice('');
    setOfferPrice('');
    setCategoryModalVisible(false);
  };

  const handleSelectService = service => {
    setSelectedService(service);
    setRegularPrice(String(service.servicePrice));
    setOfferPrice('');
    setServiceModalVisible(false);
  };

  const selectImage = () => {
    launchImageLibrary(
      { mediaType: 'photo', includeBase64: true },
      response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Error', response.errorMessage);
          return;
        }
        const asset = response.assets?.[0];
        if (asset && asset.base64) {
          const uri = `data:${asset.type};base64,${asset.base64}`;
          setImageUri(uri);
        }
      },
    );
  };

  const handleAddOffer = async () => {
    if (!selectedService || !offerPrice || !imageUri) {
      Alert.alert(
        'Missing Information',
        'Please fill all fields and upload an image.',
      );
      return;
    }

    setIsSaving(true);

    const offerData = {
      serviceId: selectedService.id,
      category: selectedCategory,
      serviceName: selectedService.serviceName,
      regularPrice: parseFloat(regularPrice),
      offerPrice: parseFloat(offerPrice),
    };

    try {
      if (user && user.uid) {
        const result = await addOffer(user.uid, offerData, imageUri);
        if (result) {
          setSuccessModalVisible(true);
        } else {
          Alert.alert('Error', 'Failed to add the offer. Please try again.');
        }
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'An unexpected error occurred while adding the offer.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setSuccessModalVisible(false);
    resetForm();
    navigation.goBack();
  };

  const renderPickerModal = (
    visible,
    setVisible,
    data,
    onSelectItem,
    keyExtractor,
    renderItem,
    title,
  ) => (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={() => setVisible(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        onPress={() => setVisible(false)}
        activeOpacity={1}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={data}
            keyExtractor={keyExtractor}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => onSelectItem(item)}
              >
                <Text style={styles.modalItemText}>{renderItem(item)}</Text>
                <Icon name="chevron-forward" size={18} color="#ccc" />
              </TouchableOpacity>
            )}
            style={{ maxHeight: 300 }}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );

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
          <Text style={styles.headerTitle}>Add Offers</Text>
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
          keyboardShouldPersistTaps="handled"
        >
          {loading ? (
            <ActivityIndicator
              size="large"
              color={primaryColor}
              style={{ marginTop: 50 }}
            />
          ) : (
            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category</Text>
                <TouchableOpacity
                  style={styles.inputWrapper}
                  onPress={() => setCategoryModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <View style={styles.iconContainer}>
                    <Icon name="grid-outline" size={20} color={primaryColor} />
                  </View>
                  <Text
                    style={[
                      styles.textInput,
                      !selectedCategory && { color: '#999' },
                    ]}
                  >
                    {selectedCategory || 'Select Category'}
                  </Text>
                  <Icon
                    name="chevron-down"
                    size={20}
                    color="#999"
                    style={{ marginRight: 15 }}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Service Name</Text>
                <TouchableOpacity
                  style={[
                    styles.inputWrapper,
                    !selectedCategory && styles.disabledInput,
                  ]}
                  onPress={() => setServiceModalVisible(true)}
                  disabled={!selectedCategory}
                  activeOpacity={0.8}
                >
                  <View style={styles.iconContainer}>
                    <Icon name="cut-outline" size={20} color={primaryColor} />
                  </View>
                  <Text
                    style={[
                      styles.textInput,
                      !selectedService && { color: '#999' },
                    ]}
                  >
                    {selectedService
                      ? selectedService.serviceName
                      : 'Select Service'}
                  </Text>
                  <Icon
                    name="chevron-down"
                    size={20}
                    color="#999"
                    style={{ marginRight: 15 }}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Regular Price</Text>
                <View style={[styles.inputWrapper, styles.disabledInput]}>
                  <View style={styles.iconContainer}>
                    <Icon
                      name="pricetag-outline"
                      size={20}
                      color={primaryColor}
                    />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    value={regularPrice}
                    editable={false}
                    placeholder="Auto-filled"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Offer Price</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.iconContainer}>
                    <Icon name="cash-outline" size={20} color={primaryColor} />
                  </View>
                  <TextInput
                    style={styles.textInput}
                    value={offerPrice}
                    onChangeText={setOfferPrice}
                    keyboardType="numeric"
                    placeholder="Enter offer price"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Offer Image</Text>
                <TouchableOpacity
                  style={styles.uploadContainer}
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
                      <Text style={styles.uploadText}>
                        Click to upload image
                      </Text>
                      <Text style={styles.uploadSubText}>
                        Size 90x90 recommended
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, isSaving && styles.submitBtnDisabled]}
                onPress={handleAddOffer}
                disabled={isSaving}
                activeOpacity={0.9}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.submitBtnText}>ADD OFFER</Text>
                    <Icon
                      name="add-circle-outline"
                      size={22}
                      color="#fff"
                      style={{ marginLeft: 10 }}
                    />
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {renderPickerModal(
        isCategoryModalVisible,
        setCategoryModalVisible,
        categories,
        handleSelectCategory,
        (item, index) => index.toString(),
        item => item,
        'Select Category',
      )}

      {renderPickerModal(
        isServiceModalVisible,
        setServiceModalVisible,
        servicesForCategory,
        handleSelectService,
        item => item.id,
        item => item.serviceName,
        'Select Service',
      )}

      <Modal
        transparent={true}
        visible={isSuccessModalVisible}
        animationType="fade"
        onRequestClose={handleCloseSuccessModal}
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successHeader}>
              <Icon name="checkmark-circle" size={60} color="#2ecc71" />
            </View>
            <Text style={styles.successTitle}>Success!</Text>
            <Text style={styles.successMessage}>
              New Offer has been added successfully.
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
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495e',
    marginLeft: 4,
    marginBottom: 8,
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
    textAlignVertical: 'center',
    paddingVertical: 0,
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '85%',
    borderRadius: 15,
    padding: 20,
    maxHeight: '70%',
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: primaryColor,
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  successModalOverlay: {
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

export default AddOffersScreen;
