import React from 'react';
import { View, StyleSheet } from 'react-native';
import { primaryColor } from '../../constants/colors';

const AllAppointmentsScreenSkeleton = () => {
  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <View style={styles.mainTitle} />
        <View style={styles.headerRow}>
          <View style={[styles.headerText, { flex: 1.5 }]} />
          <View style={[styles.headerText, { flex: 1.2 }]} />
          <View
            style={[styles.headerText, { flex: 0.8, alignSelf: 'flex-end' }]}
          />
        </View>
        {[...Array(5)].map((_, index) => (
          <View key={index} style={styles.itemContainer}>
            <View style={styles.expertColumn}>
              <View style={styles.avatar} />
              <View>
                <View style={styles.expertName} />
                <View style={styles.expertSpecialty} />
              </View>
            </View>
            <View style={styles.descriptionColumn}>
              <View style={styles.descriptionText} />
              <View style={styles.descriptionText} />
              <View style={styles.descriptionText} />
            </View>
            <View style={styles.statusColumn}>
              <View style={styles.statusBadge} />
            </View>
          </View>
        ))}
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
  mainTitle: {
    height: 30,
    width: '70%',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: 25,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  headerText: {
    height: 18,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  expertColumn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 10,
    backgroundColor: '#e0e0e0',
  },
  expertName: {
    height: 16,
    width: 100,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 5,
  },
  expertSpecialty: {
    height: 14,
    width: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  descriptionColumn: {
    flex: 1.2,
  },
  descriptionText: {
    height: 14,
    width: '80%',
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 6,
  },
  statusColumn: {
    flex: 0.8,
    alignItems: 'flex-end',
  },
  statusBadge: {
    width: 70,
    height: 25,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
  },
});

export default AllAppointmentsScreenSkeleton;
