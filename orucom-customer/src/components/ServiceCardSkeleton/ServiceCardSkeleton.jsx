import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GREY } from '../../constants/colors';

const ServiceCardSkeleton = () => {
  return (
    <View>
      <View style={styles.card}>
        <View style={styles.cardImage} />
        <View style={styles.cardTextContainer}>
          <View style={styles.cardTitle} />
          <View style={styles.cardSubtitle} />
        </View>
        <View style={styles.bookButton} />
      </View>
      <View style={styles.card}>
        <View style={styles.cardImage} />
        <View style={styles.cardTextContainer}>
          <View style={styles.cardTitle} />
          <View style={styles.cardSubtitle} />
        </View>
        <View style={styles.bookButton} />
      </View>
      <View style={styles.card}>
        <View style={styles.cardImage} />
        <View style={styles.cardTextContainer}>
          <View style={styles.cardTitle} />
          <View style={styles.cardSubtitle} />
        </View>
        <View style={styles.bookButton} />
      </View>
      <View style={styles.card}>
        <View style={styles.cardImage} />
        <View style={styles.cardTextContainer}>
          <View style={styles.cardTitle} />
          <View style={styles.cardSubtitle} />
        </View>
        <View style={styles.bookButton} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: '#d0d0d0',
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  cardTitle: {
    width: '70%',
    height: 20,
    backgroundColor: '#d0d0d0',
    marginBottom: 8,
    borderRadius: 4,
  },
  cardSubtitle: {
    width: '50%',
    height: 16,
    backgroundColor: '#d0d0d0',
    borderRadius: 4,
  },
  bookButton: {
    width: 80,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#d0d0d0',
  },
});

export default ServiceCardSkeleton;
