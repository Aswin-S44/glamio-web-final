import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Platform,
  Modal,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import React, { useEffect, useState, useContext } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import {
  markNotificationAsRead,
  confirmAppointment,
  rejectAppointment,
  getNotificationDetails,
} from '../../apis/services';
import { NO_IMAGE } from '../../constants/variables';
import { primaryColor } from '../../constants/colors';
import { AuthContext } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const NotificationDetailsScreen = ({ route, navigation }) => {
  const { notificationId } = route.params;
  const { user, userData } = useContext(AuthContext);

  const [acceptModalVisible, setAcceptModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [notificationDetails, setNotificationDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (notificationId) {
      const fetchNotification = async () => {
        setLoading(true);
        let res = await getNotificationDetails(notificationId);
        if (res) setNotificationDetails(res);
        setLoading(false);
      };
      fetchNotification();
    }
  }, [notificationId]);

  useEffect(() => {
    if (notificationId) {
      markNotificationAsRead(notificationId).catch(err => console.error(err));
    }
  }, [notificationId]);

  // --- Actions ---
  const handleAcceptAppointment = async () => {
    try {
      setConfirming(true);
      if (notificationDetails?.appointmentId && notificationDetails?.toId) {
        await confirmAppointment(
          notificationDetails.appointmentId,
          notificationDetails.toId,
          userData?.parlourName,
          userData?.profileImage,
        );
        setAcceptModalVisible(false);
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error confirming appointment:', error);
    } finally {
      setConfirming(false);
    }
  };

  const handleRejectAppointment = async () => {
    try {
      setCancelling(true);
      if (notificationDetails?.appointmentId && notificationDetails?.toId) {
        await rejectAppointment(
          notificationDetails.appointmentId,
          notificationDetails.toId,
        );
        setCancelModalVisible(false);
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error canceling appointment:', error);
    } finally {
      setCancelling(false);
    }
  };

  // --- Status Config ---
  const getStatusConfig = status => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return { bg: '#E8F5E9', color: '#2E7D32', icon: 'checkmark-circle' };
      case 'pending':
        return { bg: '#FFF3E0', color: '#EF6C00', icon: 'time' };
      case 'cancelled':
        return { bg: '#FFEBEE', color: '#C62828', icon: 'close-circle' };
      default:
        return { bg: '#F5F5F5', color: '#757575', icon: 'help-circle' };
    }
  };

  // --- Components ---
  const DetailRow = ({ icon, label, value }) => (
    <View style={styles.detailRow}>
      <View style={styles.detailIconBox}>
        <Icon name={icon} size={18} color="#666" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );

  const statusConfig = getStatusConfig(
    notificationDetails?.appointment?.appointmentStatus,
  );
  const isAppointmentRequest =
    notificationDetails?.notificationType === 'appointment_request';
  const isPending =
    notificationDetails?.appointment?.appointmentStatus === 'pending';

  if (loading || !notificationDetails) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={primaryColor} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Icon name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. SENDER PROFILE CARD */}
        <View style={styles.card}>
          <View style={styles.profileHeader}>
            <Image
              source={{
                uri: notificationDetails?.customer?.profileImage || NO_IMAGE,
              }}
              style={styles.avatar}
            />
            <View style={styles.profileText}>
              <Text style={styles.customerName}>
                {notificationDetails?.customer?.fullName || 'Unknown User'}
              </Text>
              <Text style={styles.notificationType}>
                {notificationDetails?.notificationType
                  ? notificationDetails.notificationType
                      .replace(/_/g, ' ')
                      .toUpperCase()
                  : 'NOTIFICATION'}
              </Text>
            </View>
          </View>

          <View style={styles.messageBox}>
            <Icon
              name="chatbubble-ellipses-outline"
              size={20}
              color="#888"
              style={styles.quoteIcon}
            />
            <Text style={styles.messageText}>
              {notificationDetails?.message || 'No message content.'}
            </Text>
          </View>
        </View>

        {/* 2. APPOINTMENT DETAILS (If Available) */}
        {notificationDetails?.appointment && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Appointment Info</Text>
            <View style={styles.card}>
              {/* Status Badge */}
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusConfig.bg },
                ]}
              >
                <Icon
                  name={statusConfig.icon}
                  size={16}
                  color={statusConfig.color}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[styles.statusText, { color: statusConfig.color }]}
                >
                  {notificationDetails.appointment.appointmentStatus?.toUpperCase() ||
                    'UNKNOWN'}
                </Text>
              </View>

              <View style={styles.divider} />

              <DetailRow
                icon="calendar-outline"
                label="Date"
                value={notificationDetails.appointment.selectedDate || 'N/A'}
              />
              <View style={{ height: 12 }} />
              <DetailRow
                icon="time-outline"
                label="Time"
                value={notificationDetails.appointment.selectedTime || 'N/A'}
              />
            </View>
          </View>
        )}

        {/* 3. SERVICES & PAYMENT */}
        {notificationDetails?.appointment?.services && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Services & Payment</Text>
            <View style={styles.card}>
              <View style={styles.tableHeader}>
                <Text style={[styles.thText, { flex: 2 }]}>Service</Text>
                <Text style={[styles.thText, { flex: 1, textAlign: 'center' }]}>
                  Qty
                </Text>
                <Text style={[styles.thText, { flex: 1, textAlign: 'right' }]}>
                  Price
                </Text>
              </View>

              {notificationDetails.appointment.services.map(
                (service, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={[styles.tdText, { flex: 2 }]}>
                      {service.serviceName}
                    </Text>
                    <Text
                      style={[styles.tdText, { flex: 1, textAlign: 'center' }]}
                    >
                      {service.qty || 1}
                    </Text>
                    <Text
                      style={[styles.tdPrice, { flex: 1, textAlign: 'right' }]}
                    >
                      ₹{service.servicePrice * (service.qty || 1)}
                    </Text>
                  </View>
                ),
              )}

              <View style={styles.divider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalValue}>
                  ₹{notificationDetails.appointment.totalAmount || 0}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 4. ACTION BUTTONS */}
        {isAppointmentRequest && isPending && (
          <View style={styles.footerActions}>
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={() => setCancelModalVisible(true)}
            >
              <Text style={styles.rejectBtnText}>Reject Request</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={() => setAcceptModalVisible(true)}
            >
              <Text style={styles.acceptBtnText}>Accept Request</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* --- MODALS --- */}

      {/* ACCEPT MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={acceptModalVisible}
        onRequestClose={() => setAcceptModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Icon name="calendar" size={32} color="#fff" />
            </View>
            <Text style={styles.modalTitle}>Confirm Appointment</Text>
            <Text style={styles.modalSubtitle}>
              Are you sure you want to accept this appointment for{' '}
              {notificationDetails?.appointment?.selectedDate} at{' '}
              {notificationDetails?.appointment?.selectedTime}?
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setAcceptModalVisible(false)}
                disabled={confirming}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleAcceptAppointment}
                disabled={confirming}
              >
                {confirming ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalConfirmText}>Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* REJECT MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={cancelModalVisible}
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View
              style={[
                styles.modalIconContainer,
                { backgroundColor: '#FFEBEE' },
              ]}
            >
              <Icon name="alert-circle" size={32} color="#D32F2F" />
            </View>
            <Text style={styles.modalTitle}>Reject Request</Text>
            <Text style={styles.modalSubtitle}>
              This action cannot be undone. The user will be notified that you
              are unable to take this appointment.
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setCancelModalVisible(false)}
                disabled={cancelling}
              >
                <Text style={styles.modalCancelText}>Go Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, { backgroundColor: '#D32F2F' }]}
                onPress={handleRejectAppointment}
                disabled={cancelling}
              >
                {cancelling ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalConfirmText}>Reject</Text>
                )}
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
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: primaryColor,
    height: Platform.OS === 'ios' ? 110 : 60,
    paddingTop: Platform.OS === 'ios' ? 50 : 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backBtn: {
    padding: 8,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // CARD STYLES
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  profileText: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  notificationType: {
    fontSize: 12,
    color: primaryColor,
    fontWeight: '700',
    marginTop: 2,
  },
  messageBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
  },
  quoteIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  messageText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    flex: 1,
    fontStyle: 'italic',
  },

  // SECTION STYLES
  sectionContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#888',
    marginBottom: 10,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 15,
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  // TABLE STYLES
  tableHeader: {
    flexDirection: 'row',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 8,
  },
  thText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '700',
  },
  tableRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tdText: {
    fontSize: 14,
    color: '#555',
  },
  tdPrice: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: primaryColor,
  },

  // FOOTER ACTIONS
  footerActions: {
    flexDirection: 'row',
    marginTop: 25,
    gap: 15,
  },
  rejectBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  rejectBtnText: {
    color: '#D32F2F',
    fontWeight: '600',
    fontSize: 16,
  },
  acceptBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: primaryColor,
    alignItems: 'center',
  },
  acceptBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },

  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalBtnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 15,
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: primaryColor,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default NotificationDetailsScreen;
