import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  Image,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { primaryColor } from '../../constants/colors';
import { AuthContext } from '../../context/AuthContext';
import {
  rejectAppointment,
  confirmAppointment,
  subscribeToUserPendingRequests,
} from '../../apis/services';
import { formatTimestamp } from '../../utils/utils';
import ServiceCardSkeleton from '../../components/ServiceCardSkeleton/ServiceCardSkeleton';
import EmptyComponent from '../../components/EmptyComponent/EmptyComponent';

const NO_IMAGE = 'https://via.placeholder.com/50';

const AppointmentRequestsScreen = ({ navigation }) => {
  const { user, userData } = useContext(AuthContext);
  const [acceptModalVisible, setAcceptModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [userRequests, setUserRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let unsubscribe;
    if (user && user.uid) {
      setLoading(true);
      unsubscribe = subscribeToUserPendingRequests(
        user.uid,
        newRequests => {
          setUserRequests(newRequests);
          setLoading(false);
        },
        error => {
          console.error('Error subscribing to user requests:', error);
          setUserRequests([]);
          setLoading(false);
        },
      );
    } else {
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const handleAcceptPress = item => {
    setSelectedRequest(item);
    setAcceptModalVisible(true);
  };

  const handleCancelPress = item => {
    setSelectedRequest(item);
    setCancelModalVisible(true);
  };

  const handleAcceptAppointment = async (appointmentId, shopId) => {
    try {
      setConfirming(true);
      await confirmAppointment(
        appointmentId,
        shopId,
        userData?.parlourName,
        userData?.profileImage,
      );
      setAcceptModalVisible(false);
    } catch (error) {
      console.error('Error confirming appointment:', error);
    } finally {
      setConfirming(false);
    }
  };

  const handleRejectAppointment = async (appointmentId, shopId) => {
    try {
      setCancelling(true);
      await rejectAppointment(appointmentId, shopId);
      setCancelModalVisible(false);
    } catch (error) {
      console.error('Error canceling appointment:', error);
    } finally {
      setCancelling(false);
    }
  };

  const RenderRequestItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('ServiceSummaryScreen', { item })}
    >
      <View style={styles.cardHeader}>
        <Image
          source={{
            uri:
              typeof item.expert?.imageUrl === 'string'
                ? item.expert.imageUrl
                : NO_IMAGE,
          }}
          style={styles.avatar}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.expertName}>
            {item.expert?.expertName ?? 'Unknown User'}
          </Text>
          <Text style={styles.timestamp}>
            Requested {formatTimestamp(item.createdAt)}
          </Text>
        </View>
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>₹{item.totalAmount}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color="#666"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.infoText}>{item.selectedDate}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons
            name="time-outline"
            size={16}
            color="#666"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.infoText}>{item.selectedTime}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity
          onPress={() => handleCancelPress(item)}
          style={styles.rejectBtn}
        >
          <Text style={styles.rejectBtnText}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleAcceptPress(item)}
          style={styles.acceptBtn}
        >
          <Text style={styles.acceptBtnText}>Accept Request</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderAcceptModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={acceptModalVisible}
      onRequestClose={() => setAcceptModalVisible(false)}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeaderBar}>
            <Text style={styles.modalTitle}>Confirm Appointment</Text>
            <TouchableOpacity onPress={() => setAcceptModalVisible(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.dateTimeBox}>
            <View style={styles.dateTimeItem}>
              <Text style={styles.dateTimeLabel}>Date</Text>
              <Text style={styles.dateTimeValue}>
                {selectedRequest?.selectedDate}
              </Text>
            </View>
            <View style={styles.verticalLine} />
            <View style={styles.dateTimeItem}>
              <Text style={styles.dateTimeLabel}>Time</Text>
              <Text style={styles.dateTimeValue}>
                {selectedRequest?.selectedTime}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionHeader}>Payment Breakdown</Text>

          <View style={styles.billContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeadText, { flex: 2 }]}>Service</Text>
              <Text
                style={[styles.tableHeadText, { flex: 1, textAlign: 'center' }]}
              >
                Qty
              </Text>
              <Text
                style={[styles.tableHeadText, { flex: 1, textAlign: 'right' }]}
              >
                Price
              </Text>
            </View>

            {selectedRequest?.services?.map((service, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCellText, { flex: 2 }]}>
                  {service.serviceName ?? 'Service'}
                </Text>
                <Text
                  style={[
                    styles.tableCellText,
                    { flex: 1, textAlign: 'center' },
                  ]}
                >
                  x{service?.qty ?? 1}
                </Text>
                <Text
                  style={[
                    styles.tableCellText,
                    { flex: 1, textAlign: 'right' },
                  ]}
                >
                  ₹{service?.servicePrice * (service?.qty ?? 1)}
                </Text>
              </View>
            ))}

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                ₹{selectedRequest?.totalAmount ?? 0}
              </Text>
            </View>

            {selectedRequest?.offerAvailable && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: '#4CAF50' }]}>
                  Offer Price Applied
                </Text>
                <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
                  ₹{selectedRequest?.offerPrice ?? 0}
                </Text>
              </View>
            )}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>
                ₹
                {selectedRequest?.offerPrice ??
                  selectedRequest?.totalAmount ??
                  0}
              </Text>
            </View>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.fullWidthAcceptBtn}
              onPress={() =>
                handleAcceptAppointment(
                  selectedRequest.id,
                  selectedRequest.shopId,
                )
              }
              disabled={confirming}
            >
              {confirming ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.fullWidthBtnText}>Confirm & Accept</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderCancelModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={cancelModalVisible}
      onRequestClose={() => setCancelModalVisible(false)}
    >
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalContainer, { padding: 25 }]}>
          <View style={styles.warningIconContainer}>
            <Ionicons name="alert-circle" size={40} color="#FF6B6B" />
          </View>
          <Text style={styles.warningTitle}>Reject Request?</Text>
          <Text style={styles.warningText}>
            Are you sure you want to reject this appointment request? This
            action cannot be undone.
          </Text>

          <View style={styles.warningActions}>
            <TouchableOpacity
              style={styles.cancelActionBtn}
              onPress={() => setCancelModalVisible(false)}
              disabled={cancelling}
            >
              <Text style={styles.cancelActionText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmRejectBtn}
              onPress={() =>
                handleRejectAppointment(
                  selectedRequest.id,
                  selectedRequest.shopId,
                )
              }
              disabled={cancelling}
            >
              {cancelling ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.confirmRejectText}>Yes, Reject</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={primaryColor} />
      <ImageBackground
        source={require('../../assets/images/home_bg-1.png')}
        style={styles.headerBackground}
        imageStyle={{ opacity: 0.2 }}
      >
        <View style={styles.overlay} />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>User Requests</Text>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={() => setLoading(true)}
          >
            <Ionicons name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      <View style={styles.contentContainer}>
        {loading && userRequests.length === 0 ? (
          <ServiceCardSkeleton />
        ) : userRequests.length === 0 ? (
          <EmptyComponent
            title="No Pending Requests"
            subtitle="New appointment requests will appear here"
          />
        ) : (
          <FlatList
            data={userRequests}
            renderItem={({ item }) => <RenderRequestItem item={item} />}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>

      {selectedRequest && renderAcceptModal()}
      {selectedRequest && renderCancelModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: primaryColor,
  },
  headerBackground: {
    height: 120,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: primaryColor,
    opacity: 0.9,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 0 : 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  refreshBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 12,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
    paddingHorizontal: 20,
    marginTop: -20,
  },
  // CARD STYLES
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#f0f0f0',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  expertName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  priceBadge: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  priceText: {
    color: '#2E7D32',
    fontWeight: '700',
    fontSize: 14,
  },
  cardBody: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  infoText: {
    color: '#555',
    fontSize: 14,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  rejectBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFEBEE',
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
  },
  rejectBtnText: {
    color: '#D32F2F',
    fontWeight: '600',
  },
  acceptBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: primaryColor,
    alignItems: 'center',
  },
  acceptBtnText: {
    color: '#fff',
    fontWeight: '600',
  },

  // MODAL STYLES
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  dateTimeBox: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  dateTimeItem: {
    flex: 1,
    alignItems: 'center',
  },
  verticalLine: {
    width: 1,
    height: '100%',
    backgroundColor: '#E0E0E0',
  },
  dateTimeLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  dateTimeValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '700',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  billContainer: {
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 8,
  },
  tableHeadText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  tableRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tableCellText: {
    fontSize: 14,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: primaryColor,
  },
  modalFooter: {
    marginTop: 5,
  },
  fullWidthAcceptBtn: {
    backgroundColor: primaryColor,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  fullWidthBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Warning Modal
  warningIconContainer: {
    alignSelf: 'center',
    backgroundColor: '#FFEBEE',
    padding: 15,
    borderRadius: 40,
    marginBottom: 15,
  },
  warningTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  warningText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 25,
  },
  warningActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelActionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  cancelActionText: {
    color: '#666',
    fontWeight: '600',
  },
  confirmRejectBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#D32F2F',
    alignItems: 'center',
  },
  confirmRejectText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default AppointmentRequestsScreen;
