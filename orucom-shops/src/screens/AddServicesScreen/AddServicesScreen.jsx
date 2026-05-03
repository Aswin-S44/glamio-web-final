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
} from 'react-native';
import React, { useContext, useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { Picker } from '@react-native-picker/picker';
import { addServices } from '../../apis/services';
import { AuthContext } from '../../context/AuthContext';
import { primaryColor } from '../../constants/colors';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

const AddServicesScreen = ({ navigation }) => {
  const [category, setCategory] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { user } = useContext(AuthContext);

  const [predefinedCategories, setPredefinedCategories] = useState([
    'Hair Cut',
    'Hair Color',
    'Facial',
    'Makeup',
  ]);

  const validate = () => {
    const newErrors = {};
    if (!category.trim()) newErrors.category = 'Category is required';
    if (!serviceName.trim()) newErrors.serviceName = 'Service name is required';
    if (!servicePrice.trim()) {
      newErrors.servicePrice = 'Price is required';
    } else if (isNaN(servicePrice)) {
      newErrors.servicePrice = 'Must be a number';
    }
    if (!imageUri) newErrors.image = 'Image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveService = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const serviceData = {
        category,
        serviceName,
        servicePrice: parseFloat(servicePrice),
      };

      const result = await addServices(user.uid, serviceData, imageUri);
      if (result) {
        setSuccessModalVisible(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save service. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setSuccessModalVisible(false);
    setCategory('');
    setServiceName('');
    setServicePrice('');
    setImageUri(null);
    setErrors({});
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

  const handleAddCustomCategory = () => {
    const newCategory = customCategory.trim();
    if (newCategory) {
      if (!predefinedCategories.includes(newCategory)) {
        setPredefinedCategories(prev => [newCategory, ...prev]);
      }
      setCategory(newCategory);
      setCategoryModalVisible(false);
      setCustomCategory('');
      if (errors.category) setErrors(prev => ({ ...prev, category: null }));
    } else {
      Alert.alert('Invalid', 'Category name cannot be empty.');
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
              <Icon name="chevron-back" size={22} color="#8e44ad" />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Service</Text>
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
        >
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.category && styles.inputError,
                ]}
              >
                <View style={styles.iconContainer}>
                  <Icon name="grid-outline" size={20} color={primaryColor} />
                </View>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={category}
                    onValueChange={itemValue => {
                      if (itemValue === 'add_new') {
                        setCategoryModalVisible(true);
                      } else {
                        setCategory(itemValue);
                        if (errors.category)
                          setErrors(prev => ({ ...prev, category: null }));
                      }
                    }}
                    style={styles.picker}
                    dropdownIconColor="#8e44ad"
                  >
                    <Picker.Item
                      label="Select Category"
                      value=""
                      color="#999"
                    />
                    {predefinedCategories.map(cat => (
                      <Picker.Item
                        key={cat}
                        label={cat}
                        value={cat}
                        color="#333"
                      />
                    ))}
                    <Picker.Item
                      label="+ Add New Category"
                      value="add_new"
                      color="#8e44ad"
                    />
                  </Picker>
                </View>
              </View>
              {errors.category && (
                <Text style={styles.errorMsg}>{errors.category}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Service Name</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.serviceName && styles.inputError,
                ]}
              >
                <View style={styles.iconContainer}>
                  <Icon
                    name="pricetag-outline"
                    size={20}
                    color={primaryColor}
                  />
                </View>
                <TextInput
                  style={styles.textInput}
                  value={serviceName}
                  onChangeText={text => {
                    setServiceName(text);
                    if (errors.serviceName)
                      setErrors(prev => ({ ...prev, serviceName: null }));
                  }}
                  placeholder="Ex: Haircut"
                  placeholderTextColor="#999"
                />
              </View>
              {errors.serviceName && (
                <Text style={styles.errorMsg}>{errors.serviceName}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Price</Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.servicePrice && styles.inputError,
                ]}
              >
                <View style={styles.iconContainer}>
                  <FontAwesomeIcon
                    name="rupee"
                    size={20}
                    color={primaryColor}
                  />
                </View>
                <TextInput
                  style={styles.textInput}
                  value={servicePrice}
                  onChangeText={text => {
                    setServicePrice(text);
                    if (errors.servicePrice)
                      setErrors(prev => ({ ...prev, servicePrice: null }));
                  }}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor="#999"
                />
              </View>
              {errors.servicePrice && (
                <Text style={styles.errorMsg}>{errors.servicePrice}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Service Image</Text>
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
                    <Text style={styles.uploadSubText}>JPG, PNG up to 5MB</Text>
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
            onPress={handleSaveService}
            disabled={isLoading}
            activeOpacity={0.9}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>Save</Text>
                <Icon
                  name="arrow-forward"
                  size={20}
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
              Your service has been added successfully.
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

      <Modal
        transparent={true}
        visible={isCategoryModalVisible}
        animationType="slide"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>New Category</Text>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                <Icon name="close" size={24} color="#999" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.categoryInput}
              placeholder="Enter category name"
              value={customCategory}
              onChangeText={setCustomCategory}
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalBtnCancel}
                onPress={() => setCategoryModalVisible(false)}
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtnAdd}
                onPress={handleAddCustomCategory}
              >
                <Text style={styles.modalBtnAddText}>Add Category</Text>
              </TouchableOpacity>
            </View>
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
    marginBottom: 8,
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
  inputError: {
    borderColor: primaryColor,
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
  pickerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
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
    borderColor: primaryColor,
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
  categoryCard: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 16,
    padding: 24,
    elevation: 10,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  categoryInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 25,
    backgroundColor: '#FAFAFA',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalBtnCancel: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 10,
  },
  modalBtnCancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  modalBtnAdd: {
    backgroundColor: '#8e44ad',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  modalBtnAddText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddServicesScreen;
