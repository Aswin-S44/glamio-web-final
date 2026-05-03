import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NO_IMAGE } from '../../constants/images';
import { primaryColor, secondaryColor } from '../../constants/colors';
import { getShopStatus } from '../../apis/services';

const { width } = Dimensions.get('window');

const Card = ({
  image,
  title,
  location,
  rating,
  distance,
  servicesOffered,
  offers,
  placeId,
}) => {
  const [shopStatus, setShopStatus] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      if (placeId) {
        const status = await getShopStatus(placeId);
        setShopStatus(status);
      }
    };
    fetchStatus();
  }, [placeId]);

  const displayServices = servicesOffered
    ? servicesOffered.split(', ').slice(0, 2).join(', ')
    : '';

  const isShopOpen = shopStatus === 'Open';
  const hasOffers = offers && offers.length > 0;

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: typeof image === 'string' && image ? image : NO_IMAGE,
          }}
          style={styles.cardImage}
        />

        <View style={styles.badgesContainer}>
          <View style={styles.ratingBadge}>
            <Icon name="star" size={12} color="#fff" />
            <Text style={styles.ratingBadgeText}>{rating.toFixed(1)}</Text>
          </View>

          {shopStatus && (
            <View
              style={[
                styles.statusBadge,
                isShopOpen ? styles.statusOpen : styles.statusClosed,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  isShopOpen ? styles.statusTextOpen : styles.statusTextClosed,
                ]}
              >
                {shopStatus}
              </Text>
            </View>
          )}

          {distance && (
            <View style={styles.distanceBadge}>
              <Text style={styles.distanceBadgeText}>{distance}</Text>
            </View>
          )}
        </View>

        {hasOffers && (
          <View style={styles.offerTag}>
            <Text style={styles.offerTagText}>Offer Available!</Text>
          </View>
        )}
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.locationContainer}>
          <MaterialCommunityIcons name="map-marker" size={16} color="#777" />
          <Text style={styles.cardLocation} numberOfLines={1}>
            {location}
          </Text>
        </View>

        {servicesOffered && (
          <View style={styles.servicesContainer}>
            <MaterialCommunityIcons
              name="scissors-cutting"
              size={16}
              color="#777"
            />
            <Text style={styles.servicesText} numberOfLines={1}>
              {displayServices}
              {servicesOffered.split(', ').length > 2 ? '...' : ''}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: width * 0.65,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    minHeight: 250,
    overflow: 'hidden',
    marginVertical: 8,
  },
  imageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    resizeMode: 'cover',
  },
  badgesContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: primaryColor,
    borderRadius: 15,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginRight: 6,
  },
  ratingBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 3,
  },
  statusBadge: {
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 3,
    justifyContent: 'center',
    marginRight: 6,
  },
  statusOpen: {
    backgroundColor: '#D4EDDA',
  },
  statusClosed: {
    backgroundColor: '#F8D7DA',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextOpen: {
    color: '#155724',
  },
  statusTextClosed: {
    color: '#721C24',
  },
  distanceBadge: {
    backgroundColor: secondaryColor,
    borderRadius: 15,
    paddingHorizontal: 7,
    paddingVertical: 3,
    justifyContent: 'center',
  },
  distanceBadgeText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 12,
  },
  offerTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF6347',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 3,
    zIndex: 1,
  },
  offerTagText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  detailsContainer: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardLocation: {
    fontSize: 13,
    color: '#777',
    marginLeft: 4,
    flexShrink: 1,
  },
  servicesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  servicesText: {
    fontSize: 13,
    color: '#777',
    marginLeft: 4,
    flexShrink: 1,
  },
});

export default Card;
