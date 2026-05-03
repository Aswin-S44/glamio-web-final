import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { primaryColor } from '../../constants/colors';
import {
  APPOINTMENT_STATUSES,
  APPOINTMENT_TYPES,
} from '../../constants/variables';
import { AuthContext } from '../../context/AuthContext';
import {
  createAppointment,
  createNotification,
  sendAppointmentNofification,
  sendAppointmentNotification,
  updateSlotInFirestore,
} from '../../apis/services';
import { DEFAULT_AVATAR } from '../../constants/images';
import firestore, {
  doc,
  getDoc,
  getFirestore,
  updateDoc,
} from '@react-native-firebase/firestore';

const Row = ({ icon, label, value }) => (
  <View style={styles.row}>
    <View style={styles.rowLabelContainer}>
      {icon && (
        <Ionicons name={icon} size={18} color="#777" style={styles.rowIcon} />
      )}
      <Text style={styles.text}>{label}</Text>
    </View>
    <Text style={styles.textValue}>{value}</Text>
  </View>
);

const AmountRow = ({ service, qty, price, isBold = false }) => (
  <View style={styles.amountRow}>
    <Text style={[styles.amountCell, { flex: 2 }, isBold && styles.boldText]}>
      {service}
    </Text>
    <Text style={[styles.amountCell, isBold && styles.boldText]}>{qty}</Text>
    <View
      style={[
        styles.amountCell,
        {
          flexDirection: 'row',
          justifyContent: 'flex-end',
          alignItems: 'center',
        },
      ]}
    >
      <Text style={[styles.currencyIcon, isBold && styles.boldText]}>₹</Text>
      <Text style={[styles.amountText, isBold && styles.boldText]}>
        {price}
      </Text>
    </View>
  </View>
);

