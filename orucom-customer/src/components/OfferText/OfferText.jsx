import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

const OfferText = ({ regularPrice, offerPrice }) => {
  const discount = Math.round(
    ((regularPrice - offerPrice) / regularPrice) * 100,
  );

  return (
    <View style={styles.row}>
      <Text style={styles.discount}>{discount}% Off </Text>
      <Text style={styles.regularPrice}>{regularPrice}</Text>
      <Text style={styles.offerPrice}> {offerPrice}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'grey',
    marginRight: 5,
  },
  regularPrice: {
    fontSize: 14,
    color: 'gray',
    textDecorationLine: 'line-through',
    marginRight: 5,
  },
  offerPrice: {
    fontSize: 14,
    fontWeight: '400',
    color: 'gray',
  },
});

export default OfferText;
