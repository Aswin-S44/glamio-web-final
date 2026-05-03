import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, Animated } from 'react-native';

const NotificationSkeletonItem = ({ opacity }) => (
  <View style={styles.item}>
    <Animated.View style={[styles.avatar, { opacity }]} />
    <View style={styles.textContainer}>
      <Animated.View style={[styles.lineShort, { opacity }]} />
      <Animated.View style={[styles.lineLong, { opacity }]} />
      <Animated.View style={[styles.lineSmall, { opacity }]} />
    </View>
  </View>
);

const AllNotificationsScreenSkeleton = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [opacity]);

  return (
    <View style={styles.container}>
      <FlatList
        data={[1, 2, 3, 4, 5]}
        keyExtractor={item => item.toString()}
        renderItem={() => <NotificationSkeletonItem opacity={opacity} />}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  list: { padding: 16 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
  },
  textContainer: { flex: 1, marginLeft: 16 },
  lineShort: {
    width: '60%',
    height: 12,
    backgroundColor: '#e0e0e0',
    marginBottom: 6,
    borderRadius: 6,
  },
  lineLong: {
    width: '80%',
    height: 12,
    backgroundColor: '#e0e0e0',
    marginBottom: 6,
    borderRadius: 6,
  },
  lineSmall: {
    width: '40%',
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
  },
});

export default AllNotificationsScreenSkeleton;
