import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from 'react-native';

const galleryData = [
  { id: '1', image: require('../../assets/images/services/1.png') },
  {
    id: '2',
    image: require('../../assets/images/services/5.png'),
    type: 'add',
  },
  { id: '3', image: require('../../assets/images/services/3.png') },
  { id: '4', image: require('../../assets/images/services/4.png') },
  { id: '5', image: require('../../assets/images/services/2.png') },
  { id: '6', image: require('../../assets/images/services/6.png') },
];

const { width } = Dimensions.get('window');
const cardSize = (width - 24 * 2 - 16) / 2;

const GalleryItem = ({ item }) => {
  if (item.type === 'add') {
    return (
      <TouchableOpacity style={styles.card}>
        <Image source={item.image} style={styles.image} />
        <View style={styles.overlay}>
          <Text style={styles.plusIcon}>+</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card}>
      <Image source={item.image} style={styles.image} />
    </TouchableOpacity>
  );
};

const GallerySection = () => {
  return (
    <FlatList
      data={galleryData}
      renderItem={({ item }) => <GalleryItem item={item} />}
      keyExtractor={item => item.id}
      numColumns={2}
      contentContainerStyle={styles.container}
      columnWrapperStyle={styles.row}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
  },
  row: {
    justifyContent: 'space-between',
    flexDirection: 'column',
  },
  card: {
    width: '100%',
    height: cardSize,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(142, 68, 173, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIcon: {
    color: '#fff',
    fontSize: 60,
    fontWeight: '300',
  },
});

export default GallerySection;
