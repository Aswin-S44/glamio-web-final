import { View, Text, StyleSheet, Image } from 'react-native';
import React from 'react';

const EmptyComponent = ({
  title = 'No Data Available',
  description = "There's nothing to show here yet",
}) => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/forgot-password.png')}
        style={styles.image}
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 30,
    resizeMode: 'contain',
    tintColor: '#D3D3D3',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4A4A4A',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F7F7F',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default EmptyComponent;
