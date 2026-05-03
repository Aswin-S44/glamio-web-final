import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TextInput,
  FlatList,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Card from '../../components/Card/Card';
import { primaryColor } from '../../constants/colors';

const initialRegion = {
  latitude: 23.8759,
  longitude: 90.3795,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const mapMarkers = [
  { id: '1', coordinate: { latitude: 23.87, longitude: 90.37 } },
  { id: '2', coordinate: { latitude: 23.88, longitude: 90.39 } },
  { id: '3', coordinate: { latitude: 23.86, longitude: 90.38 } },
];

const parlourData = [
  {
    id: '1',
    title: 'Live Style Parlour',
    location: 'Captown City',
    rating: 4.0,
    status: 'Open',
    image: require('../../assets/images/services/6.png'),
  },
  {
    id: '2',
    title: 'Beauty Girls',
    location: 'Mascot Town',
    rating: 4.0,
    status: 'Close',
    image: require('../../assets/images/services/1.png'),
  },
  {
    id: '3',
    title: 'Modern Spa',
    location: 'Downtown',
    rating: 4.5,
    status: 'Open',
    image: require('../../assets/images/services/5.png'),
  },
];

const NearByShopsList = () => {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={primaryColor} barStyle="light-content" />
      {/* <MapView style={styles.map} initialRegion={initialRegion}>
        {mapMarkers.map(marker => (
          <Marker key={marker.id} coordinate={marker.coordinate}>
            <View style={styles.markerOuter}>
              <View style={styles.markerInner} />
            </View>
          </Marker>
        ))}
      </MapView> */}

      <View style={styles.header}>
        <View style={styles.searchBar}>
          <TextInput
            placeholder="Spa, Facial, Makeup"
            placeholderTextColor="#FFFFFF"
            style={styles.searchInput}
          />
          <Ionicons name="search" size={24} color="#fff" />
        </View>
      </View>

      <View style={styles.cardListContainer}>
        <FlatList
          data={parlourData}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <Card
              image={item.image}
              title={item.title}
              location={item.location}
              rating={item.rating}
              status={item.status}
            />
          )}
          contentContainerStyle={styles.cardListContent}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
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
  searchInput: {
    flex: 1,
    height: 50,
    color: '#fff',
    fontSize: 16,
  },
  markerOuter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(142, 68, 173, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: primaryColor,
    borderWidth: 2,
    borderColor: '#fff',
  },
  cardListContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
  cardListContent: {
    paddingLeft: 10,
  },
});

export default NearByShopsList;
