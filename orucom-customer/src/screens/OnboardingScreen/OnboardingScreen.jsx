import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { primaryColor } from '../../constants/colors';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    key: '1',
    title: 'Experienced in Beautifying',
    text: 'Aenean leoigula porttitor eu,consequat vitae eleifend acenimliquam lorem ante dapibus in viverra quis feugiat',
    image: require('../../assets/images/old/onboard/1.png'),
  },
  {
    key: '2',
    title: 'Rewarded Services',
    text: 'Aenean leoigula porttitor eu,consequat vitae eleifend acenimliquam lorem ante dapibus in viverra quis feugiat',
    image: require('../../assets/images/old/onboard/2.png'),
  },
  {
    key: '3',
    title: 'Trained & Skillful Staffs',
    text: 'Aenean leoigula porttitor eu,consequat vitae eleifend acenimliquam lorem ante dapibus in viverra quis feugiat',
    image: require('../../assets/images/old/onboard/3.png'),
  },
];

const Slide = ({ item }) => (
  <View style={styles.slide}>
    <Image source={item.image} style={styles.mainImage} />
    <Text style={styles.title}>{item.title}</Text>
    <Text style={styles.text}>{item.text}</Text>
  </View>
);

const Pager = ({ data, currentIndex }) => (
  <View style={styles.pagerContainer}>
    {data.map((_, i) => (
      <View
        key={i}
        style={[
          styles.dot,
          i === currentIndex ? styles.dotActive : styles.dotInactive,
        ]}
      />
    ))}
  </View>
);

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={({ item }) => <Slide item={item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.key}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />
      <View style={styles.footer}>
        <Pager data={slides} currentIndex={currentIndex} />
        {currentIndex === slides.length - 1 && (
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={() => navigation.replace('Welcome')}
          >
            <Text style={styles.getStartedButtonText}>GET STARTED</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  slide: { width, alignItems: 'center', justifyContent: 'center', padding: 20 },
  mainImage: {
    width: width * 0.7,
    height: height * 0.3,
    resizeMode: 'contain',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  text: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  footer: { padding: 20, paddingBottom: 40 },
  pagerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dot: { height: 10, borderRadius: 5, marginHorizontal: 4 },
  dotActive: { backgroundColor: primaryColor, width: 25 },
  dotInactive: { backgroundColor: '#D1C4E9', width: 10 },
  getStartedButton: {
    backgroundColor: primaryColor,
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
  },
  getStartedButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default OnboardingScreen;
