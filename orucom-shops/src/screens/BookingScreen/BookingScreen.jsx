import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { bookedColor, lightPurple, primaryColor } from '../../constants/colors';

const expertsData = [
  {
    id: 1,
    name: 'Robat Jonson',
    image: require('../../assets/images/users/1.png'),
  },
  {
    id: 2,
    name: 'Markal hums',
    image: require('../../assets/images/users/2.png'),
  },
  {
    id: 3,
    name: 'Lifsa Zuli',
    image: require('../../assets/images/users/3.png'),
  },
  {
    id: 4,
    name: 'Washin Tomas',
    image: require('../../assets/images/users/4.png'),
  },
];

const timeSlots = [
  '8:00 am',
  '9:00 am',
  '10:00 am',
  '11:00 am',
  '12:00 pm',
  '1:00 pm',
  '2:00 pm',
  '3:00 pm',
  '4:00 pm',
  '5:00 pm',
  '6:00 pm',
  '7:00 pm',
  '8:00 pm',
  '9:00 pm',
];

const bookedSlots = ['10:00 am', '4:00 pm', '6:00 pm'];

const servicesData = [
  { id: 1, name: 'Style Hair Cut', qty: '01', price: '$25' },
  { id: 2, name: 'Spa', qty: '01', price: '$100' },
  { id: 3, name: 'Skin Treatment', qty: '01', price: '$200' },
];

const BookingScreen = ({ navigation }) => {
  const [selectedExpert, setSelectedExpert] = useState(1);
  const [selectedTime, setSelectedTime] = useState(null);

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
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.mainTitle}>Appointment</Text>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Choose Your Beauty Expert</Text>
            <View style={styles.navIcons}>
              <Ionicons name="chevron-back" size={20} color="#888" />
              <Ionicons name="chevron-forward" size={20} color="#333" />
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.expertScroll}
          >
            {expertsData.map(expert => (
              <TouchableOpacity
                key={expert.id}
                style={styles.expertCard}
                onPress={() => navigation.navigate('BeautyExpertDetailsScreen')}
              >
                <View style={styles.avatarContainer}>
                  <Image source={expert.image} style={styles.avatar} />
                  {selectedExpert === expert.id && (
                    <View style={styles.avatarOverlay} />
                  )}
                </View>
                <Text style={styles.expertName}>{expert.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>Select Date</Text>
          <TouchableOpacity style={styles.datePicker}>
            <Text style={styles.dateText}>25 August 2020</Text>
            <Ionicons name="calendar-outline" size={22} color="#888" />
          </TouchableOpacity>

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
              <Text style={styles.legendText}>Booked</Text>
            </View>
          </View>
          <View style={styles.timeSlotsContainer}>
            {timeSlots.map(time => {
              const isBooked = bookedSlots.includes(time);
              const isSelected = selectedTime === time;
              return (
                <TouchableOpacity
                  key={time}
                  disabled={isBooked}
                  onPress={() => setSelectedTime(time)}
                  style={[
                    styles.timeSlot,
                    isBooked && styles.timeSlotBooked,
                    isSelected && styles.timeSlotSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.timeSlotText,
                      isBooked && styles.timeSlotTextBooked,
                      isSelected && styles.timeSlotTextSelected,
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>Service Amount</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text
                style={[styles.tableCell, styles.tableHeaderText, { flex: 2 }]}
              >
                Service
              </Text>
              <Text style={[styles.tableCell, styles.tableHeaderText]}>
                Quantity
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
            {servicesData.map(service => (
              <View key={service.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>
                  {service.name}
                </Text>
                <Text style={styles.tableCell}>{service.qty}</Text>
                <Text style={[styles.tableCell, { textAlign: 'right' }]}>
                  {service.price}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => navigation.navigate('BookingSummaryScreen')}
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
    fontSize: 18,
    marginLeft: 5,
  },
  container: {
    flex: 1,
    marginTop: 100,
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 25,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: 400,
    color: '#333',
    textAlign: 'center',
    marginTop: 25,
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  navIcons: {
    flexDirection: 'row',
  },
  expertScroll: {
    paddingBottom: 25,
  },
  expertCard: {
    alignItems: 'center',
    marginRight: 20,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 8,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(142, 68, 173, 0.6)',
    borderRadius: 35,
  },
  expertName: {
    fontSize: 14,
    color: '#555',
  },
  datePicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
  },
  dateText: {
    fontSize: 16,
    color: '#555',
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
    marginLeft: 10,
  },
  legendText: {
    fontSize: 14,
    color: '#888',
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  timeSlot: {
    width: '23%',
    backgroundColor: lightPurple,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  timeSlotSelected: {
    backgroundColor: primaryColor,
  },
  timeSlotBooked: {
    backgroundColor: bookedColor,
  },
  timeSlotText: {
    color: primaryColor,
    fontWeight: '600',
  },
  timeSlotTextSelected: {
    color: '#fff',
  },
  timeSlotTextBooked: {
    color: '#999',
  },
  table: {
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 12,
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tableHeader: {
    backgroundColor: '#FAFAFA',
  },
  tableCell: {
    flex: 1,
    fontSize: 15,
    color: '#555',
  },
  tableHeaderText: {
    fontWeight: 'bold',
    color: '#333',
  },
  nextButton: {
    backgroundColor: primaryColor,
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginVertical: 10,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BookingScreen;
