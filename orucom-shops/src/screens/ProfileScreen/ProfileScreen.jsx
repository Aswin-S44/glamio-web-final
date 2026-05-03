import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Linking,
  Dimensions,
  Platform,
  Modal,
} from 'react-native';
import React, { useContext, useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { primaryColor } from '../../constants/colors';
import { AuthContext } from '../../context/AuthContext';
import { AVATAR_IMAGE } from '../../constants/images';

const { width, height } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const { userData } = useContext(AuthContext);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);

  const handleOpenGoogleReview = () => {
    if (userData?.googleReviewUrl) {
      Linking.openURL(userData?.googleReviewUrl).catch(err =>
        console.error('Failed to open URL:', err),
      );
    }
  };

  const profileImageUrl = userData?.profileImage ?? AVATAR_IMAGE;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={primaryColor} />

      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerWrapper}>
          <View style={styles.headerCurve}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>My Profile</Text>
              <TouchableOpacity
                style={styles.editHeaderBtn}
                onPress={() => navigation.navigate('EditProfileScreen')}
              >
                <Text style={styles.editHeaderText}>Edit Profile</Text>
                <FontAwesomeIcon
                  name="pencil"
                  size={14}
                  color="#fff"
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.profileContainer}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setIsImageModalVisible(true)}
              style={styles.imageWrapper}
            >
              <Image
                source={{ uri: profileImageUrl }}
                style={styles.profileImage}
              />
              <View style={styles.verifiedBadge}>
                <Icon name="checkmark" size={14} color="#fff" />
              </View>
            </TouchableOpacity>

            <Text style={styles.parlourName}>
              {userData?.parlourName || 'Parlour Name'}
            </Text>
            <View style={styles.locationTag}>
              <Icon name="location" size={14} color="#888" />
              <Text style={styles.locationText} numberOfLines={1}>
                {userData?.address
                  ? userData.address.split(',')[0]
                  : 'Location not set'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bodyContainer}>
          <View style={styles.contentCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
                <Icon name="information" size={20} color="#1E88E5" />
              </View>
              <Text style={styles.cardTitle}>About Us</Text>
            </View>
            <Text style={styles.bodyText}>
              {userData?.about?.trim()
                ? userData.about
                : 'Tell your customers about your services and expertise...'}
            </Text>
          </View>

          <View style={styles.contentCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
                <Icon name="time" size={20} color="#43A047" />
              </View>
              <Text style={styles.cardTitle}>Opening Schedule</Text>
            </View>

            <View style={styles.scheduleContainer}>
              {userData?.openingHours?.length > 0 ? (
                userData.openingHours.map((hour, index) => (
                  <View key={index} style={styles.scheduleRow}>
                    <Icon name="calendar-outline" size={16} color="#888" />
                    <Text style={styles.scheduleText}>{hour}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.placeholderText}>
                  Schedule not configured
                </Text>
              )}
            </View>
          </View>

          <View style={styles.contentCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: '#FFF3E0' }]}>
                <Icon name="map" size={20} color="#FB8C00" />
              </View>
              <Text style={styles.cardTitle}>Full Address</Text>
            </View>
            <Text style={styles.addressFullText}>
              {userData?.address || 'No address details provided.'}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleOpenGoogleReview}
            disabled={!userData?.googleReviewUrl}
          >
            <View
              style={[
                styles.reviewCard,
                !userData?.googleReviewUrl && styles.reviewCardDisabled,
              ]}
            >
              <View style={styles.reviewContent}>
                <Text style={styles.reviewTitle}>Google Reviews</Text>
                <Text style={styles.reviewSubtitle}>
                  {userData?.googleReviewUrl
                    ? 'Check out what your customers are saying on Google'
                    : 'Link your Google Business profile to see reviews here'}
                </Text>
              </View>
              <View style={styles.googleLogoCircle}>
                <FontAwesomeIcon name="google" size={24} color="#DB4437" />
              </View>
            </View>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      <Modal
        visible={isImageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsImageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setIsImageModalVisible(false)}
          >
            <Icon name="close" size={30} color="#fff" />
          </TouchableOpacity>
          <Image
            source={{ uri: profileImageUrl }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FC',
  },
  bgCircle1: {
    position: 'absolute',
    top: -100,
    left: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: primaryColor,
    opacity: 0.05,
  },
  bgCircle2: {
    position: 'absolute',
    top: 100,
    right: -100,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: primaryColor,
    opacity: 0.05,
  },
  headerWrapper: {
    marginBottom: 60,
  },
  headerCurve: {
    height: 180,
    backgroundColor: primaryColor,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    shadowColor: primaryColor,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    opacity: 0.9,
  },
  editHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  editHeaderText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  profileContainer: {
    alignItems: 'center',
    position: 'absolute',
    top: 110,
    left: 0,
    right: 0,
  },
  imageWrapper: {
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 5,
    borderColor: '#fff',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#4CAF50',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  parlourName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 40,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  bodyContainer: {
    paddingHorizontal: 20,
    marginTop: 55,
  },
  contentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
  },
  bodyText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
  },
  scheduleContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  scheduleText: {
    fontSize: 14,
    color: '#444',
    marginLeft: 10,
    fontWeight: '500',
  },
  placeholderText: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  addressFullText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  reviewCard: {
    backgroundColor: '#333',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  reviewCardDisabled: {
    backgroundColor: '#ccc',
  },
  reviewContent: {
    flex: 1,
    marginRight: 15,
  },
  reviewTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reviewSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  googleLogoCircle: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  fullImage: {
    width: width,
    height: height * 0.7,
  },
});

export default ProfileScreen;
