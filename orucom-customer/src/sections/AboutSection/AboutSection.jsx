import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Image,
  ScrollView,
} from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { primaryColor } from '../../constants/colors';
import { NO_IMAGE } from '../../constants/images'; // Assuming you have this constant

const AboutSection = ({
  about,
  experts,
  phone,
  email,
  googleReviewUrl,
  address,
}) => {
  const handleOpenGoogleMaps = () => {
    if (googleReviewUrl) {
      Linking.openURL(googleReviewUrl).catch(err =>
        console.error("Couldn't load page", err),
      );
    }
  };

  const handleCall = () => {
    if (phone) {
      Linking.openURL(`tel:${phone}`).catch(err =>
        console.error("Couldn't make a call", err),
      );
    }
  };

  const handleEmail = () => {
    if (email) {
      Linking.openURL(`mailto:${email}`).catch(err =>
        console.error("Couldn't send an email", err),
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      {about ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About Us</Text>
          <Text style={styles.description}>{about}</Text>
        </View>
      ) : null}

      {phone || email || address ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact & Location</Text>
          {address ? (
            <View style={styles.contactRow}>
              <Ionicons
                name="location-outline"
                size={20}
                color={primaryColor}
              />
              <Text style={styles.contactText}>{address}</Text>
            </View>
          ) : null}
          {phone ? (
            <TouchableOpacity style={styles.contactRow} onPress={handleCall}>
              <Ionicons name="call-outline" size={20} color={primaryColor} />
              <Text style={styles.contactText}>{phone}</Text>
            </TouchableOpacity>
          ) : null}
          {email ? (
            <TouchableOpacity style={styles.contactRow} onPress={handleEmail}>
              <Ionicons name="mail-outline" size={20} color={primaryColor} />
              <Text style={styles.contactText}>{email}</Text>
            </TouchableOpacity>
          ) : null}
          {googleReviewUrl && (
            <TouchableOpacity
              style={styles.visitUsButton}
              onPress={handleOpenGoogleMaps}
            >
              <Text style={styles.visitUsButtonText}>Visit Us / Review Us</Text>
              <Ionicons name="chevron-forward-outline" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      ) : null}

      {experts && experts.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Our Experts</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.expertsContainer}
          >
            {experts.map((expert, index) => (
              <View key={expert.id || index} style={styles.expertCard}>
                <Image
                  source={{ uri: expert.imageUrl || NO_IMAGE }}
                  style={styles.expertImage}
                />
                <Text style={styles.expertName}>{expert.expertName}</Text>
                {expert.specialist ? (
                  <Text style={styles.expertSpecialty}>
                    {expert.specialist.replace(/_/g, ' ')}
                  </Text>
                ) : null}
                {expert.about ? (
                  <Text style={styles.expertAbout} numberOfLines={2}>
                    {expert.about}
                  </Text>
                ) : null}
              </View>
            ))}
          </ScrollView>
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8', // Light background for the whole section
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 15,
    marginTop: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  description: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  contactText: {
    fontSize: 16,
    color: '#555', 
    marginLeft: 10,
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
  expertsContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  expertCard: {
    width: 120,
    marginRight: 15,
    alignItems: 'center',
    backgroundColor: '#fdfdfd',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  expertImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: primaryColor,
  },
  expertName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 2,
  },
  expertSpecialty: {
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
    textTransform: 'capitalize',
    marginBottom: 5,
  },
  expertAbout: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
  },
});

export default AboutSection;
