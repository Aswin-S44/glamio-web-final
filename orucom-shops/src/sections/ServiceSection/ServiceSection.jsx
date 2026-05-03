import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { GREY } from '../../constants/colors';

const servicesData = [
  {
    id: '1',
    name: 'Hair Cut',
    types: '20 Types',
    image: require('../../assets/images/services/1.png'),
    active: true,
  },
  {
    id: '2',
    name: 'Fascial',
    types: '10 Types',
    image: require('../../assets/images/services/2.png'),
  },
  {
    id: '3',
    name: 'Hair Treatment',
    types: '15 Types',
    image: require('../../assets/images/services/3.png'),
  },
  {
    id: '4',
    name: 'Makeup',
    types: '30 Types',
    image: require('../../assets/images/services/4.png'),
  },
  {
    id: '5',
    name: 'Spa',
    types: '05 Types',
    image: require('../../assets/images/services/5.png'),
  },
];

const ServiceItem = ({ item }) => (
  <View style={styles.card}>
    <Image source={item.image} style={styles.cardImage} />
    <View style={styles.cardTextContainer}>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardSubtitle}>{item.types}</Text>
    </View>
    <TouchableOpacity
      style={[
        styles.bookButton,
        item.active ? styles.activeButton : styles.inactiveButton,
      ]}
    >
      <Text
        style={[
          styles.bookButtonText,
          item.active ? styles.activeButtonText : styles.inactiveButtonText,
        ]}
      >
        Book
      </Text>
    </TouchableOpacity>
  </View>
);

const ServiceSection = () => {
  const [activeTab, setActiveTab] = useState('Services');

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => setActiveTab('Services')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'Services' && styles.activeTabText,
            ]}
          >
            Services
          </Text>
          {activeTab === 'Services' && <View style={styles.activeTabLine} />}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('Offers')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'Offers' && styles.activeTabText,
            ]}
          >
            Offers
          </Text>
          {activeTab === 'Offers' && <View style={styles.activeTabLine} />}
        </TouchableOpacity>
      </View>

      {activeTab === 'Services' ? (
        <FlatList
          data={servicesData}
          renderItem={({ item }) => <ServiceItem item={item} />}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <FlatList
          data={servicesData}
          renderItem={({ item }) => <ServiceItem item={item} />}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const primaryColor = '#8E44AD';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tabText: {
    fontSize: 18,
    color: '#A0A0A0',
    marginHorizontal: 20,
    fontWeight: '500',
  },
  activeTabText: {
    color: primaryColor,
    fontWeight: '600',
  },
  activeTabLine: {
    height: 2,
    backgroundColor: primaryColor,
    width: '60%',
    alignSelf: 'center',
    marginTop: 8,
  },
  listContainer: {
    // paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GREY,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: 65,
    height: 65,
    borderRadius: 8,
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  bookButton: {
    paddingVertical: 8,
    paddingHorizontal: 22,
    borderRadius: 20,
  },
  activeButton: {
    backgroundColor: primaryColor,
  },
  inactiveButton: {
    backgroundColor: '#F3E5F5',
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  activeButtonText: {
    color: '#fff',
  },
  inactiveButtonText: {
    color: primaryColor,
  },
  offersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ServiceSection;
