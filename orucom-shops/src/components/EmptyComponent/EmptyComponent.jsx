import { View, Text, StyleSheet, Image } from 'react-native';
import React from 'react';

const EmptyComponent = ({title='No Data Available', description="There's nothing to show here yet"}) => {
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
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default EmptyComponent;
