import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { AVATAR_IMAGE } from '../../constants/images';
import { primaryColor } from '../../constants/colors';

const { width } = Dimensions.get('window');

const OfferDetailsScreen = ({ navigation, route }) => {
  const { offer } = route.params;

  const renderDetailItem = (
    icon,
    label,
    value,
    isPrice = false,
    isOldPrice = false,
  ) => (
    <View style={styles.detailRow}>
      <View style={styles.iconContainer}>
        <Icon name={icon} size={20} color={primaryColor} />
      </View>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text
          style={[
            styles.detailValue,
            isPrice && styles.priceText,
            isOldPrice && styles.oldPriceText,
          ]}
        >
          {isPrice && value ? `$${value}` : value || 'N/A'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={primaryColor} />

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
          <Text style={styles.headerTitle}>Offer Details</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <View style={styles.mainContent}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri:
                  offer?.service?.imageUrl || offer?.imageUrl || AVATAR_IMAGE,
              }}
              style={styles.serviceImage}
              resizeMode="cover"
            />
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>SPECIAL OFFER</Text>
            </View>
          </View>

          <View style={styles.titleSection}>
            <Text style={styles.serviceName}>
              {offer?.serviceName || 'Service Name'}
            </Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {offer?.category || 'Category'}
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pricing Information</Text>
            <View style={styles.divider} />

            <View style={styles.priceRow}>
              <View style={styles.priceBlock}>
                <Text style={styles.priceLabel}>Regular Price</Text>
                <Text style={styles.regularPrice}>
                  {offer?.regularPrice ? `${offer.regularPrice}` : '0.00'}
                </Text>
              </View>

              <View style={styles.arrowContainer}>
                <Icon name="arrow-forward" size={24} color="#ccc" />
              </View>

              <View style={styles.priceBlock}>
                <Text style={styles.priceLabel}>Offer Price</Text>
                <Text style={styles.offerPrice}>
                  {offer?.offerPrice ? `${offer.offerPrice}` : '0.00'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Service Details</Text>
            <View style={styles.divider} />
            {renderDetailItem('layers-outline', 'Category', offer?.category)}
            {renderDetailItem('cut-outline', 'Service', offer?.serviceName)}
            {renderDetailItem(
              'pricetag-outline',
              'Discount',
              offer?.regularPrice && offer?.offerPrice
                ? `${Math.round(
                    ((offer.regularPrice - offer.offerPrice) /
                      offer.regularPrice) *
                      100,
                  )}% OFF`
                : 'No Discount',
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
  imageContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },
  badgeContainer: {
    position: 'absolute',
    top: 20,
    right: 0,
    backgroundColor: '#FF6B6B',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1,
  },
  titleSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  serviceName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  categoryBadge: {
    backgroundColor: '#E8F0FE',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#D2E3FC',
  },
  categoryText: {
    color: primaryColor,
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
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
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  priceBlock: {
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  regularPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    textDecorationLine: 'line-through',
  },
  offerPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

export default OfferDetailsScreen;
