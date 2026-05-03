import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Calendar } from 'react-native-calendars';
import { lightPurple, primaryColor } from '../../constants/colors';
import BookingScreenSkeleton from '../../components/BookingScreenSkeleton/BookingScreenSkeleton';
import { NO_IMAGE } from '../../constants/images';
import moment from 'moment';
import api from '../../config/api';
import { AuthContext } from '../../context/AuthContext';

const BookingScreen = ({ route, navigation }) => {
  const { user, userData } = useContext(AuthContext);

  const [selectedExpert, setSelectedExpert] = useState(
    route?.params?.selectedExpertId ?? null,
  );
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedServices, setSelectedServices] = useState(null);
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState({});
  const [selectedDate, setSelectedDate] = useState(
    moment().format('YYYY-MM-DD'),
  );
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [expertsLoading, setExpertsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const formattedDate = selectedDate;
  const slotsForDate = slots[formattedDate] || [];

  const { shopId, serviceId, experts, service, offers } = route.params;

  useEffect(() => {
    if (!route.params?.shopId) return;

    setLoading(true);

    api.get(`/customer/slots/${route.params.shopId}`)
      .then(({ data }) => {
        const slotsData = {};
        (data.slots || []).forEach(slot => {
          const slotDate = slot.date;
          if (!slotsData[slotDate]) slotsData[slotDate] = [];
          slotsData[slotDate].push(slot);
        });
        setSlots(slotsData);
      })
      .catch(() => Alert.alert('Error', 'Failed to load slots'))
      .finally(() => setLoading(false));

    return () => {};
  }, [route]);

  useEffect(() => {
    if (service) {
      setSelectedServices([service]);
    }
  }, [route]);

  useEffect(() => {
    if (!selectedExpert) {
      setErrorMessage('Please select a beauty expert.');
    } else if (!selectedDate) {
      setErrorMessage('Please select a date.');
    } else if (!selectedTime) {
      setErrorMessage('Please select a time slot.');
    } else if (!selectedServices || selectedServices.length === 0) {
      setErrorMessage('Please select a service.');
    } else {
      setErrorMessage('');
    }
  }, [selectedExpert, selectedDate, selectedTime, selectedServices]);

  const onDayPress = day => {
    setSelectedDate(day.dateString);
    setSelectedTime(null);
  };

  const handleNext = () => {
    navigation.navigate('BookingSummaryScreen', {
      selectedDate: selectedDate,
      selectedTime: selectedTime,
      selectedServices: selectedServices,
      selectedExpert: experts.find(expert => expert.id === selectedExpert),
      shopId,
      offers: route.params.offers,
      selectedSlot,
    });
  };

  const markedDates = {
    [selectedDate]: {
      selected: true,
      disableTouchEvent: true,
      selectedColor: primaryColor,
      selectedTextColor: '#ffffff',
    },
  };

  Object.keys(slots).forEach(date => {
    const hasAvailableSlots = slots[date].some(slot => {
      const booked = slot.bookedCount || 0;
      const capacity = slot.maxCapacity || 1;
      return slot.isAvailable && booked < capacity;
    });

    if (hasAvailableSlots) {
      markedDates[date] = {
        ...(markedDates[date] || {}),
        marked: true,
        dotColor: primaryColor,
      };
    } else {
      markedDates[date] = {
        ...(markedDates[date] || {}),
        marked: true,
        dotColor: lightPurple,
      };
    }
  });

  if (loading) {
    return <BookingScreenSkeleton />;
  }

  const handleTimeSlotPress = slot => {
    const now = moment();
    const slotDateTime = moment(
      `${selectedDate} ${slot.startTime}`,
      'YYYY-MM-DD HH:mm',
    );

    if (moment(selectedDate).isSame(now, 'day') && slotDateTime.isBefore(now)) {
      Alert.alert('Invalid Time', 'Please choose an upcoming time slot.');
      return;
    }

    setSelectedTime(slot);
    setSelectedSlot(slot);
  };

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
          <Text style={styles.mainTitle}>Book Your Appointment</Text>
          {errorMessage ? (
            <View style={styles.errorMessageContainer}>
              <Ionicons name="alert-circle-outline" size={20} color="red" />
              <Text style={styles.errorMessageText}>{errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose Your Beauty Expert</Text>
            {expertsLoading && (
              <Text style={styles.loadingText}>Please wait....</Text>
            )}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.expertScroll}
            >
              {!loading && experts.length === 0 ? (
                <Text style={styles.noExpertsText}>No experts available</Text>
              ) : (
                experts.map(expert => (
                  <View key={expert.id} style={styles.expertItem}>
                    <TouchableOpacity
                      style={styles.expertCard}
                      onPress={() => {
                        setSelectedExpert(expert.id);
                      }}
                    >
                      <View style={styles.avatarContainer}>
                        <Image
                          source={{
                            uri:
                              typeof expert.imageUrl === 'string'
                                ? expert.imageUrl
                                : NO_IMAGE,
                          }}
                          style={styles.avatar}
                        />

                        {selectedExpert === expert.id && (
                          <View style={styles.avatarOverlay}>
                            <Ionicons
                              name="checkmark-circle"
                              size={28}
                              color="#fff"
                              style={styles.checkIcon}
                            />
                          </View>
                        )}
                      </View>
                      <Text style={styles.expertName}>
                        {expert.expertName ?? ''}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.viewDetailsButton}
                      onPress={() => {
                        navigation.navigate('BeautyExpertDetailsScreen', {
                          expertId: expert.id,
                        });
                      }}
                    >
                      <Ionicons name="eye" size={18} color={primaryColor} />
                      <Text style={styles.viewDetailsText}>View Details</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Date</Text>
            <Calendar
              onDayPress={onDayPress}
              markedDates={markedDates}
              theme={{
                selectedDayBackgroundColor: primaryColor,
                selectedDayTextColor: '#ffffff',
                todayTextColor: primaryColor,
                arrowColor: primaryColor,
                dotColor: primaryColor,
                textDayFontSize: 16,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 14,
                'stylesheet.calendar.header': {
                  week: {
                    marginTop: 5,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  },
                },
              }}
              minDate={moment().format('YYYY-MM-DD')}
              style={styles.calendar}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Select Time Slot</Text>
              <View style={styles.legendContainer}>
                <View
                  style={[styles.legendDot, { backgroundColor: primaryColor }]}
                />
                <Text style={styles.legendText}>Available</Text>
                <View
                  style={[styles.legendDot, { backgroundColor: lightPurple }]}
                />
                <Text style={styles.legendText}>Full/Booked</Text>
              </View>
            </View>
            <View style={styles.timeSlotsContainer}>
              {slotsForDate.length === 0 ? (
                <Text style={styles.noSlotsText}>
                  No slots available for this date
                </Text>
              ) : (
                slotsForDate.map(slot => {
                  const startTimeFormatted = moment(
                    slot.startTime,
                    'HH:mm',
                  ).format('h:mm A');
                  const endTimeFormatted = moment(slot.endTime, 'HH:mm').format(
                    'h:mm A',
                  );
                  const slotLabel = `${startTimeFormatted} - ${endTimeFormatted}`;

                  const booked = slot.bookedCount || 0;
                  const capacity = slot.maxCapacity || 1;
                  const isFull = booked >= capacity;
                  const isSelected = selectedTime?.id === slot.id;
                  const isDisabled = !slot.isAvailable || isFull;

                  const isPastTime =
                    moment(selectedDate).isSame(moment(), 'day') &&
                    moment(
                      `${selectedDate} ${slot.startTime}`,
                      'YYYY-MM-DD HH:mm',
                    ).isBefore(moment());

                  return (
                    <TouchableOpacity
                      key={slot.id}
                      onPress={() => handleTimeSlotPress(slot)}
                      disabled={isDisabled || isPastTime}
                      style={[
                        styles.timeSlot,
                        isSelected && styles.timeSlotSelected,
                        (isDisabled || isPastTime) && styles.timeSlotDisabled,
                        isDisabled && !isPastTime && styles.timeSlotUnavailable,
                      ]}
                    >
                      <Text
                        style={[
                          styles.timeSlotText,
                          isSelected && styles.timeSlotTextSelected,
                          (isDisabled || isPastTime) &&
                            styles.timeSlotTextDisabled,
                          isDisabled &&
                            !isPastTime &&
                            styles.timeSlotTextUnavailable,
                        ]}
                      >
                        {slotLabel}
                      </Text>
                      <Text
                        style={[
                          styles.capacityText,
                          isSelected && { color: '#fff' },
                          (isDisabled || isPastTime) && { color: '#999' },
                        ]}
                      >
                        {isFull ? 'Full' : `${capacity - booked} left`}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Amount</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableHeaderText,
                    { flex: 2 },
                  ]}
                >
                  Service
                </Text>
                <Text style={[styles.tableCell, styles.tableHeaderText]}>
                  Qty
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.tableHeaderText,
                    { textAlign: 'right' },
                  ]}
                >
                  Price
                </Text>
              </View>
              {selectedServices &&
                selectedServices.length > 0 &&
                selectedServices.map(service => (
                  <View key={service.id} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 2 }]}>
                      {service.serviceName}
                    </Text>
                    <Text style={styles.tableCell}>{service.qty ?? 1}</Text>
                    <Text style={[styles.tableCell, { textAlign: 'right' }]}>
                      {service.servicePrice}
                    </Text>
                  </View>
                ))}
            </View>
          </View>
        </ScrollView>
        <TouchableOpacity
          style={[
            styles.nextButton,
            (!selectedTime ||
              !selectedServices ||
              !selectedDate ||
              !selectedExpert) &&
              styles.disabledButton,
          ]}
          onPress={handleNext}
          disabled={
            !selectedTime ||
            !selectedServices ||
            !selectedDate ||
            !selectedExpert
          }
        >
          <Text style={styles.nextButtonText}>NEXT</Text>
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
    fontSize: 16,
    marginLeft: 5,
  },
  container: {
    flex: 1,
    marginTop: 90,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  scrollViewContent: {
    paddingBottom: 10,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 10,
  },
  errorMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffe0e0',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'red',
  },
  errorMessageText: {
    color: 'red',
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  loadingText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 8,
  },
  expertScroll: {
    paddingVertical: 8,
  },
  expertItem: {
    marginRight: 10,
    alignItems: 'center',
  },
  expertCard: {
    alignItems: 'center',
    padding: 5,
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 2,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 6,
    backgroundColor: '#e0e0e0',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#eee',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(142, 68, 173, 0.7)',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: primaryColor,
    borderRadius: 14,
  },
  expertName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    marginTop: 4,
  },
  noExpertsText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
    width: '100%',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  viewDetailsText: {
    fontSize: 11,
    color: primaryColor,
    marginLeft: 4,
  },
  calendar: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingBottom: 5,
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
    marginLeft: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#888',
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    backgroundColor: primaryColor,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  timeSlotSelected: {
    backgroundColor: '#CF0C98',
    borderColor: primaryColor,
  },
  timeSlotDisabled: {
    backgroundColor: lightPurple,
    borderColor: '#d0d0d0',
    opacity: 0.7,
  },
  timeSlotUnavailable: {
    backgroundColor: lightPurple,
    borderColor: lightPurple,
  },
  timeSlotText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  capacityText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    marginTop: 2,
  },
  timeSlotTextSelected: {
    color: '#fff',
  },
  timeSlotTextDisabled: {
    color: '#a0a0a0',
  },
  timeSlotTextUnavailable: {
    color: '#fff',
  },
  noSlotsText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
    width: '100%',
  },
  table: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f8f8f8',
  },
  tableCell: {
    flex: 1,
    fontSize: 13,
    color: '#555',
  },
  tableHeaderText: {
    fontWeight: '700',
    color: '#333',
  },
  nextButton: {
    backgroundColor: primaryColor,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BookingScreen;
