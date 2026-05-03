import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { AVATAR_IMAGE } from '../../constants/images';
import { formatServiceName } from '../../utils/utils';
import { primaryColor } from '../../constants/colors';

const { width } = Dimensions.get('window');

const ExpertDetailsScreen = ({ navigation, route }) => {
  const { expert } = route.params;

  const renderInfoRow = (icon, text) => (
    <View style={styles.infoRow}>
      <View style={styles.iconCircle}>
        <Icon name={icon} size={20} color={primaryColor} />
      </View>
      <Text style={styles.infoText}>{text || 'N/A'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={primaryColor} />

      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Image
          source={require('../../assets/images/home_bg-1.png')}
          style={styles.headerBg}
          resizeMode="cover"
        />
        <View style={styles.headerOverlay} />
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <View style={styles.backBtnCircle}>
              <Icon name="chevron-back" size={22} color={primaryColor} />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Expert Profile</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <View style={styles.mainContent}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Image Card */}
          <View style={styles.profileCard}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: expert?.imageUrl || AVATAR_IMAGE }}
                style={styles.expertImage}
                resizeMode="cover"
              />
            </View>

            <Text style={styles.expertName}>
              {expert?.expertName || 'Expert Name'}
            </Text>

            <View style={styles.specialistBadge}>
              <Icon
                name="ribbon-outline"
                size={14}
                color={primaryColor}
                style={{ marginRight: 5 }}
              />
              <Text style={styles.specialistText}>
                {expert?.specialist
                  ? formatServiceName(expert.specialist)
                  : 'General Specialist'}
              </Text>
            </View>
          </View>

          {/* About Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>About Expert</Text>
            <View style={styles.divider} />
            <View style={styles.aboutContainer}>
              <Icon
                name="person-outline"
                size={20}
                color="#888"
                style={styles.aboutIcon}
              />
              <Text style={styles.aboutText}>
                {expert?.about || 'No description provided for this expert.'}
              </Text>
            </View>
          </View>

          {/* Location / Contact Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Location Details</Text>
            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.iconCircle}>
                <Icon name="location-outline" size={20} color={primaryColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Address</Text>
                <Text style={styles.infoText}>
                  {expert?.address || 'No address provided'}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: primaryColor,
  },
  headerContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
    justifyContent: 'flex-start',
  },
  headerBg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: primaryColor,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 20,
  },
  backBtnCircle: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -40,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileCard: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  imageContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: '#fff',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    marginBottom: 15,
    overflow: 'hidden',
  },
  expertImage: {
    width: '100%',
    height: '100%',
  },
  expertName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  specialistBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0FE',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D2E3FC',
  },
  specialistText: {
    color: primaryColor,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'capitalize',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginBottom: 15,
  },
  aboutContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  aboutIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  aboutText: {
    flex: 1,
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  label: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
    fontWeight: '500',
  },
  infoText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    lineHeight: 22,
  },
});

export default ExpertDetailsScreen;
