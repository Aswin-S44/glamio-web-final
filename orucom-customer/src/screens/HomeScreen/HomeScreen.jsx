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
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import Card from '../../components/Card/Card';
import {
  primaryColor,
  primaryPale,
  primaryDark,
  dark,
  textMuted,
  surfaceMuted,
  warmBg,
} from '../../constants/colors';
import {
  getAllParlours,
  getNotificationsCountByCustomerId,
} from '../../apis/services';
import CardSkeleton from '../../components/CardSkeleton/CardSkeleton';
import { AuthContext } from '../../context/AuthContext';
import EmptyComponent from '../../components/EmptyComponent/EmptyComponent';
import { getLocationPermission } from '../../apis/permissions';
import Geolocation from '@react-native-community/geolocation';
import { isShopOpen } from '../../utils/utils';
import NotificationService from '../../apis/FirebaseNotificationService';
import client from '../../services/contentful';
import { OFFER_CARD_IMAGE } from '../../constants/images';

const { width } = Dimensions.get('window');

const CATEGORY_ICONS = [
  { label: 'Hair', icon: 'cut-outline' },
  { label: 'Skin', icon: 'water-outline' },
  { label: 'Nails', icon: 'color-palette-outline' },
  { label: 'Makeup', icon: 'rose-outline' },
  { label: 'Spa', icon: 'leaf-outline' },
  { label: 'More', icon: 'apps-outline' },
];