const BookingSummaryScreen = ({ route, navigation }) => {
  const { userId, userData } = useContext(AuthContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(true);

  useEffect(() => {
    if (route.params) {
      const fetchData = async () => {
        setLoadingSummary(true);
        const {
          selectedDate,
          selectedTime,
          selectedServices,
          selectedExpert,
          offers,
        } = route.params;

        const [year, month, day] = selectedDate.split('-');
        const formattedDate = `${day}-${month}-${year}`;
        setSelectedDate(formattedDate);

        const formatTime = time => {
          const [hours, minutes] = time.split(':');
          const hour = parseInt(hours, 10);
          const ampm = hour >= 12 ? 'pm' : 'am';
          const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
          return `${formattedHour}${ampm}`;
        };

        const formattedStartTime = formatTime(selectedTime.startTime);
        const formattedEndTime = formatTime(selectedTime.endTime);
        setSelectedTime(`${formattedStartTime} - ${formattedEndTime}`);

        const updatedServices = await Promise.all(
          selectedServices.map(async service => {
            if (
              offers &&
              offers.length > 0 &&
              offers[0].offerPrice !== undefined
            ) {
              return { ...service, offerPrice: offers[0].offerPrice };
            }
            return { ...service, offerPrice: 0 };
          }),
        );
        setSelectedServices(updatedServices);

        setSelectedExpert(selectedExpert.id);
        setSelectedSlot(selectedTime);

        const calculatedSubtotal = updatedServices.reduce(
          (sum, service) => sum + (service.offerPrice || service.servicePrice),
          0,
        );
        setSubtotal(calculatedSubtotal);
        setLoadingSummary(false);
      };
      fetchData();
    }
  }, [route.params]);

  const total = subtotal;

  const handleConfirmBooking = async () => {
    if (!userId) return;
    setConfirming(true);

    const serviceIds = selectedServices.map(s => s.id);
    const bookingData = {
      serviceIds,
      selectedDate,
      selectedTime,
      appointmentStatus: APPOINTMENT_STATUSES.PENDING,
      customerId: userId,
      totalAmount: subtotal,
      shopId: route.params.shopId,
      expertId: selectedExpert,
    };

    try {
      // const appointmentRes = await createAppointment(userId, bookingData);
      // const appointmentRes = firestore().collection('appointments').doc();
      // await appointmentRes.set({
      //   ...bookingData,
      //   userId,
      //   createdAt: new Date(),
      // });
      // setModalVisible(true);
      // updateSlotInFirestore(selectedSlot.id, { isAvailable: false });
      // await createNotification(
      //   userId,
      //   route.params.shopId,
      //   appointmentRes.id ?? null,
      //   userData?.fullName ?? '',
      //   userData?.profileImage ?? DEFAULT_AVATAR,
      // );
      // sendAppointmentNotification(
      //   userId,
      //   route.params.shopId,
      //   APPOINTMENT_TYPES.BOOKING_REQUEST_SENT,
      //   appointmentRes.id ?? null,
      // );
    } catch (error) {
      // Error creating appointment
    } finally {
      setConfirming(false);
    }
  };

  // const handleConfirmBooking = async () => {
  //   if (!userId) return;
  //   setConfirming(true);

  //   const serviceIds = selectedServices.map(s => s.id);
  //   const bookingData = {
  //     serviceIds,
  //     selectedDate,
  //     selectedTime,
  //     appointmentStatus: APPOINTMENT_STATUSES.PENDING,
  //     customerId: userId,
  //     totalAmount: subtotal,
  //     shopId: route.params.shopId,
  //     expertId: selectedExpert,
  //   };

  //   try {
  //     const appointmentRes = await createAppointment(userId, bookingData);

  //     setModalVisible(true);

  //     updateSlotInFirestore(selectedSlot.id, { isAvailable: false });
  //     createNotification(
  //       userId,
  //       route.params.shopId,
  //       appointmentRes.id ?? null,
  //       userData?.fullName ?? '',
  //       userData?.profileImage ?? DEFAULT_AVATAR,
  //     );
  //     sendAppointmentNotification(
  //       userId,
  //       route.params.shopId,
  //       APPOINTMENT_TYPES.BOOKING_REQUEST_SENT,
  //       appointmentRes.id ?? null,
  //     );
  //   } catch (error) {
  //     console.error('Error creating appointment:', error);
  //   } finally {
  //     setConfirming(false);
  //   }
  // };

  const handleModalClose = () => {
    setModalVisible(false);
    navigation.navigate('Appointment', { newAppointment: true });
  };

  return (
    <View style={styles.outerContainer}>
      <StatusBar backgroundColor={primaryColor} barStyle="light-content" />

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark" size={36} color="#fff" />
            </View>
            <Text style={styles.modalText}>
              Successfully sent your request. Waiting for confirmation.
            </Text>
            <TouchableOpacity
              style={styles.okButton}
              onPress={handleModalClose}
            >
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        disabled={confirming}
      >
        <Ionicons name="chevron-back" size={24} color="#fff" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.container}>
        {loadingSummary ? (
          <View style={styles.summaryLoadingContainer}>
            <ActivityIndicator size="large" color={primaryColor} />
            <Text style={styles.summaryLoadingText}>Loading summary...</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.mainTitle}>Booking Summary</Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Appointment Details</Text>
              <Row icon="calendar-outline" label="Date" value={selectedDate} />
              <Row icon="time-outline" label="Time" value={selectedTime} />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amount</Text>
              <View style={styles.amountHeader}>
                <Text style={[styles.amountCell, styles.boldText, { flex: 2 }]}>
                  Service
                </Text>
                <Text style={[styles.amountCell, styles.boldText]}>Qty</Text>
                <Text
                  style={[
                    styles.amountCell,
                    styles.boldText,
                    { textAlign: 'right' },
                  ]}
                >
                  Price
                </Text>
              </View>
              {selectedServices.map((service, index) => (
                <AmountRow
                  key={index}
                  service={service.serviceName}
                  qty="01"
                  price={`${service.offerPrice || service.servicePrice}`}
                />
              ))}

              <View style={styles.separator} />

              <AmountRow service="Subtotal" qty="" price={`${subtotal}`} />

              <View style={styles.separator} />

              <AmountRow
                service="Total"
                qty=""
                price={`${total}`}
                isBold={true}
              />
            </View>
          </ScrollView>
        )}
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (confirming || loadingSummary) && styles.disabledButton,
          ]}
          onPress={handleConfirmBooking}
          disabled={confirming || loadingSummary}
        >
          {confirming ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm Booking</Text>
          )}
        </TouchableOpacity>
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
    fontWeight: '500',
  },
  container: {
    flex: 1,
    marginTop: 100,
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 25,
    paddingTop: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginVertical: 25,
  },
  section: {
    marginBottom: 25,
    paddingHorizontal: 5, // Keep a small horizontal padding for content alignment
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '500',
    color: '#333',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  rowLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    marginRight: 10,
  },
  text: {
    fontSize: 17,
    color: '#555',
    fontWeight: '400',
  },
  textValue: {
    fontSize: 17,
    color: '#333',
    fontWeight: '500',
  },
  amountHeader: {
    flexDirection: 'row',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 10,
    backgroundColor: '#f8f8f8', // Slightly lighter background for header
    paddingVertical: 10,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  amountRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  amountCell: {
    flex: 1,
    fontSize: 16,
    color: '#555',
  },
  currencyIcon: {
    fontSize: 16,
    color: '#555',
    marginRight: 2,
  },
  amountText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'right',
  },
  boldText: {
    fontWeight: '500',
    color: '#333',
    fontSize: 17,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15,
  },
  confirmButton: {
    backgroundColor: primaryColor,
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginVertical: 20,
    shadowColor: primaryColor,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#b0b0b0',
    shadowOpacity: 0,
    elevation: 0,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '85%',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  successIconContainer: {
    backgroundColor: primaryColor,
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 35,
    marginBottom: 15,
  },
  modalText: {
    fontSize: 19,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 25,
    lineHeight: 28,
  },
  okButton: {
    backgroundColor: '#333',
    width: '100%',
    padding: 20,
    alignItems: 'center',
  },
  okButtonText: {
    color: 'white',
    fontSize: 19,
    fontWeight: '500',
  },
  summaryLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryLoadingText: {
    marginTop: 15,
    fontSize: 19,
    color: '#555',
    fontWeight: '500',
  },
});

export default BookingSummaryScreen;
