import React from 'react';
import { View, StyleSheet } from 'react-native';
import { primaryColor } from '../../constants/colors';

const ProfileScreenSkeleton = () => {
  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <View style={styles.titleSkeleton} />
        <View style={styles.profileSection}>
          <View style={styles.avatarSkeleton} />
          <View style={styles.nameSkeleton} />
          <View style={styles.specialtySkeleton} />
          <View style={styles.ratingSkeleton} />
        </View>
        <View style={styles.menuSection}>
          <View style={styles.menuItemSkeleton} />
          <View style={styles.menuItemSkeleton} />
          <View style={styles.menuItemSkeleton} />
          <View style={styles.menuItemSkeleton} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: primaryColor,
  },
  container: {
    flex: 1,
    marginTop: 80,
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 25,
  },
  titleSkeleton: {
    width: 120,
    height: 28,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    alignSelf: 'center',
    marginTop: 25,
    marginBottom: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarSkeleton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E0E0E0',
    marginBottom: 15,
  },
  nameSkeleton: {
    width: 150,
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    marginBottom: 8,
  },
  specialtySkeleton: {
    width: 180,
    height: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    marginBottom: 8,
  },
  ratingSkeleton: {
    width: 100,
    height: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    marginTop: 8,
  },
  menuSection: {
    width: '100%',
  },
  menuItemSkeleton: {
    height: 60,
    backgroundColor: '#E0E0E0',
    borderRadius: 15,
    marginBottom: 15,
  },
});

export default ProfileScreenSkeleton;
