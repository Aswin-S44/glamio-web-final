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
import { GREY } from '../../constants/colors';

const primaryColor = '#8E44AD';

const servicesData = [
  {
    id: 1,
    title: 'Hair cut',
    types: '20 Types',
    image: require('../../assets/images/services/1.png'),
  },
  {
    id: 2,
    title: 'Facial',
    types: '20 Types',
    image: require('../../assets/images/services/2.png'),
  },
  {
    id: 3,
    title: 'hair Treatment',
    types: '15 Types',
    image: require('../../assets/images/services/3.png'),
  },
  {
    id: 4,
    title: 'Makeup',
    types: '10 Types',
    image: require('../../assets/images/services/4.png'),
  },
];

const AppointmentScreen = ({ navigation }) => {
  const [selectedType, setSelectedType] = useState('Child');

  return (
    <View style={styles.outerContainer}>
      <StatusBar backgroundColor={primaryColor} barStyle="light-content" />
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentContainer}
        >
          <Text style={styles.mainTitle}>Appointment</Text>

          <Text style={styles.sectionTitle}>Customer Type</Text>
          <View style={styles.radioGroup}>
            {['Child', 'Women', 'Others'].map(type => (
              <TouchableOpacity
                key={type}
                style={styles.radioButton}
                onPress={() => setSelectedType(type)}
              >
                <View style={styles.radioOuterCircle}>
                  {selectedType === type && (
                    <View style={styles.radioInnerCircle} />
                  )}
                </View>
                <Text style={styles.radioLabel}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Select Services</Text>
          {servicesData.map(service => (
            <View key={service.id} style={styles.card}>
              <Image source={service.image} style={styles.cardImage} />
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>{service.title}</Text>
                <Text style={styles.cardSubtitle}>{service.types}</Text>
              </View>
              <TouchableOpacity style={styles.styleButton}>
                <Text style={styles.styleButtonText}>Styles</Text>
                <Ionicons name="caret-down" size={12} color={'grey'} />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => navigation.navigate('BookingScreen')}
          >
            <Text style={styles.nextButtonText}>NEXT</Text>
          </TouchableOpacity>
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
  container: {
    flex: 1,
    marginTop: 60,
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  scrollContentContainer: {
    padding: 25,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: 400,
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 500,
    color: '#333',
    marginBottom: 15,
  },
  radioGroup: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 30,
  },
  radioOuterCircle: {
    height: 22,
    width: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioInnerCircle: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: primaryColor,
  },
  radioLabel: {
    fontSize: 16,
    color: '#555',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: GREY,
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    padding: 10,
  },
  cardImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  cardTextContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 500,
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  styleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
  },
  styleButtonText: {
    color: 'grey',
    fontWeight: 400,
    marginRight: 5,
  },
  nextButton: {
    backgroundColor: primaryColor,
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AppointmentScreen;
