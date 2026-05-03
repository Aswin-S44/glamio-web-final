import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { primaryColor } from '../../constants/colors';

const ConfirmationWaitingScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../../assets/images/onboard/1.png')}
          style={styles.image}
        />
        <Text style={styles.title}>Branding For Your Parlour</Text>
        <Text style={styles.description}>Waiting for Admin to onboard you</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#8a2be2',
  },
  signInButton: {
    backgroundColor: primaryColor,
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 30,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ConfirmationWaitingScreen;
