import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  RefreshControl,
  FlatList,
  Dimensions,
} from 'react-native';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import Card from '../../components/Card/Card';
import { primaryColor } from '../../constants/colors';
import {
  getAllParlours,
  getNotificationsCountByCustomerId,
  updateCustomer,
} from '../../apis/services';
import CardSkeleton from '../../components/CardSkeleton/CardSkeleton';
import { AuthContext } from '../../context/AuthContext';
import EmptyComponent from '../../components/EmptyComponent/EmptyComponent';
import { getLocationPermission } from '../../apis/permissions';
import Geolocation from '@react-native-community/geolocation';
import { formattedDate, isShopOpen } from '../../utils/utils';
import FirebaseNotificationService from '../../apis/FirebaseNotificationService';
import { OFFER_CARD_IMAGE } from '../../constants/images';
import client from '../../services/contentful';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user, userData, userId } = useContext(AuthContext);
  const [shops, setShops] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('Welcome Back!');
  const [offers, setOffers] = useState([]);
  const [specialOffers, setSpeicalOffers] = useState([]);

  const eidOffer = {
    id: 1,
    discount: '33.33% Free',
    dateRange: 'Jan 01 - Feb 28',
    image: OFFER_CARD_IMAGE,
  };

  const fetchOffers = async () => {
    try {
      const response = await client.getEntries({
        content_type: 'special_offers',
      });
      if (response && response.items) {
        setOffers(response.items);
      }
    } catch (error) {
      try {
        const retryResponse = await client.getEntries({
          content_type: 'specialOffers',
        });
        if (retryResponse && retryResponse.items) {
          setOffers(retryResponse.items);
        }
      } catch (err) {
        setOffers([]);
      }
    }
  };

  const fetchSpecialOffers = async () => {
    try {
      const response = await client.getEntries({
        content_type: 'offers',
      });
      if (response && response.items) {
        setSpeicalOffers(response.items);
      }
    } catch (error) {
      setSpeicalOffers([]);
    }
  };

  const getCurrentLocation = useCallback(async () => {
    try {
      const granted = await getLocationPermission();
      if (!granted) return;

      Geolocation.getCurrentPosition(
        async position => {
          const { latitude, longitude } = position.coords;
          if (user?.uid && userId) {
            await updateCustomer(userId, {
              coordinates: { latitude, longitude },
            });
          }
        },
        error => {},
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 },
      );
    } catch (err) {}
  }, [user, userId]);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const res = await getAllParlours();
      setShops(res || []);
    } catch (err) {
      setShops([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationCount = async () => {
    if (userId) {
      const res = await getNotificationsCountByCustomerId(userId);
      if (res !== undefined) setNotificationCount(res);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchShops(),
      fetchNotificationCount(),
      fetchOffers(),
      fetchSpecialOffers(),
    ]);
    setRefreshing(false);
  }, [userId]);

  useEffect(() => {
    getCurrentLocation();
    fetchOffers();
    fetchSpecialOffers();
  }, []);

  useEffect(() => {
    fetchShops();
    fetchNotificationCount();
  }, [userId]);

  useEffect(() => {
    if (userData?.fullName) {
      setWelcomeMessage(`Hello, ${userData.fullName.split(' ')[0]}!`);
    } else if (user?.email) {
      setWelcomeMessage(`Hello, ${user.email.split('@')[0]}!`);
    } else {
      setWelcomeMessage('Welcome Back!');
    }
  }, [userData?.fullName, user?.email]);

  useEffect(() => {
    const initializeNotifications = async () => {
      if (userData?.uid) {
        try {
          FirebaseNotificationService.setupNotificationHandlers();
          const hasPermission =
            await FirebaseNotificationService.requestNotificationPermission();
          if (hasPermission) {
            await FirebaseNotificationService.updateFCMToken(userData.uid);
          }
        } catch (error) {}
      }
    };

    if (!loading) {
      initializeNotifications();
    }
  }, [loading, userData?.uid]);

  // Fix for the date function (Must be sync, not async)
  const displayDate = dateStr => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
    });
  };

  return (
    <View style={styles.fullContainer}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={primaryColor}
          />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Feather name="menu" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerGreeting}>{welcomeMessage}</Text>
            <Text style={styles.headerSubTitle}>Find your perfect look!</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('AllNotificationScreen')}
          >
            <Ionicons name="notifications-outline" size={24} color="#333" />
            {notificationCount > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{notificationCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.searchSection}>
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => navigation.navigate('SearchResultsScreen')}
          >
            <EvilIcons
              name="search"
              size={28}
              color="#888"
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Search Salon, Specialist..."
              style={styles.searchInput}
              placeholderTextColor="#888"
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>
        </View>

        {offers?.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>#SpecialForYou</Text>
            </View>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={offers}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.offerCard}>
                  <Image
                    source={require('../../assets/images/banner1-old.jpg')}
                    style={styles.offerCardImage}
                  />
                  <View style={styles.offerContent}>
                    <View style={styles.limitedTimeTag}>
                      <Text style={styles.limitedTimeText}>Limited time!</Text>
                    </View>
                    <Text style={styles.offerTitle}>{item.fields.title}</Text>
                    <Text style={styles.offerDiscount}>
                      Upto {item.fields.offer}% Offer
                    </Text>
                    <Text style={styles.offerDescription}>
                      {item.fields.offerDescription}
                    </Text>
                  </View>
                </View>
              )}
              contentContainerStyle={styles.offerCarouselContainer}
            />
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Rated Salons</Text>
          </View>
          {loading ? (
            <CardSkeleton />
          ) : shops && shops.length > 0 ? (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={shops}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('ParlourDetails', {
                      parlourData: item,
                    })
                  }
                  style={styles.parlourCardWrapper}
                >
                  <Card
                    image={item.profileImage}
                    title={item.parlourName}
                    location={item.address}
                    rating={item.totalRating ?? 0}
                    status={isShopOpen(item.openingHours) ? 'Open' : 'Closed'}
                    servicesOffered={item.services
                      ?.map(s => s.serviceName)
                      .join(', ')}
                    offers={item.offers}
                    placeId={item?.placeId}
                  />
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.shopsCarouselContainer}
            />
          ) : (
            <EmptyComponent title="No shops available" />
          )}
        </View>

        {specialOffers?.length > 0 && (
          <View style={styles.eidOfferSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Special offers</Text>
            </View>
            {specialOffers.map((off, index) => (
              <TouchableOpacity key={index} style={styles.eidOfferCard}>
                <View style={styles.eidOfferContent}>
                  <Text style={styles.eidOfferTag}>
                    {off?.fields?.serviceName}
                  </Text>
                  <Text style={styles.eidOfferDiscount}>
                    {off?.fields?.offer}% Off
                  </Text>
                  <Text style={styles.eidOfferDate}>
                    {off?.fields?.fromTime
                      ? displayDate(off.fields.fromTime)
                      : ''}
                    {off?.fields?.fromTime && off?.fields?.toTime ? ' - ' : ''}
                    {off?.fields?.toTime ? displayDate(off.fields.toTime) : ''}
                  </Text>
                </View>
                <Image
                  source={{ uri: eidOffer.image }}
                  style={styles.eidOfferImage}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  fullContainer: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  headerTitleContainer: { flex: 1, alignItems: 'flex-start', marginLeft: 40 },
  headerGreeting: { fontSize: 25, fontWeight: '700', color: primaryColor },
  headerSubTitle: { fontSize: 14, color: '#666', marginTop: 2 },
  notificationButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  badgeContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: primaryColor,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  eidOfferSection: { marginBottom: 20 },
  eidOfferCard: {
    backgroundColor: '#FFF7E6',
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eidOfferContent: { flex: 1, padding: 15, justifyContent: 'center' },
  eidOfferTag: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF6347',
    marginBottom: 5,
  },
  eidOfferDiscount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  eidOfferDate: { fontSize: 13, color: '#666', marginBottom: 10 },
  getOfferButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignSelf: 'flex-start',
  },
  getOfferButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 5,
  },
  getOfferButtonIcon: { marginLeft: 5 },
  eidOfferImage: {
    width: width * 0.4,
    height: 150,
    resizeMode: 'cover',
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
  },
  offerCarouselContainer: { paddingHorizontal: 20 },
  offerCard: {
    width: 300,
    height: 180,
    borderRadius: 15,
    overflow: 'hidden',
    marginRight: 15,
    position: 'relative',
    backgroundColor: '#000',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  offerCardImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    opacity: 0.6,
  },
  offerContent: { padding: 15, justifyContent: 'space-between', flex: 1 },
  limitedTimeTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  limitedTimeText: { fontSize: 12, color: '#FF6347', fontWeight: 'bold' },
  offerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  offerDiscount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  offerDescription: { fontSize: 12, color: '#ddd', marginBottom: 10 },
  shopsCarouselContainer: { paddingHorizontal: 20 },
  parlourCardWrapper: { marginRight: 15 },
});

export default HomeScreen;
