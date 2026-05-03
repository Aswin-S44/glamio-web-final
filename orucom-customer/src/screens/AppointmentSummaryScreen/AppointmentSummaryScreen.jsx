import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Linking,
  Image,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRoute } from '@react-navigation/native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';

import { getDocumentFieldById, getParlourById } from '../../apis/services';
import { DEFAULT_AVATAR } from '../../constants/images';
import { formatDate } from '../../utils/utils';
import ProfileScreenSkeleton from '../../components/ProfileScreenSkeleton/ProfileScreenSkeleton';
import { primaryColor } from '../../constants/colors';
import LocationPrompt from '../../components/LocationPrompt/LocationPrompt';

const Row = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.text}>{label}</Text>
    <Text style={styles.valueText}>{value}</Text>
  </View>
);

const AppointmentSummaryScreen = ({ navigation }) => {
  const route = useRoute();
  const appointmentDetails = route?.params?.item;
  const shopId = route.params.item?.shopId;

  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(false);
  const [locationServicesEnabled, setLocationServicesEnabled] = useState(true);
  const mapRef = useRef(null);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = val => (val * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c).toFixed(1);
  };

  const handleOpenGoogleMaps = googleReviewUrl => {
    if (googleReviewUrl) {
      // Linking.openURL(googleReviewUrl).catch(err =>
      //   console.error("Couldn't load page", err),
      // );

      Linking.openURL(googleReviewUrl);
    }
  };

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        setLocationPermissionGranted(
          granted === PermissionsAndroid.RESULTS.GRANTED,
        );
      } else {
        setLocationPermissionGranted(true);
      }
    };
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (shopId) {
      const fetchShop = async () => {
        try {
          setLoading(true);
          const res = await getParlourById(shopId);
          if (res) {
            setShop(res);
          }
        } catch (error) {
          // Error while fetching shop
        } finally {
          setLoading(false);
        }
      };
      fetchShop();
    } else {
      setLoading(false);
    }
  }, [shopId]);

  const getStatusStyle = status => {
    switch (status) {
      case 'confirmed':
        return styles.statusConfirmed;
      case 'pending':
        return styles.statusPending;
      case 'cancelled':
        return styles.statusCancelled;
      default:
        return styles.statusDefault;
    }
  };

  const handleCall = phoneNumber => {
    if (phoneNumber && phoneNumber.trim() !== '') {
      Linking.openURL(`tel:${phoneNumber}`);
    } else {
      alert('Phone number not available');
    }
  };

  if (loading) {
    return <ProfileScreenSkeleton />;
  }

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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          <Text style={styles.mainTitle}>Appointment Summary</Text>

          <View style={styles.profileSection}>
            <Image
              source={{ uri: shop?.profileImage ?? DEFAULT_AVATAR }}
              style={styles.avatar}
            />
            <Text style={styles.expertName}>{shop?.parlourName ?? '-'}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Appointment Details</Text>
            <Row
              label="Date"
              value={
                appointmentDetails?.selectedDate
                  ? formatDate(appointmentDetails?.selectedDate)
                  : 'N/A'
              }
            />
            <Row
              label="Time"
              value={appointmentDetails?.selectedTime ?? 'N/A'}
            />
            <View style={styles.row}>
              <Text style={styles.text}>Status</Text>
              <Text
                style={[
                  styles.statusText,
                  getStatusStyle(appointmentDetails?.appointmentStatus),
                ]}
              >
                {appointmentDetails?.appointmentStatus
                  ? appointmentDetails?.appointmentStatus.toUpperCase()
                  : 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shop Details</Text>
            <Row label="Address" value={shop?.address ?? 'N/A'} />

            <View style={styles.row}>
              <Text style={styles.text}>Phone</Text>
              {shop?.phone?.trim() === '' || !shop?.phone ? (
                <Text style={styles.valueText}>Unavailable</Text>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    handleCall(shop?.phone.trim());
                  }}
                  style={styles.phoneButton}
                >
                  <Text style={styles.phoneText}>{shop?.phone ?? '-'}</Text>
                  <Icon name="call" size={20} color="green" />
                </TouchableOpacity>
              )}
            </View>

            <Row
              label="Email"
              value={
                shop?.email?.trim() === '' || !shop?.email ? 'N/A' : shop?.email
              }
            />
          </View>

          {shop?.googleReviewUrl && (
            <TouchableOpacity
              style={styles.visitUsButton}
              onPress={() => handleOpenGoogleMaps(shop.googleReviewUrl)}
            >
              <Text style={styles.visitUsButtonText}>View Location</Text>
              <Ionicons name="chevron-forward-outline" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
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
  },
  scrollViewContent: {
    paddingHorizontal: 25,
    paddingTop: 25,
    paddingBottom: 40,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  valueText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'normal',
    textAlign: 'right',
    flexShrink: 1,
    marginLeft: 10,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  expertName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: primaryColor,
  },
  statusText: {
    fontSize: 15,
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
    minWidth: 90,
    textAlign: 'center',
  },
  statusConfirmed: {
    backgroundColor: '#e6ffe6',
    color: '#008000',
  },
  statusPending: {
    backgroundColor: '#fffbe6',
    color: '#ffbf00',
  },
  statusCancelled: {
    backgroundColor: '#ffe6e6',
    color: '#cc0000',
  },
  statusDefault: {
    backgroundColor: '#f0f0f0',
    color: '#555',
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6ffe6',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  phoneText: {
    fontSize: 16,
    color: 'green',
    marginRight: 8,
    fontWeight: '600',
  },
  locationSection: {
    backgroundColor: '#ffff',
    borderRadius: 15,
    padding: 10,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  locationSectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: primaryColor,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#cfe2f3',
    paddingBottom: 10,
  },
  locationMessage: {
    fontSize: 15,
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  distanceText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  mapContainer: {
    height: 350,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  visitUsButton: {
    flexDirection: 'row',
    backgroundColor: primaryColor,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visitUsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 5,
  },
});

export default AppointmentSummaryScreen;