const HomeScreen = ({ navigation }) => {
  const { userData, userId } = useContext(AuthContext);
  const [shops, setShops] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [offers, setOffers] = useState([]);
  const [specialOffers, setSpecialOffers] = useState([]);

  const welcomeMessage = userData?.username
    ? `Hello, ${userData.username.split(' ')[0]}!`
    : 'Welcome Back!';

  const fetchOffers = async () => {
    try {
      const response = await client.getEntries({ content_type: 'special_offers' });
      setOffers(response?.items ?? []);
    } catch {
      try {
        const r2 = await client.getEntries({ content_type: 'specialOffers' });
        setOffers(r2?.items ?? []);
      } catch {
        setOffers([]);
      }
    }
  };

  const fetchSpecialOffers = async () => {
    try {
      const response = await client.getEntries({ content_type: 'offers' });
      setSpecialOffers(response?.items ?? []);
    } catch {
      setSpecialOffers([]);
    }
  };

  const fetchShops = async () => {
    try {
      setLoading(true);
      const res = await getAllParlours();
      setShops(res || []);
    } catch {
      setShops([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationCount = async () => {
    if (userId) {
      const count = await getNotificationsCountByCustomerId(userId);
      setNotificationCount(count);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchShops(), fetchNotificationCount(), fetchOffers(), fetchSpecialOffers()]);
    setRefreshing(false);
  }, [userId]);

  useEffect(() => {
    fetchOffers();
    fetchSpecialOffers();
    (async () => {
      const granted = await getLocationPermission();
      if (!granted) return;
      Geolocation.getCurrentPosition(() => {}, () => {}, {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 10000,
      });
    })();
  }, []);

  useEffect(() => {
    fetchShops();
    fetchNotificationCount();
  }, [userId]);

  useEffect(() => {
    if (!loading && userData) {
      NotificationService.setupNotificationHandlers();
      NotificationService.requestNotificationPermission().then(granted => {
        if (granted) NotificationService.updateFCMToken(userData.id);
      });
    }
  }, [loading, userData]);

  const displayDate = dateStr => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  };

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.openDrawer()}>
            <Feather name="menu" size={22} color={dark} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.greeting}>{welcomeMessage}</Text>
            <Text style={styles.subGreeting}>Find your perfect look</Text>
          </View>

          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => navigation.navigate('AllNotificationScreen')}
          >
            <Ionicons name="notifications-outline" size={22} color={dark} />
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('SearchResultsScreen')}
          activeOpacity={0.8}
        >
          <Ionicons name="search-outline" size={20} color={textMuted} style={{ marginRight: 10 }} />
          <Text style={styles.searchPlaceholder}>Search salon, specialist...</Text>
          <View style={styles.searchFilter}>
            <Ionicons name="options-outline" size={18} color={primaryColor} />
          </View>
        </TouchableOpacity>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {CATEGORY_ICONS.map(cat => (
            <TouchableOpacity key={cat.label} style={styles.categoryPill} activeOpacity={0.7}>
              <View style={styles.categoryIcon}>
                <Ionicons name={cat.icon} size={20} color={primaryColor} />
              </View>
              <Text style={styles.categoryLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Special Offers Banner */}
        {offers?.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>#SpecialForYou</Text>
            </View>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={offers}
              keyExtractor={(_, i) => i.toString()}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              renderItem={({ item }) => (
                <LinearGradient
                  colors={[primaryDark, primaryColor]}
                  style={styles.offerCard}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.offerBadge}>
                    <Text style={styles.offerBadgeText}>Limited time!</Text>
                  </View>
                  <Text style={styles.offerTitle}>{item.fields?.title}</Text>
                  <Text style={styles.offerDiscount}>Upto {item.fields?.offer}% Off</Text>
                  <Text style={styles.offerDesc} numberOfLines={2}>
                    {item.fields?.offerDescription}
                  </Text>
                </LinearGradient>
              )}
            />
          </View>
        )}

        {/* Top Rated Salons */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Rated Salons</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <CardSkeleton />
          ) : shops && shops.length > 0 ? (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={shops}
              keyExtractor={item => String(item.id)}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => navigation.navigate('ParlourDetails', { parlourData: item })}
                  style={{ marginRight: 16 }}
                >
                  <Card
                    image={item.profileImage}
                    title={item.parlourName}
                    location={item.address}
                    rating={item.totalRating ?? 0}
                    status={isShopOpen(item.openingHours) ? 'Open' : 'Closed'}
                    servicesOffered={item.services?.map(s => s.serviceName).join(', ')}
                    offers={item.offers}
                    placeId={item?.placeId}
                  />
                </TouchableOpacity>
              )}
            />
          ) : (
            <EmptyComponent title="No shops available" />
          )}
        </View>

        {/* Special Offers Cards */}
        {specialOffers?.length > 0 && (
          <View style={[styles.section, { marginBottom: 30 }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Special Offers</Text>
            </View>
            {specialOffers.map((off, i) => (
              <TouchableOpacity key={i} style={styles.specialOfferCard} activeOpacity={0.8}>
                <View style={styles.specialOfferContent}>
                  <View style={styles.specialOfferTag}>
                    <Text style={styles.specialOfferTagText}>{off?.fields?.serviceName}</Text>
                  </View>
                  <Text style={styles.specialDiscount}>{off?.fields?.offer}% Off</Text>
                  <Text style={styles.specialDate}>
                    {off?.fields?.fromTime ? displayDate(off.fields.fromTime) : ''}
                    {off?.fields?.fromTime && off?.fields?.toTime ? ' – ' : ''}
                    {off?.fields?.toTime ? displayDate(off.fields.toTime) : ''}
                  </Text>
                </View>
                <Image source={{ uri: OFFER_CARD_IMAGE }} style={styles.specialOfferImage} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, marginLeft: 14 },
  greeting: { fontSize: 20, fontWeight: '700', color: dark },
  subGreeting: { fontSize: 13, color: textMuted, marginTop: 1 },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 14,
    backgroundColor: surfaceMuted,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchPlaceholder: { flex: 1, fontSize: 14, color: textMuted },
  searchFilter: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFF0F7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Categories
  categoryRow: { paddingHorizontal: 20, paddingBottom: 8 },
  categoryPill: { alignItems: 'center', marginRight: 18 },
  categoryIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#FFF0F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  categoryLabel: { fontSize: 12, color: dark, fontWeight: '500' },

  // Sections
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: dark },
  seeAll: { fontSize: 13, color: primaryColor, fontWeight: '600' },

  // Offer Cards (horizontal FlatList)
  offerCard: {
    width: 280,
    borderRadius: 18,
    padding: 20,
    marginRight: 14,
    shadowColor: primaryColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  offerBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  offerBadgeText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  offerTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 4 },
  offerDiscount: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 6 },
  offerDesc: { fontSize: 12, color: 'rgba(255,255,255,0.82)' },

  // Special Offer rows
  specialOfferCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: warmBg,
    borderRadius: 18,
    marginHorizontal: 20,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  specialOfferContent: { flex: 1, padding: 18 },
  specialOfferTag: {
    backgroundColor: '#FFE0EF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  specialOfferTagText: { fontSize: 11, color: primaryColor, fontWeight: '700' },
  specialDiscount: { fontSize: 26, fontWeight: '800', color: dark, marginBottom: 4 },
  specialDate: { fontSize: 13, color: textMuted },
  specialOfferImage: {
    width: width * 0.36,
    height: 130,
    resizeMode: 'cover',
  },
});

export default HomeScreen;
