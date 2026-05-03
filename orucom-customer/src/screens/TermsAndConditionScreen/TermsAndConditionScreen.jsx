import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { primaryColor } from '../../constants/colors';

const BulletPoint = ({ text }) => (
  <View style={styles.bulletContainer}>
    <View style={styles.bullet} />
    <Text style={styles.bulletText}>{text}</Text>
  </View>
);

const TermsAndConditionScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.mainTitle}>Terms and Conditions</Text>

        <View style={styles.headerInfo}>
          <Text style={styles.headerText}>
            <Text style={styles.bold}>Last Updated:</Text> April 11, 2026
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.paragraph}>
            Welcome to Orucom, an application owned and operated by Nomino
            Innovations Private Limited ("Company"). By accessing or using our
            platform, you agree to be bound by these terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Scope of Service</Text>
          <Text style={styles.paragraph}>
            Nomino Innovations Private Limited acts strictly as a technology
            intermediary connecting users with independent beauty parlours and
            salons ("Service Providers").
          </Text>
          <BulletPoint text="We do not own, manage, or control the Service Providers listed on Orucom." />
          <BulletPoint text="We do not directly provide beauty, grooming, or wellness services." />
          <BulletPoint text="We are not liable for the quality, safety, or standard of services rendered by the Service Providers." />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. User Accounts & Login</Text>
          <BulletPoint text="Google Login: Access to the platform requires authentication via your Google Account. You are responsible for maintaining the security of your Google account credentials." />
          <BulletPoint text="Accuracy: You agree to provide accurate contact information (such as your phone number) to ensure Service Providers can fulfill your bookings." />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. User Guidelines & Bookings</Text>
          <BulletPoint text="Confirmations: A booking is only valid once confirmed via an in-app notification or message." />
          <BulletPoint text="Payments: All payments for services are to be settled directly with the Service Provider, unless an in-app payment gateway is explicitly utilized for an advance token." />
          <BulletPoint text="Cancellations: Users are expected to cancel appointments via the app reasonably in advance. Repeated failure to honor bookings (No-Shows) may result in account suspension." />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            5. Business Partner (Salon) Obligations
          </Text>
          <Text style={styles.paragraph}>
            Service Fulfillment: Salons registered on Orucom agree to honor all
            confirmed bookings.
          </Text>
          <BulletPoint text="Accuracy of Information: Salons are solely responsible for maintaining accurate pricing, availability, and service descriptions." />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            The Orucom platform is provided on an "AS IS" basis. To the maximum
            extent permitted by law, Nomino Innovations Private Limited shall
            not be held liable for any direct, indirect, or consequential
            damages, disputes, or injuries arising between users and Service
            Providers.
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Governing Law</Text>
          <Text style={styles.paragraph}>
            These terms are governed by the laws of India. Any disputes are
            subject to the exclusive jurisdiction of the courts in Kerala
          </Text>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 10,
    color: '#333',
  },
  headerInfo: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 14,
    color: '#555',
  },
  bold: {
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: primaryColor,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    marginBottom: 10,
  },
  bulletContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 5,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8e44ad',
    marginTop: 8,
    marginRight: 12,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
});

export default TermsAndConditionScreen;
