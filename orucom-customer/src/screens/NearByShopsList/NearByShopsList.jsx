import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  StatusBar,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { getAllParlours } from '../../apis/services';
import { AuthContext } from '../../context/AuthContext';
import { primaryColor } from '../../constants/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CardSkeleton from '../../components/CardSkeleton/CardSkeleton';
import NoShopsAvailable from '../../components/NoShopsAvailable/NoShopsAvailable';
import Card from '../../components/Card/Card';
import { isShopOpen } from '../../utils/utils';
import LocationEnabler from '../../../android/app/src/LocationEnabler';
import { GOOGLE_MAPS_API_KEY, CLOUDINARY_DOC } from '@env';

const NearByShopsList = ({ navigation }) => {
  const [region, setRegion] = useState(null);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [shops, setShops] = useState([]);
  const [loadingShops, setLoadingShops] = useState(true);
  const mapRef = useRef(null);
  const { user, userData } = useContext(AuthContext);
  const [locationStatus, setLocationStatus] = useState('Checking...');

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = val => (val * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c).toFixed(1);
  };

  const checkLocation = () => {
    Geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        const userRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };

        setRegion(userRegion);
        setLocationEnabled(true);

        setShops(prevShops => {
          if (!prevShops || prevShops.length === 0) return prevShops;
          return prevShops.map(shop => {
            if (shop.geolocation) {
              return {
                ...shop,
                distance: calculateDistance(
                  latitude,
                  longitude,
                  shop.geolocation.latitude,
                  shop.geolocation.longitude,
                ),
              };
            }
            return shop;
          });
        });

        if (mapRef.current) {
          const markers = shops
            .filter(shop => shop.geolocation)
            .map(shop => ({
              latitude: shop.geolocation.latitude,
              longitude: shop.geolocation.longitude,
            }));
          markers.push({ latitude, longitude });
          if (markers.length > 0) {
            mapRef.current.fitToCoordinates(markers, {
              edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
              animated: true,
            });
          }
        }
      },
      error => {
        setLocationEnabled(false);
      },
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 10000 },
    );
  };

  const checkLocationStatus = async () => {
    if (Platform.OS === 'android') {
      try {
        const isEnabled = await LocationEnabler.isLocationEnabled();
        setLocationStatus(isEnabled ? 'On' : 'Off');
        if (isEnabled) setLocationEnabled(true);
      } catch (e) {
        setLocationStatus('Error');
      }
    }
  };

  const enableLocation = async () => {
    if (Platform.OS === 'android') {
      try {
        await LocationEnabler.promptForEnableLocation();
        await checkLocationStatus();
        checkLocation();
      } catch (e) {}
    }
  };

  useEffect(() => {
    const init = async () => {
      await checkLocationStatus();
      await enableLocation();
    };
    init();
  }, []);

  useEffect(() => {
    const requestPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        setPermissionGranted(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        setPermissionGranted(true);
      }
    };
    requestPermission();
  }, []);

  useEffect(() => {
    let interval;
    if (permissionGranted) {
      checkLocation();
      interval = setInterval(() => {
        checkLocation();
      }, 15000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [permissionGranted]);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await getAllParlours();
        setShops(res || []);
      } catch (err) {
      } finally {
        setLoadingShops(false);
      }
    };
    fetchShops();
  }, []);

  if (!permissionGranted) {
    return (
      <View style={styles.center}>
        <Text>Location permission is required</Text>
      </View>
    );
  }

  if (!locationEnabled) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={primaryColor} barStyle="light-content" />
        <View style={styles.center}>
          <ActivityIndicator size="small" color={primaryColor} />
          <Text style={{ marginTop: 10, color: '#666' }}>
            Waiting for location...
          </Text>
          {/* <TouchableOpacity onPress={enableLocation} style={styles.retryButton}>
            <Text style={{ color: '#fff' }}>Enable Location</Text>
          </TouchableOpacity> */}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={primaryColor} barStyle="light-content" />

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={
          region || {
            latitude: 20.5937,
            longitude: 78.9629,
            latitudeDelta: 10,
            longitudeDelta: 10,
          }
        }
        showsUserLocation
        zoomEnabled
      >
        {shops.map(
          shop =>
            shop.geolocation && (
              <Marker
                key={shop.id}
                coordinate={{
                  latitude: shop.geolocation.latitude,
                  longitude: shop.geolocation.longitude,
                }}
                title={`${shop.parlourName}`}
              />
            ),
        )}
      </MapView>

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('SearchResultsScreen')}
        >
          <TextInput
            placeholder="Spa, Facial, Makeup"
            placeholderTextColor="#FFFFFF"
            style={styles.searchInput}
            editable={false}
          />
          <Ionicons name="search" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardListContainer}>
        {loadingShops ? (
          <CardSkeleton />
        ) : shops.length === 0 ? (
          <NoShopsAvailable />
        ) : (
          <FlatList
            data={[...shops].sort(
              (a, b) => (a.distance || Infinity) - (b.distance || Infinity),
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('ParlourDetails', {
                    parlourData: item,
                  })
                }
              >
                <Card
                  image={item?.profileImage}
                  title={item?.parlourName}
                  location={item?.address}
                  rating={item?.totalRating ?? 0}
                  status={isShopOpen(item?.openingHours) ? 'open' : 'closed'}
                  distance={
                    item?.distance
                      ? `${item.distance.toFixed(2)} km`
                      : 'Calculating...'
                  }
                />
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.cardListContent}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  map: { ...StyleSheet.absoluteFillObject },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: primaryColor,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  searchInput: { flex: 1, height: 50, color: '#fff', fontSize: 16 },
  cardListContainer: { position: 'absolute', bottom: 20, left: 0, right: 0 },
  cardListContent: { paddingLeft: 10 },
  retryButton: {
    marginTop: 20,
    backgroundColor: primaryColor,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
});

export default NearByShopsList;
