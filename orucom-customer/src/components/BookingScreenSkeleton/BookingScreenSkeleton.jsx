import React from 'react';
import { View, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { primaryColor } from '../../constants/colors';

const BookingScreenSkeleton = () => {
  return (
    <View style={styles.outerContainer}>
      <StatusBar backgroundColor={primaryColor} barStyle="light-content" />

      <View style={styles.backButton} />

      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.mainTitle} />

          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitle} />
            <View style={styles.navIcons}>
              <View style={styles.navIcon} />
              <View style={styles.navIcon} />
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.expertScroll}
          >
            {[...Array(4)].map((_, index) => (
              <View key={index} style={styles.expertCard}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar} />
                </View>
                <View style={styles.expertName} />
              </View>
            ))}
          </ScrollView>

          <View style={styles.sectionTitle} />
          <View style={styles.datePicker}>
            <View style={styles.dateText} />
            <View style={styles.calendarIcon} />
          </View>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitle} />
            <View style={styles.legendContainer}>
              <View style={styles.legendDot} />
              <View style={styles.legendText} />
              <View style={styles.legendDot} />
              <View style={styles.legendText} />
            </View>
          </View>
          <View style={styles.timeSlotsContainer}>
            {[...Array(13)].map((_, index) => (
              <View key={index} style={styles.timeSlot} />
            ))}
          </View>

          <View style={styles.sectionTitle} />
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View
                style={[styles.tableCell, styles.tableHeaderText, { flex: 2 }]}
              />
              <View style={[styles.tableCell, styles.tableHeaderText]} />
              <View
                style={[
                  styles.tableCell,
                  styles.tableHeaderText,
                  { textAlign: 'right' },
                ]}
              />
            </View>
            {[...Array(1)].map((_, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={[styles.tableCell, { flex: 2 }]} />
                <View style={styles.tableCell} />
                <View style={[styles.tableCell, { textAlign: 'right' }]} />
              </View>
            ))}
          </View>
        </ScrollView>
        <View style={styles.nextButton} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: primaryColor,
  },
  backButton: {
    position: 'absolute',
    top: 55,
    left: 20,
    width: 80,
    height: 24,
    backgroundColor: primaryColor,
    borderRadius: 4,
    zIndex: 10,
  },
  container: {
    flex: 1,
    marginTop: 100,
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 25,
  },
  mainTitle: {
    width: '70%',
    height: 30,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    alignSelf: 'center',
    marginTop: 25,
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    width: '60%',
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  navIcons: {
    flexDirection: 'row',
  },
  navIcon: {
    width: 20,
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginLeft: 5,
  },
  expertScroll: {
    paddingBottom: 25,
  },
  expertCard: {
    alignItems: 'center',
    marginRight: 20,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 8,
    backgroundColor: '#e0e0e0',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
    backgroundColor: '#d0d0d0',
  },
  expertName: {
    width: 80,
    height: 16,
    backgroundColor: '#d0d0d0',
    borderRadius: 4,
  },
  datePicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
  },
  dateText: {
    width: '60%',
    height: 18,
    backgroundColor: '#d0d0d0',
    borderRadius: 4,
  },
  calendarIcon: {
    width: 22,
    height: 22,
    backgroundColor: '#d0d0d0',
    borderRadius: 4,
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
    marginLeft: 10,
    backgroundColor: '#d0d0d0',
  },
  legendText: {
    width: 60,
    height: 14,
    backgroundColor: '#d0d0d0',
    borderRadius: 4,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  timeSlot: {
    width: '23%',
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
    height: 45,
  },
  table: {
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 12,
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tableHeader: {
    backgroundColor: '#FAFAFA',
  },
  tableCell: {
    flex: 1,
    height: 18,
    backgroundColor: '#d0d0d0',
    borderRadius: 4,
  },
  nextButton: {
    backgroundColor: '#e0e0e0',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginVertical: 10,
    height: 60,
  },
});

export default BookingScreenSkeleton;
