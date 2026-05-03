import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { primaryColor } from '../../constants/colors';

const BulletPoint = ({ text }) => (
  <View style={styles.bulletContainer}>
    <View style={styles.bullet} />
    <Text style={styles.bulletText}>{text}</Text>
  </View>
);

const PrivacyPolicyScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.mainTitle}>Privacy Policy</Text>

        <View style={styles.headerInfo}>
          <Text style={styles.headerText}>
            <Text style={styles.bold}>App Name:</Text> Orucom
          </Text>
          <Text style={styles.headerText}>
            <Text style={styles.bold}>Company:</Text> Nomino Innovations Private
            Limited
          </Text>
          <Text style={styles.headerText}>
            <Text style={styles.bold}>Last Updated:</Text> March 05, 2026
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.paragraph}>
            Nomino Innovations Private Limited ("we," "our," or "us") operates
            the Orucom mobile application. We are committed to protecting your
            personal information and your right to privacy. If you have any
            questions or concerns about this policy, or our practices with
            regards to your personal information, please contact us at
            nominoinnovations@gmail.com.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Information We Collect</Text>
          <Text style={styles.paragraph}>
            We collect personal information that you voluntarily provide to us
            when you register on Orucom.
          </Text>
          <BulletPoint text="Personal Data: Name, Email, Phone Number, and Profile Picture (optional)." />
          <BulletPoint text="Booking Data: Details of appointments you book (Date, Time, Service, Salon Name)." />
          <BulletPoint text="Device Information: We automatically collect certain information when you visit, use, or navigate the App. This includes device characteristics, operating system, and IP address." />
          <BulletPoint text="Location Data: We request access to your location to suggest Salons near you. You can revoke this access at any time in your device settings." />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            3. How We Use Your Information
          </Text>
          <BulletPoint text="To facilitate account creation and logon process." />
          <BulletPoint text="To fulfill and manage your bookings. We share your Name and Phone number with the Salon Partner you select solely for the purpose of the appointment." />
          <BulletPoint text="To send administrative information, booking confirmations, reminders, and updates via Push Notifications or WhatsApp." />
          <BulletPoint text="To protect our Services and for fraud monitoring and prevention." />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            4. Will Your Information be Shared?
          </Text>
          <BulletPoint text="Service Providers (Salons): We share booking details with the specific Salon you have chosen." />
          <BulletPoint text="Legal Obligations: We may disclose information where legally required to comply with applicable laws or governmental requests." />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            5. Data Retention and Deletion
          </Text>
          <Text style={styles.paragraph}>
            We keep your information for as long as necessary to fulfill the
            purposes outlined in this policy unless otherwise required by law.
          </Text>
          <BulletPoint text="Request Deletion: You can request the deletion of your account via Settings > Delete Account in the app, or by emailing us at nominoinnovations@gmail.com." />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            6. Security of Your Information
          </Text>
          <Text style={styles.paragraph}>
            We use administrative, technical, and physical security measures to
            protect your personal information. However, transmission of personal
            information to and from our App is at your own risk as no internet
            transmission is 100% secure.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
          <Text style={styles.paragraph}>
            We do not knowingly solicit data from or market to children under 18
            years of age. By using the App, you represent that you are at least
            18 years old.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Updates to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update this privacy policy from time to time. The updated
            version will be effective as soon as it is accessible.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Contact Us</Text>
          <Text style={styles.paragraph}>
            Email: nominoinnovations@gmail.com
          </Text>
          <Text style={styles.paragraph}>
            Address: NOMINO INNOVATIONS PRIVATE LIMITED{'\n'}
            Door No: 155, Building ID: 50916010009071{'\n'}
            Ward No: 6-Neerad, Kondotty{'\n'}
            Malappuram, Kerala - 673638
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
  },
  headerText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
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

export default PrivacyPolicyScreen;
