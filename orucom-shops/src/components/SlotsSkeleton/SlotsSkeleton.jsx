import { View, StyleSheet } from 'react-native';
import React from 'react';

const SlotsSkeleton = () => {
  return (
    <View style={styles.container}>
      <View style={styles.calendarSkeleton}>
        <View style={styles.calendarHeader}>
          <View style={styles.skeletonSquare} />
          <View style={styles.skeletonTextMedium} />
          <View style={styles.skeletonSquare} />
        </View>
        <View style={styles.weekDays}>
          {Array.from({ length: 7 }).map((_, index) => (
            <View key={index} style={styles.skeletonCircleSmall} />
          ))}
        </View>
        <View style={styles.daysGrid}>
          {Array.from({ length: 42 }).map((_, index) => (
            <View key={index} style={styles.skeletonCircle} />
          ))}
        </View>
      </View>

      <View style={styles.dateHeader}>
        <View style={styles.skeletonTextLarge} />
        <View style={styles.skeletonButton} />
      </View>

      <View style={styles.slotsContainer}>
        {Array.from({ length: 3 }).map((_, index) => (
          <View key={index} style={styles.slotItemSkeleton}>
            <View style={styles.slotContent}>
              <View style={styles.skeletonTextMedium} />
              <View style={styles.skeletonActions}>
                <View style={styles.skeletonIcon} />
                <View style={styles.skeletonIcon} />
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  calendarSkeleton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  slotsContainer: {
    flex: 1,
  },
  slotItemSkeleton: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderLeftWidth: 5,
    borderLeftColor: '#F0F0F0',
  },
  slotContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skeletonActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonSquare: {
    width: 40,
    height: 40,
    backgroundColor: 'whitesmoke',
    borderRadius: 6,
  },
  skeletonCircle: {
    width: 40,
    height: 40,
    backgroundColor: 'whitesmoke',
    borderRadius: '50%',
    margin: 4,
  },
  skeletonCircleSmall: {
    width: 25,
    height: 25,
    backgroundColor: '#E0E0E0',
    borderRadius: 12.5,
    margin: 2,
  },
  skeletonTextLarge: {
    width: 180,
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  skeletonTextMedium: {
    width: 120,
    height: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  skeletonButton: {
    width: 100,
    height: 36,
    backgroundColor: '#E0E0E0',
    borderRadius: 25,
  },
  skeletonIcon: {
    width: 20,
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    marginLeft: 15,
  },
});

export default SlotsSkeleton;
