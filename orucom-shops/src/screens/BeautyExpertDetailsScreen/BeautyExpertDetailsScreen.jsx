import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { primaryColor, starColor } from '../../constants/colors';

const StarRating = ({ rating, count }) => {
  const stars = [];
  const filledStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < filledStars; i++) {
    stars.push(
      <Ionicons
        key={`star-filled-${i}`}
        name="star"
        size={18}
        color={starColor}
      />,
    );
  }

  if (hasHalfStar) {
    stars.push(
      <Ionicons
        key="star-half"
        name="star-half-sharp"
        size={18}
        color={starColor}
      />,
    );
  }

  const emptyStars = 5 - stars.length;
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <Ionicons
        key={`star-empty-${i}`}
        name="star-outline"
        size={18}
        color={starColor}
      />,
    );
  }

  return (
    <View style={styles.starRatingContainer}>
      {stars}
      <Text style={styles.ratingText}>
        {' '}
        {rating} ({count})
      </Text>
    </View>
  );
};

const BeautyExpertDetailsScreen = ({ navigation }) => {
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
          <Text style={styles.mainTitle}>Beauty Expert</Text>

          <View style={styles.profileSection}>
            <Image
              source={require('../../assets/images/users/2.png')}
              style={styles.avatar}
            />
            <Text style={styles.expertName}>Jesika Sabnom</Text>
            <Text style={styles.expertSpecialty}>Spa & Skin Specialist</Text>
            <StarRating rating={4.9} count={150} />
            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => navigation.navigate('BookingSummaryScreen')}
            >
              <Text style={styles.bookButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.descriptionText}>
              Contrary to popular belief, Lorem Inosimplyrandom text. It has
              roots in a piece of classical Latin literature 45 BC, making it
              over 2000 years old.
            </Text>
            <View style={styles.bulletPoint}>
              <View style={styles.bulletIcon} />
              <Text style={styles.bulletText}>
                Distracted by the readable content of a page when looking at its
                layout.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Opening Hours</Text>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursDay}>Mon - Wed</Text>
              <Text style={styles.hoursTime}>8:00 am - 12:00 pm</Text>
            </View>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursDay}>Fri - Sat</Text>
              <Text style={styles.hoursTime}>10:00 am - 11:00 pm</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address</Text>
            <View style={styles.addressContainer}>
              <Ionicons name="location-sharp" size={24} color={primaryColor} />
              <Text style={styles.addressText}>
                58 Street- al dulha{'\n'}london - USA
              </Text>
              <Ionicons name="locate-outline" size={24} color={primaryColor} />
              <Text style={styles.distanceText}>5 km</Text>
            </View>
          </View>
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
    paddingHorizontal: 25,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '400',
    color: '#333',
    textAlign: 'center',
    marginTop: 25,
    marginBottom: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  expertName: {
    fontSize: 22,
    fontWeight: '500',
    color: '#333',
  },
  expertSpecialty: {
    fontSize: 16,
    color: '#777',
    marginVertical: 4,
  },
  starRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  ratingText: {
    fontSize: 15,
    color: '#777',
  },
  bookButton: {
    backgroundColor: primaryColor,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginTop: 10,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#333',
    marginBottom: 15,
  },
  descriptionText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 15,
  },
  bulletIcon: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: primaryColor,
    marginRight: 12,
    marginTop: 6,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  hoursDay: {
    fontSize: 16,
    color: '#555',
  },
  hoursTime: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    flex: 1,
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    marginHorizontal: 15,
  },
  distanceText: {
    fontSize: 16,
    color: '#555',
    marginLeft: 8,
  },
});

export default BeautyExpertDetailsScreen;
