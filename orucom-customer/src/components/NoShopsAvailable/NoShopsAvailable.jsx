import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

const NoShopsAvailable = () => {
  return (
    <View style={styles.container}>
      <Text>NoShopsAvailable</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 40,
  },
});

export default NoShopsAvailable;
