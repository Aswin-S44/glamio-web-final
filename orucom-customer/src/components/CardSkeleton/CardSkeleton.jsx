import React from 'react';
import { View, StyleSheet } from 'react-native';

const CardSkeleton = () => {
  return (
    <View style={styles.featuredContainer}>
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <View style={styles.cardImage} />
          <View style={styles.badgesContainer}>
            <View style={styles.ratingBadge} />
            <View style={styles.statusBadge} />
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.cardTitle} />
          <View style={styles.cardLocation} />
        </View>
      </View>
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <View style={styles.cardImage} />
          <View style={styles.badgesContainer}>
            <View style={styles.ratingBadge} />
            <View style={styles.statusBadge} />
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.cardTitle} />
          <View style={styles.cardLocation} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 220,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    margin: 10,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#d0d0d0',
  },
  badgesContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
  },
  ratingBadge: {
    width: 70,
    height: 25,
    borderRadius: 20,
    backgroundColor: '#d0d0d0',
    marginRight: 6,
  },
  statusBadge: {
    width: 80,
    height: 25,
    borderRadius: 20,
    backgroundColor: '#d0d0d0',
  },
  detailsContainer: {
    padding: 15,
  },
  cardTitle: {
    width: '80%',
    height: 20,
    backgroundColor: '#d0d0d0',
    marginBottom: 8,
    borderRadius: 4,
  },
  cardLocation: {
    width: '60%',
    height: 16,
    backgroundColor: '#d0d0d0',
    borderRadius: 4,
  },
  featuredContainer: {
    flexDirection: 'row',
  },
});

export default CardSkeleton;
