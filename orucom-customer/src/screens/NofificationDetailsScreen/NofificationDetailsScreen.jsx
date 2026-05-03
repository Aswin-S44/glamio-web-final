import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Platform,
} from 'react-native';
import React, { useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import { markNotificationAsRead } from '../../apis/services';
import { DEFAULT_AVATAR } from '../../constants/images';

const NofificationDetailsScreen = ({ route, navigation }) => {
  const { notification } = route.params;

  useEffect(() => {
    if (notification && notification.id) {
      const updateNotification = async () => {
        await markNotificationAsRead(notification.id);
      };
      updateNotification();
    }
  }, [notification]);

  const formatDate = (seconds, nanoseconds) => {
    if (seconds === undefined || nanoseconds === undefined) {
      return 'N/A';
    }
    return moment
      .unix(seconds + nanoseconds / 1_000_000_000)
      .format('MMMM Do YYYY, h:mm a');
  };

  const getProfileImageSource = profileImage => {
    if (profileImage && profileImage.startsWith('data:image')) {
      return { uri: profileImage };
    }
    return DEFAULT_AVATAR;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/home_bg-1.png')}
          style={styles.headerImage}
        />
        <View style={styles.overlay} />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color="#fff" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.contentContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Notification Details</Text>

          <View style={styles.card}>
            <Image
              source={{
                uri: notification?.shop?.profileImage || DEFAULT_AVATAR,
              }}
              style={styles.profileImage}
            />
            <Text style={styles.customerName}>
              {notification.shop?.parlourName || 'N/A'}
            </Text>
            <Text style={styles.notificationMessage}>
              "{notification.message || 'No message provided.'}"
            </Text>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Notification Type:</Text>
              <Text style={styles.value}>
                {notification.notificationType
                  ? notification.notificationType
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, char => char.toUpperCase())
                  : 'N/A'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Status:</Text>
              <Text
                style={[
                  styles.value,
                  notification.isRead ? styles.read : styles.unread,
                ]}
              >
                {notification.isRead ? 'Read' : 'Unread'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Received On:</Text>
              <Text style={styles.value}>
                {formatDate(
                  notification.createdAt?._seconds,
                  notification.createdAt?._nanoseconds,
                )}
              </Text>
            </View>
{/* 
            {notification.shop && (
              <View style={styles.customerInfo}>
                <Text style={styles.customerInfoTitle}>Shop Details</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Address:</Text>
                  <Text style={styles.value}>
                    {notification.shop.address || 'N/A'}
                  </Text>
                </View>
              </View>
            )} */}

            {notification.appointment && (
              <View style={styles.customerInfo}>
                <Text style={styles.customerInfoTitle}>
                  Appointment Details
                </Text>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Status:</Text>
                  <Text style={styles.value}>
                    {notification.appointment.appointmentStatus
                      ? notification.appointment.appointmentStatus.replace(
                          /\b\w/g,
                          char => char.toUpperCase(),
                        )
                      : 'N/A'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Date:</Text>
                  <Text style={styles.value}>
                    {notification.appointment.selectedDate || 'N/A'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Time:</Text>
                  <Text style={styles.value}>
                    {notification.appointment.selectedTime || 'N/A'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Total Amount:</Text>
                  <Text style={styles.value}>
                    ₹{notification.appointment.totalAmount || '0'}
                  </Text>
                </View>
              </View>
            )}

            {notification.services && notification.services.length > 0 && (
              <View style={styles.customerInfo}>
                <Text style={styles.customerInfoTitle}>Services Booked</Text>
                {notification.services.map((service, index) => (
                  <View key={service.id || index} style={styles.serviceItem}>
                    <Text style={styles.serviceName}>
                      {service.serviceName || 'N/A'}
                    </Text>
                    <Text style={styles.servicePrice}>
                      ₹{service.servicePrice || '0'}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    height: Platform.OS === 'ios' ? 120 : 100,
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
  },
  headerImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(128, 0, 128, 0.6)',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 15,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 5,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingTop: 10,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // elevation: 5,
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#800080',
  },
  customerName: {
    fontSize: 20,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
  },
  notificationMessage: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
    fontStyle: 'italic',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
    flex: 1,
  },
  value: {
    fontSize: 15,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  read: {
    color: 'green',
    fontWeight: '500',
  },
  unread: {
    color: 'orange',
    fontWeight: '500',
  },
  customerInfo: {
    marginTop: 25,
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
    alignItems: 'flex-start',
  },
  customerInfoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#800080',
    marginBottom: 15,
    alignSelf: 'center',
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  serviceName: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#800080',
    textAlign: 'right',
  },
});

export default NofificationDetailsScreen;
