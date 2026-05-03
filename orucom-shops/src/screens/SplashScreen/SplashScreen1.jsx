import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.elastic(1),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, scaleAnim]);

  const onAnimationFinish = () => {
    // navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <LottieView
          source={require('../../assets/animations/brand.json')}
          autoPlay
          loop={false}
          onAnimationFinish={onAnimationFinish}
          style={styles.lottieIcon}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#E84470',
  },
  lottieIcon: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  text: {
    fontSize: 22,
    fontWeight: '500',
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default SplashScreen;
