import { View, StyleSheet } from 'react-native';
import React from 'react';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const AppointmentHistorySkeleton = () => {
  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <SkeletonPlaceholder>
          <View style={styles.mainTitleSkeleton} />
          <View style={styles.headerRowSkeleton} />
          {[...Array(5)].map((_, index) => (
            <View key={index} style={styles.itemContainerSkeleton}>
              <View style={styles.expertColumnSkeleton}>
                <View style={styles.avatarSkeleton} />
                <View>
                  <View style={styles.expertNameSkeleton} />
                  <View style={styles.expertSpecialtySkeleton} />
                </View>
              </View>
              <View style={styles.descriptionColumnSkeleton}>
                <View style={styles.descriptionTextSkeleton} />
                <View style={styles.descriptionTextSkeleton} />
                <View style={styles.descriptionTextSkeleton} />
              </View>
              <View style={styles.statusColumnSkeleton}>
                <View style={styles.statusBadgeSkeleton} />
              </View>
            </View>
          ))}
        </SkeletonPlaceholder>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#8E44AD',
  },
  container: {
    flex: 1,
    marginTop: 80,
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 25,
  },
  mainTitleSkeleton: {
    width: '60%',
    height: 26,
    borderRadius: 4,
    alignSelf: 'center',
    marginVertical: 25,
  },
  headerRowSkeleton: {
    height: 50,
    borderRadius: 12,
    marginBottom: 10,
  },
  itemContainerSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  expertColumnSkeleton: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarSkeleton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 10,
  },
  expertNameSkeleton: {
    width: 100,
    height: 14,
    borderRadius: 4,
    marginBottom: 5,
  },
  expertSpecialtySkeleton: {
    width: 80,
    height: 13,
    borderRadius: 4,
  },
  descriptionColumnSkeleton: {
    flex: 1.2,
  },
  descriptionTextSkeleton: {
    width: '90%',
    height: 12,
    borderRadius: 4,
    marginBottom: 8,
  },
  statusColumnSkeleton: {
    flex: 0.8,
    alignItems: 'flex-end',
  },
  statusBadgeSkeleton: {
    width: 70,
    height: 28,
    borderRadius: 15,
  },
});

export default AppointmentHistorySkeleton;
