import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ServiceCardSkeleton from '../../components/ServiceCardSkeleton/ServiceCardSkeleton'; // Assuming this is fine
import EmptyComponent from '../../components/EmptyComponent/EmptyComponent'; // Assuming this is fine
import { primaryColor } from '../../constants/colors';

// Define a more modern color palette

const accentColor = '#FFB300'; // Amber for highlights/offers
const darkText = '#212121';
const lightText = '#FFFFFF';
const subtleGray = '#EEEEEE'; // For backgrounds/separators
const mediumGray = '#757575'; // For subtitles/secondary text
const successGreen = '#4CAF50'; // For 'Booked' or savings

const ServiceItem = ({ item, shopId, experts, offers }) => {
  const navigation = useNavigation();
  const animatedValue = new Animated.Value(0);

  // Simple animation for press feedback
  const handlePressIn = () => {
    Animated.spring(animatedValue, {
      toValue: 1,
      useNativeDriver: true,
      friction: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatedValue, {
      toValue: 0,
      useNativeDriver: true,
      friction: 4,
    }).start();
  };

  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.98], // Slightly shrink on press
  });

  return (
    <Animated.View style={[styles.listItem, { transform: [{ scale }] }]}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        onPress={() => {
          navigation.navigate('BookingScreen', {
            shopId: shopId,
            serviceId: item.id,
            experts,
            service: item,
            offers,
          });
        }}
        style={styles.listItemTouchable}
      >
        <Image
          source={{
            uri:
              typeof item.imageUrl === 'string' && item.imageUrl
                ? item.imageUrl
                : 'https://via.placeholder.com/80/EEEEEE/808080?text=Service',
          }}
          style={styles.listItemImage}
        />
        <View style={styles.listItemContent}>
          <Text style={styles.listItemTitle} numberOfLines={1}>
            {item.serviceName}
          </Text>
          <Text style={styles.listItemSubtitle}>{item.category}</Text>
          <Text style={styles.listItemPrice}>₹{item.servicePrice}</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={24} color={mediumGray} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const OfferItem = ({ item, shopId, experts, offers }) => {
  const navigation = useNavigation();
  const animatedValue = new Animated.Value(0);
  const savings = item.regularPrice - item.offerPrice;

  const handlePressIn = () => {
    Animated.spring(animatedValue, {
      toValue: 1,
      useNativeDriver: true,
      friction: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatedValue, {
      toValue: 0,
      useNativeDriver: true,
      friction: 4,
    }).start();
  };

  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.98],
  });

  return (
    <Animated.View
      style={[
        styles.listItem,
        styles.offerListItem,
        { transform: [{ scale }] },
      ]}
    >
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate('BookingScreen', {
            shopId: shopId,
            serviceId: item.serviceId,
            experts,
            service: item,
            offers,
          })
        }
        style={styles.listItemTouchable}
      >
        <Image
          source={{
            uri:
              item.imageUrl && item.imageUrl.trim() !== ''
                ? item.imageUrl
                : 'https://via.placeholder.com/80/FFE0B2/808080?text=Offer',
          }}
          style={styles.listItemImage}
        />
        <View style={styles.listItemContent}>
          <View style={styles.offerTag}>
            <Text style={styles.offerTagText}>OFFER</Text>
          </View>
          <Text style={styles.listItemTitle} numberOfLines={1}>
            {item.serviceName}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={styles.originalPrice}>₹{item?.regularPrice ?? 0}</Text>
            <Text style={styles.offerPrice}>₹{item?.offerPrice ?? 0}</Text>
          </View>
          {savings > 0 && (
            <Text style={styles.savingsText}>Save ₹{savings}!</Text>
          )}
        </View>
        <Ionicons
          name="chevron-forward-outline"
          size={24}
          color={accentColor}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const ServiceSection = ({
  shopId,
  initialServices,
  initialOffers,
  loadingServices,
  loadingOffers,
  experts,
}) => {
  const [activeTab, setActiveTab] = useState('Services');

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'Services' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('Services')}
        >
          <Ionicons
            name="cut-outline"
            size={22}
            color={activeTab === 'Services' ? primaryColor : mediumGray}
            style={styles.tabIcon}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'Services' && styles.activeTabLabel,
            ]}
          >
            Services
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'Offers' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('Offers')}
        >
          <Ionicons
            name="gift-outline"
            size={22}
            color={activeTab === 'Offers' ? primaryColor : mediumGray}
            style={styles.tabIcon}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'Offers' && styles.activeTabLabel,
            ]}
          >
            Offers
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentArea}>
        {activeTab === 'Services' ? (
          <>
            {loadingServices ? (
              <ServiceCardSkeleton />
            ) : initialServices.length === 0 ? (
              <EmptyComponent
                iconName="happy-outline"
                message="No services available here yet."
              />
            ) : (
              <FlatList
                data={initialServices}
                renderItem={({ item }) => (
                  <ServiceItem
                    item={item}
                    shopId={shopId}
                    experts={experts}
                    offers={initialOffers}
                  />
                )}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
              />
            )}
          </>
        ) : (
          <>
            {loadingOffers ? (
              <ServiceCardSkeleton />
            ) : initialOffers.length === 0 ? (
              <EmptyComponent
                iconName="pricetags-outline"
                message="No exciting offers at the moment!"
              />
            ) : (
              <FlatList
                data={initialOffers}
                renderItem={({ item }) => (
                  <OfferItem
                    item={item}
                    shopId={shopId}
                    experts={experts}
                    offers={initialOffers}
                  />
                )}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
              />
            )}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFBFB', // Very light background
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingVertical: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  activeTabButton: {
    backgroundColor: subtleGray,
  },
  tabIcon: {
    marginRight: 8,
  },
  tabLabel: {
    fontSize: 17,
    fontWeight: '500',
    color: mediumGray,
  },
  activeTabLabel: {
    color: primaryColor,
    fontWeight: 'bold',
  },
  contentArea: {
    flex: 1,
    paddingTop: 10,
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  // List Item Styles (for both services and offers)
  listItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  offerListItem: {
    backgroundColor: '#FFFDE7', // Lighter background for offer items
    borderLeftWidth: 5,
    borderLeftColor: accentColor, // Accent color stripe
  },
  listItemTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: darkText,
    marginBottom: 3,
  },
  listItemSubtitle: {
    fontSize: 13,
    color: mediumGray,
  },
  listItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: primaryColor,
    marginTop: 5,
  },
  // Offer Specific Styles
  offerTag: {
    backgroundColor: accentColor,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  offerTagText: {
    color: lightText,
    fontSize: 10,
    fontWeight: 'bold',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  originalPrice: {
    fontSize: 14,
    color: mediumGray,
    textDecorationLine: 'line-through',
    marginRight: 10,
  },
  offerPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: primaryColor, // Use primary for the actual offer price
  },
  savingsText: {
    fontSize: 12,
    color: successGreen,
    fontWeight: '500',
    marginTop: 3,
  },
});

export default ServiceSection;
