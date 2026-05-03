import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  SafeAreaView,
  Platform,
  StatusBar,
  Switch,
  Dimensions,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AuthContext } from '../../context/AuthContext';
import { primaryColor } from '../../constants/colors';
import SlotsSkeleton from '../../components/SlotsSkeleton/SlotsSkeleton';
import api from '../../config/api';

const { width } = Dimensions.get('window');

const SlotsManagementScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [selectedDate, setSelectedDate] = useState(
    moment().format('YYYY-MM-DD'),
  );
  const [slots, setSlots] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [isBooked, setIsBooked] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [repeatSlotsDaily, setRepeatSlotsDaily] = useState(false);
  const [holidays, setHolidays] = useState({});
  const [repeatUntilDate, setRepeatUntilDate] = useState('');
  const [repeatUntilModalVisible, setRepeatUntilModalVisible] = useState(false);
  const [maxCapacity, setMaxCapacity] = useState(1);

  const fetchSlots = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await api.get('/slots');
      const slotsData = {};
      (data.slots || []).forEach(slot => {
        if (!slotsData[slot.date]) slotsData[slot.date] = [];
        slotsData[slot.date].push(slot);
      });
      setSlots(slotsData);

      const expertsRes = await api.get('/expert');
      setMaxCapacity((expertsRes.data.experts || []).length || 1);
    } catch {
      Alert.alert('Error', 'Failed to load slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [user]);

  const onDayPress = day => {
    setSelectedDate(day.dateString);
  };

  const addSlotToFirestore = async slotData => {
    await api.post('/slots', slotData);
    await fetchSlots();
    return { success: true };
  };

  const updateSlotInFirestore = async (slotId, slotData) => {
    await api.patch(`/slots/${slotId}`, slotData);
    await fetchSlots();
    return { success: true };
  };

  const deleteSlotFromFirestore = async slotId => {
    await api.delete(`/slots/${slotId}`);
    await fetchSlots();
    return { success: true };
  };

  const addHolidayToFirestore = async date => {
    setHolidays(prev => ({ ...prev, [date]: true }));
    return { success: true };
  };

  const deleteHolidayFromFirestore = async date => {
    setHolidays(prev => { const next = { ...prev }; delete next[date]; return next; });
    return { success: true };
  };

  const handleAddOrUpdateSlot = async () => {
    const startMoment = moment(startTime);
    const endMoment = moment(endTime);

    if (endMoment.isSameOrBefore(startMoment)) {
      Alert.alert('Invalid Time', 'End time must be after start time.');
      return;
    }

    const newStartTimeFormatted = startMoment.format('HH:mm');
    const newEndTimeFormatted = endMoment.format('HH:mm');

    const currentSlotsForDate = slots[selectedDate] || [];

    const isDuplicate = currentSlotsForDate.some(
      slot =>
        slot.startTime === newStartTimeFormatted &&
        slot.endTime === newEndTimeFormatted &&
        (!editingSlot || slot.id !== editingSlot.id),
    );

    if (isDuplicate) {
      Alert.alert(
        'Slot Exists',
        `A slot with the time ${newStartTimeFormatted} - ${newEndTimeFormatted} already exists for this date.`,
      );
      return;
    }

    const baseSlotData = {
      startTime: newStartTimeFormatted,
      endTime: newEndTimeFormatted,
      maxCapacity: maxCapacity,
      bookedCount: editingSlot
        ? editingSlot.bookedCount || 0
        : isBooked
        ? maxCapacity
        : 0,
      isAvailable: isBooked
        ? false
        : editingSlot
        ? (editingSlot.bookedCount || 0) < maxCapacity
        : true,
      isRecurring: editingSlot ? editingSlot.isRecurring : false,
    };

    try {
      if (editingSlot) {
        await updateSlotInFirestore(editingSlot.id, {
          ...baseSlotData,
          date: editingSlot.date,
        });
      } else {
        await addSlotToFirestore({ ...baseSlotData, date: selectedDate });
      }

      setModalVisible(false);
      setEditingSlot(null);
      setStartTime(new Date());
      setEndTime(new Date(new Date().setHours(new Date().getHours() + 1)));
      setIsBooked(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save slot. Please try again.');
    }
  };

  const openAddSlotModal = () => {
    setEditingSlot(null);
    setStartTime(new Date());
    setEndTime(new Date(new Date().setHours(new Date().getHours() + 1)));
    setIsBooked(false);
    setModalVisible(true);
  };

  const openEditSlotModal = slot => {
    setEditingSlot(slot);
    setStartTime(moment(slot.startTime, 'HH:mm').toDate());
    setEndTime(moment(slot.endTime, 'HH:mm').toDate());
    setIsBooked(!slot.isAvailable);
    setModalVisible(true);
  };

  const handleDeleteSlot = async slotId => {
    Alert.alert(
      'Delete Slot',
      'Are you sure you want to remove this slot?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteSlotFromFirestore(slotId);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete slot. Please try again.');
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true },
    );
  };

  const handleToggleHoliday = async () => {
    if (holidays[selectedDate]) {
      Alert.alert(
        'Remove Holiday',
        `Are you sure you want to remove the holiday status for ${moment(
          selectedDate,
        ).format('MMMM Do, YYYY')}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            onPress: async () => {
              try {
                await deleteHolidayFromFirestore(selectedDate);
              } catch (error) {
                Alert.alert(
                  'Error',
                  'Failed to remove holiday. Please try again.',
                );
              }
            },
            style: 'destructive',
          },
        ],
      );
    } else {
      Alert.alert(
        'Add Holiday',
        `Are you sure you want to mark ${moment(selectedDate).format(
          'MMMM Do, YYYY',
        )} as a holiday? All existing slots for this day will be considered unavailable.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Add',
            onPress: async () => {
              try {
                await addHolidayToFirestore(selectedDate);
              } catch (error) {
                Alert.alert(
                  'Error',
                  'Failed to add holiday. Please try again.',
                );
              }
            },
            style: 'default',
          },
        ],
      );
    }
  };

  const handleRepeatSlotsDailyToggle = async value => {
    setRepeatSlotsDaily(value);
    if (value) {
      setRepeatUntilModalVisible(true);
    } else {
      Alert.alert(
        'Stop Repeating Slots',
        'Turning off daily repeat will not remove previously repeated slots. You will need to delete them manually if no longer needed.',
        [{ text: 'Ok', style: 'default' }],
      );
    }
  };

  const handleRepeatSlotsConfirm = async () => {
    setRepeatUntilModalVisible(false);

    if (!repeatUntilDate || !moment(repeatUntilDate, 'YYYY-MM-DD').isValid()) {
      Alert.alert('Invalid Date', 'Please select a valid repeat until date.');
      setRepeatSlotsDaily(false);
      return;
    }

    const confirmation = await new Promise(resolve =>
      Alert.alert(
        'Repeat Slots Daily',
        `All slots configured for ${moment(selectedDate).format(
          'MMMM Do, YYYY',
        )} will be copied to every day from ${moment(selectedDate)
          .add(1, 'day')
          .format('MMMM Do, YYYY')} until ${moment(repeatUntilDate).format(
          'MMMM Do, YYYY',
        )}. Do you want to proceed?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              setRepeatSlotsDaily(false);
              resolve(false);
            },
          },
          { text: 'Confirm', onPress: () => resolve(true) },
        ],
        { cancelable: false },
      ),
    );
    if (!confirmation) return;

    const currentDaySlots = slots[selectedDate] || [];
    if (currentDaySlots.length === 0) {
      Alert.alert('No Slots', 'There are no slots to repeat for this day.');
      setRepeatSlotsDaily(false);
      return;
    }

    try {
      let currentDate = moment(selectedDate).add(1, 'day');
      const untilDate = moment(repeatUntilDate);
      const promises = [];

      while (currentDate.isSameOrBefore(untilDate, 'day')) {
        const dateString = currentDate.format('YYYY-MM-DD');
        if (!holidays[dateString]) {
          const existingSlotsForDate = slots[dateString] || [];
          currentDaySlots.forEach(slot => {
            const isDuplicate = existingSlotsForDate.some(
              existingSlot =>
                existingSlot.startTime === slot.startTime &&
                existingSlot.endTime === slot.endTime,
            );
            if (!isDuplicate) {
              promises.push(api.post('/slots', {
                startTime: slot.startTime,
                endTime: slot.endTime,
                maxCapacity,
                bookedCount: 0,
                isAvailable: slot.isAvailable,
                isRecurring: true,
                date: dateString,
              }));
            }
          });
        }
        currentDate.add(1, 'day');
      }
      await Promise.all(promises);
      await fetchSlots();
      Alert.alert('Success', 'Slots have been repeated daily.');
    } catch (error) {
      console.error('Error repeating slots daily:', error);
      Alert.alert('Error', 'Failed to repeat slots daily. Please try again.');
      setRepeatSlotsDaily(false);
    }
  };

  const onStartTimeChange = (event, selectedTime) => {
    setShowStartTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setStartTime(selectedTime);
    }
  };

  const onEndTimeChange = (event, selectedTime) => {
    setShowEndTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setEndTime(selectedTime);
    }
  };

  const renderSlotItem = ({ item }) => {
    const isHoliday = holidays[selectedDate];
    const capacity = item.maxCapacity || 1;
    const booked = item.bookedCount || 0;
    const availabilityRemaining = capacity - booked;
    const isSlotFull = availabilityRemaining <= 0;

    const statusText = isHoliday
      ? 'Holiday'
      : !item.isAvailable
      ? 'Booked'
      : isSlotFull
      ? 'Fully Booked'
      : `Available`;

    const statusColor = isHoliday
      ? '#FF9800'
      : !item.isAvailable || isSlotFull
      ? '#F44336'
      : '#4CAF50';
    const cardBg = isHoliday ? '#FFF3E0' : '#FFFFFF';

    return (
      <View style={[styles.slotCard, { backgroundColor: cardBg }]}>
        <View style={[styles.statusStrip, { backgroundColor: statusColor }]} />

        <View style={styles.slotContent}>
          <View>
            <Text style={styles.slotTimeText}>
              {moment(item.startTime, 'HH:mm').format('h:mm A')} -{' '}
              {moment(item.endTime, 'HH:mm').format('h:mm A')}
            </Text>
            <View style={styles.statusChipContainer}>
              <View
                style={[styles.statusDot, { backgroundColor: statusColor }]}
              />
              <Text style={[styles.statusLabel, { color: statusColor }]}>
                {statusText}
              </Text>
            </View>
          </View>

          {!isHoliday && (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                onPress={() => openEditSlotModal(item)}
                style={[styles.iconButton, styles.editBtn]}
              >
                <Icon name="pencil" size={18} color={primaryColor} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDeleteSlot(item.id)}
                style={[styles.iconButton, styles.deleteBtn]}
              >
                <Icon name="trash-can-outline" size={18} color="#FF5252" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  const markedDates = {};
  Object.keys(slots).forEach(date => {
    markedDates[date] = { marked: true, dotColor: primaryColor };
  });
  Object.keys(holidays).forEach(date => {
    markedDates[date] = {
      ...(markedDates[date] || {}),
      marked: true,
      dotColor: '#FF9800',
      customStyles: {
        container: {
          backgroundColor: '#FFF3E0',
          borderWidth: 1,
          borderColor: '#FFE0B2',
        },
        text: {
          color: '#EF6C00',
        },
      },
    };
  });
  markedDates[selectedDate] = {
    ...(markedDates[selectedDate] || {}),
    selected: true,
    selectedColor: primaryColor,
    selectedTextColor: '#FFFFFF',
    customStyles: {
      container: {
        backgroundColor: primaryColor,
        elevation: 4,
      },
      text: {
        color: '#FFFFFF',
        fontWeight: 'bold',
      },
    },
  };

  const isSelectedDateHoliday = holidays[selectedDate];

  const ListHeaderComponent = () => (
    <View style={styles.headerContainer}>
      <View style={styles.topSpacing} />
      <View style={styles.calendarCard}>
        <Calendar
          onDayPress={onDayPress}
          markedDates={markedDates}
          markingType={'custom'}
          enableSwipeMonths={true}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#B0BEC5',
            selectedDayBackgroundColor: primaryColor,
            selectedDayTextColor: '#ffffff',
            todayTextColor: primaryColor,
            dayTextColor: '#263238',
            textDisabledColor: '#ECEFF1',
            dotColor: primaryColor,
            selectedDotColor: '#ffffff',
            arrowColor: primaryColor,
            monthTextColor: '#263238',
            indicatorColor: primaryColor,
            textDayFontWeight: '500',
            textMonthFontWeight: '700',
            textDayHeaderFontWeight: '600',
            textDayFontSize: 15,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 13,
          }}
        />
      </View>

      <View style={styles.controlGrid}>
        <View
          style={[
            styles.controlBox,
            isSelectedDateHoliday && styles.controlBoxActiveHoliday,
          ]}
        >
          <View style={styles.controlHeader}>
            <Icon
              name={isSelectedDateHoliday ? 'beach' : 'calendar-check'}
              size={24}
              color={isSelectedDateHoliday ? '#F57C00' : '#78909C'}
            />
            <Switch
              trackColor={{ false: '#ECEFF1', true: '#FFE0B2' }}
              thumbColor={isSelectedDateHoliday ? '#F57C00' : '#B0BEC5'}
              onValueChange={handleToggleHoliday}
              value={isSelectedDateHoliday}
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
          </View>
          <Text style={styles.controlLabel}>Holiday Mode</Text>
          <Text style={styles.controlSubLabel}>
            {isSelectedDateHoliday ? 'Bookings Paused' : 'Accepting Clients'}
          </Text>
        </View>

        <View
          style={[
            styles.controlBox,
            repeatSlotsDaily && styles.controlBoxActiveRepeat,
          ]}
        >
          <View style={styles.controlHeader}>
            <Icon
              name="autorenew"
              size={24}
              color={repeatSlotsDaily ? primaryColor : '#78909C'}
            />
            <Switch
              trackColor={{ false: '#ECEFF1', true: '#C5CAE9' }}
              thumbColor={repeatSlotsDaily ? primaryColor : '#B0BEC5'}
              onValueChange={handleRepeatSlotsDailyToggle}
              value={repeatSlotsDaily}
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
          </View>
          <Text style={styles.controlLabel}>Daily Repeat</Text>
          <Text style={styles.controlSubLabel}>Copy to future</Text>
        </View>
      </View>

      <View style={styles.sectionTitleRow}>
        <View>
          <Text style={styles.dateTitle}>
            {moment(selectedDate).format('MMMM Do')}
          </Text>
          <Text style={styles.yearTitle}>
            {moment(selectedDate).format('YYYY')}
          </Text>
        </View>
        <TouchableOpacity
          onPress={openAddSlotModal}
          style={[
            styles.fabButton,
            isSelectedDateHoliday && styles.fabButtonDisabled,
          ]}
          disabled={isSelectedDateHoliday}
        >
          <Icon name="plus" size={22} color="#FFFFFF" />
          <Text style={styles.fabText}>Add Slot</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={primaryColor} />

      <View style={styles.curvedHeaderBg} />

      <View style={styles.navbar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.navBackButton}
        >
          <Icon name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Manage Slots</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.contentWrapper}>
        {loading ? (
          <SlotsSkeleton />
        ) : (
          <FlatList
            data={isSelectedDateHoliday ? [] : slots[selectedDate] || []}
            renderItem={renderSlotItem}
            keyExtractor={item => item.id}
            ListHeaderComponent={ListHeaderComponent}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              isSelectedDateHoliday ? (
                <View style={styles.emptyContainer}>
                  <View
                    style={[styles.emptyIconBg, { backgroundColor: '#FFF3E0' }]}
                  >
                    <Icon name="umbrella-beach" size={48} color="#FFA000" />
                  </View>
                  <Text style={styles.emptyTitle}>Holiday Mode Active</Text>
                  <Text style={styles.emptyDesc}>
                    You have marked this day as a holiday. No bookings can be
                    made.
                  </Text>
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconBg}>
                    <Icon name="calendar-clock" size={48} color="#CFD8DC" />
                  </View>
                  <Text style={styles.emptyTitle}>No Slots Added</Text>
                  <Text style={styles.emptyDesc}>
                    Tap the "Add Slot" button to create availability for this
                    date.
                  </Text>
                </View>
              )
            }
          />
        )}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>
              {editingSlot ? 'Edit Time Slot' : 'New Time Slot'}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Starts At</Text>
              <TouchableOpacity
                onPress={() => setShowStartTimePicker(true)}
                style={styles.timeSelector}
              >
                <Text style={styles.timeBigText}>
                  {moment(startTime).format('hh:mm')}
                </Text>
                <Text style={styles.timeAmPm}>
                  {moment(startTime).format('A')}
                </Text>
              </TouchableOpacity>
            </View>

            {showStartTimePicker && (
              <DateTimePicker
                value={startTime}
                mode="time"
                is24Hour={false}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onStartTimeChange}
              />
            )}

            <View style={styles.arrowDownContainer}>
              <Icon name="arrow-down" size={20} color="#B0BEC5" />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ends At</Text>
              <TouchableOpacity
                onPress={() => setShowEndTimePicker(true)}
                style={styles.timeSelector}
              >
                <Text style={styles.timeBigText}>
                  {moment(endTime).format('hh:mm')}
                </Text>
                <Text style={styles.timeAmPm}>
                  {moment(endTime).format('A')}
                </Text>
              </TouchableOpacity>
            </View>

            {showEndTimePicker && (
              <DateTimePicker
                value={endTime}
                mode="time"
                is24Hour={false}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onEndTimeChange}
              />
            )}

            <View style={styles.bookingStatusContainer}>
              <View>
                <Text style={styles.label}>Slot Availability</Text>
                <Text style={styles.bookingStatusDesc}>
                  {isBooked ? 'Mark as Available' : 'Marked as Booked'}
                </Text>
              </View>
              <Switch
                trackColor={{ false: '#ECEFF1', true: '#FFCDD2' }}
                thumbColor={isBooked ? '#F44336' : '#B0BEC5'}
                onValueChange={value => setIsBooked(value)}
                value={isBooked}
              />
            </View>

            <View style={styles.sheetActions}>
              <TouchableOpacity
                style={styles.btnSecondary}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.btnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={handleAddOrUpdateSlot}
              >
                <Text style={styles.btnPrimaryText}>
                  {editingSlot ? 'Update Slot' : 'Create Slot'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={repeatUntilModalVisible}
        onRequestClose={() => {
          setRepeatUntilModalVisible(false);
          setRepeatSlotsDaily(false);
        }}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeaderRow}>
              <Text style={styles.sheetTitle}>Repeat Until</Text>
              <TouchableOpacity
                onPress={() => {
                  setRepeatUntilModalVisible(false);
                  setRepeatSlotsDaily(false);
                }}
              >
                <Icon name="close-circle-outline" size={28} color="#90A4AE" />
              </TouchableOpacity>
            </View>

            <View style={styles.repeatCalendarWrapper}>
              <Calendar
                onDayPress={day => setRepeatUntilDate(day.dateString)}
                markedDates={
                  repeatUntilDate
                    ? {
                        [repeatUntilDate]: {
                          selected: true,
                          selectedColor: primaryColor,
                        },
                      }
                    : {}
                }
                minDate={moment(selectedDate)
                  .add(1, 'day')
                  .format('YYYY-MM-DD')}
                theme={{
                  selectedDayBackgroundColor: primaryColor,
                  todayTextColor: primaryColor,
                  arrowColor: primaryColor,
                }}
              />
            </View>

            <TouchableOpacity
              style={styles.btnPrimaryFull}
              onPress={handleRepeatSlotsConfirm}
            >
              <Text style={styles.btnPrimaryText}>Confirm Schedule</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  curvedHeaderBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
    backgroundColor: primaryColor,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    zIndex: 0,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    zIndex: 1,
  },
  navBackButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  contentWrapper: {
    flex: 1,
    zIndex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 20,
  },
  topSpacing: {
    height: 10,
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 20,
  },
  controlGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  controlBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  controlBoxActiveHoliday: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FFE0B2',
  },
  controlBoxActiveRepeat: {
    backgroundColor: '#E8EAF6',
    borderColor: '#C5CAE9',
  },
  controlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  controlLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#37474F',
  },
  controlSubLabel: {
    fontSize: 12,
    color: '#78909C',
    marginTop: 2,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#263238',
  },
  yearTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#90A4AE',
  },
  fabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: primaryColor,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 4,
    shadowColor: primaryColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabButtonDisabled: {
    backgroundColor: '#B0BEC5',
    elevation: 0,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  slotCard: {
    flexDirection: 'row',
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  statusStrip: {
    width: 6,
    height: '100%',
  },
  slotContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  slotTimeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#37474F',
    marginBottom: 6,
  },
  statusChipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtn: {
    backgroundColor: '#F5F7FA',
  },
  deleteBtn: {
    backgroundColor: '#FFEBEE',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 30,
  },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ECEFF1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#455A64',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#90A4AE',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#263238',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    color: '#90A4AE',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#F5F7FA',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  timeBigText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#37474F',
    marginRight: 8,
  },
  timeAmPm: {
    fontSize: 16,
    fontWeight: '500',
    color: '#90A4AE',
  },
  arrowDownContainer: {
    alignItems: 'center',
    marginVertical: 4,
  },
  bookingStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    padding: 16,
    borderRadius: 16,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  bookingStatusDesc: {
    fontSize: 15,
    fontWeight: '600',
    color: '#37474F',
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 30,
  },
  btnSecondary: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#ECEFF1',
    borderRadius: 14,
    alignItems: 'center',
  },
  btnSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#546E7A',
  },
  btnPrimary: {
    flex: 2,
    paddingVertical: 16,
    backgroundColor: primaryColor,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 4,
    shadowColor: primaryColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  btnPrimaryFull: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: primaryColor,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
    elevation: 4,
  },
  btnPrimaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  repeatCalendarWrapper: {
    borderWidth: 1,
    borderColor: '#ECEFF1',
    borderRadius: 16,
    overflow: 'hidden',
    padding: 4,
  },
});

export default SlotsManagementScreen;
