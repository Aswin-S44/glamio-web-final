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
import { primaryColor } from '../../constants/colors';

const { width } = Dimensions.get('window');

const ServiceDetailsScreen = ({ navigation, route }) => {
  const { service } = route.params;

  const renderDetailItem = (icon, label, value, isPrice = false) => (
    <View style={styles.detailRow}>
      <View style={styles.iconContainer}>
        <Icon name={icon} size={22} color={primaryColor} />
      </View>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={[styles.detailValue, isPrice && styles.priceText]}>
          {isPrice && value ? `₹ ${value}` : value || 'N/A'}
        </Text>
      </View>
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
          <Text style={styles.headerTitle}>Service Details</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Service Image (Hero) */}
          <View style={styles.imageCard}>
            <Image
              source={{ uri: service?.imageUrl || AVATAR_IMAGE }}
              style={styles.serviceImage}
              resizeMode="cover"
            />
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.serviceName}>
              {service?.serviceName || 'Service Name'}
            </Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {service?.category || 'General'}
              </Text>
            </View>
          </View>

          {/* Details Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Information</Text>
            <View style={styles.divider} />

            {renderDetailItem(
              'pricetag-outline',
              'Service Price',
              service?.servicePrice,
              true,
            )}
            {renderDetailItem('layers-outline', 'Category', service?.category)}
            {renderDetailItem(
              'cut-outline',
              'Service Type',
              service?.serviceName,
            )}
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
  imageCard: {
    marginHorizontal: 20,
    marginTop: 20,
    height: 220,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },
  titleSection: {
    paddingVertical: 20,
    paddingHorizontal: 25,
    alignItems: 'center',
  },
  serviceName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: '#E8F0FE',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D2E3FC',
  },
  categoryText: {
    color: primaryColor,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  cardTitle: {
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
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  detailContent: {
    flex: 1,
    justifyContent: 'center',
  },
  detailLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 3,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
  },
  priceText: {
    color: '#27ae60',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ServiceDetailsScreen;
