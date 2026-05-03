import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import React, { useContext, useEffect, useState, useCallback } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import Toast from 'react-native-toast-message';
import firestore from '@react-native-firebase/firestore';
import { primaryColor } from '../../constants/colors'; // Ensure this color is strong (e.g., #6C63FF or #2A2D3E)
import { AuthContext } from '../../context/AuthContext';
import {
  getAppointmentsByShopId,
  getAppointmentStats,
} from '../../apis/services';
import { COLLECTIONS } from '../../constants/collections';
import AntDesign from 'react-native-vector-icons/AntDesign';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user, userData } = useContext(AuthContext);
  const [totalServices, setTotalServices] = useState(0);
  const [pendingServices, setPendingServices] = useState(0);
  const [completedServices, setCompletedServices] = useState(0);
  const [weeklyData, setWeeklyData] = useState([]);
  const [maxValue, setMaxValue] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [upcomingBookings, setUpcomingBookings] = useState([]);

  // --- LOGIC SAME AS BEFORE ---
  useEffect(() => {
    if (user && user.uid) {
      const fetchNotificationCount = async () => {
        const unsubscribe = firestore()
          .collection(COLLECTIONS.NOTIFICATIONS)
          .where('toId', '==', user.uid)
          .where('isRead', '==', false)
          .onSnapshot(
            snapshot => setNotificationCount(snapshot.size),
            err => console.error(err),
          );
        return () => unsubscribe();
      };
      fetchNotificationCount();
    }
  }, [user]);

  const fetchServiceData = useCallback(async () => {
    if (user && user.uid) {
      setRefreshing(true);
      try {
        const statsRes = await getAppointmentStats(user.uid);
        if (statsRes) {
          setTotalServices(statsRes.totalAppointments);
          setPendingServices(statsRes.pendingCount);
          setCompletedServices(statsRes.completedCount);
        }

        const appointmentsRes = await getAppointmentsByShopId(user.uid);
        if (appointmentsRes) {
          // Chart Logic
          const sevenDaysAgo = moment().subtract(6, 'days').startOf('day');
          const dailyEarnings = {};
          for (let i = 0; i < 7; i++) {
            const date = moment(sevenDaysAgo).add(i, 'days');
            dailyEarnings[date.format('YYYY-MM-DD')] = {
              day: date.format('ddd'), // Mon, Tue
              value: 0,
            };
          }

          appointmentsRes.forEach(appointment => {
            if (
              appointment.appointmentStatus === 'confirmed' &&
              appointment.totalAmount
            ) {
              const confirmedDate = moment(appointment.confirmedAt.toDate());
              if (
                confirmedDate.isSameOrAfter(sevenDaysAgo, 'day') &&
                confirmedDate.isSameOrBefore(moment(), 'day')
              ) {
                const dateKey = confirmedDate.format('YYYY-MM-DD');
                if (dailyEarnings[dateKey])
                  dailyEarnings[dateKey].value += appointment.totalAmount;
              }
            }
          });

          const graphData = Object.values(dailyEarnings);
          const maxVal = Math.max(...graphData.map(item => item.value), 1);
          setWeeklyData(graphData);
          setMaxValue(maxVal);

          // Upcoming Logic
          const now = moment();
          const upcoming = appointmentsRes
            .filter(
              appointment =>
                appointment.appointmentStatus === 'confirmed' &&
                moment(appointment.preferredDate).isSameOrAfter(now, 'day'),
            )
            .sort((a, b) =>
              moment(a.preferredDate).diff(moment(b.preferredDate)),
            )
            .slice(0, 4); // Show 4 items
          setUpcomingBookings(upcoming);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setRefreshing(false);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchServiceData();
  }, [fetchServiceData]);

  // --- HELPER COMPONENTS ---
  const StatBox = ({ label, value, icon, color, bg }) => (
    <View style={[styles.statBox, { backgroundColor: bg }]}>
      <View style={styles.statTopRow}>
        <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
        {/* Optional percentage or indicator could go here */}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />

      {/* === DARK MODERN HEADER === */}
      <View style={styles.headerBackground}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Good Morning,</Text>
            <Text style={styles.username}>{userData?.parlourName ?? '_'}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => navigation.navigate('AllNotificationScreen')}
              style={styles.iconBtn}
            >
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              {notificationCount > 0 && <View style={styles.dot} />}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.openDrawer()}
              style={styles.hamburgerIconContainer}
            >
              <View style={[styles.hamburgerLine, { width: 25 }]} />
              <View style={[styles.hamburgerLine, { width: 20 }]} />
              <View style={[styles.hamburgerLine, { width: 25 }]} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchServiceData}
            tintColor={primaryColor}
          />
        }
      >
        {/* === FLOATING STATS GRID === */}
        <View style={styles.statsContainer}>
          <StatBox
            label="Total Requests"
            value={totalServices}
            icon="people"
            color="#4F46E5"
            bg="#EEF2FF"
          />
          <StatBox
            label="Pending"
            value={pendingServices}
            icon="time"
            color="#D97706"
            bg="#FEF3C7"
          />
          <StatBox
            label="Completed"
            value={completedServices}
            icon="checkmark-done"
            color="#059669"
            bg="#ECFDF5"
          />
        </View>

        {/* === REVENUE CHART (Clean Bar Design) === */}
        <View style={styles.chartSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Revenue Analytics</Text>
            <Ionicons name="bar-chart-outline" size={20} color="#666" />
          </View>

          <View style={styles.chartCard}>
            <View style={styles.chartContent}>
              {weeklyData.map((d, i) => {
                const h = (d.value / maxValue) * 100;
                return (
                  <View key={i} style={styles.barCol}>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${h}%`,
                            backgroundColor: h > 0 ? '#1A1A1A' : '#F3F4F6',
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.barLabel}>{d.day.charAt(0)}</Text>
                  </View>
                );
              })}
            </View>
            <View style={styles.chartFooter}>
              <Text style={styles.chartTotal}>Total Weekly Volume</Text>
              {/* Calculate roughly or just show visual */}
            </View>
          </View>
        </View>

        {/* === TIMELINE SCHEDULE === */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Appointments</Text>
        </View>

        <View style={styles.timelineContainer}>
          {upcomingBookings.length > 0 ? (
            upcomingBookings.map((item, index) => {
              const isLast = index === upcomingBookings.length - 1;
              return (
                <View key={index} style={styles.timelineRow}>
                  {/* Time Column */}
                  <View style={styles.timeColumn}>
                    <Text style={styles.timeText}>
                      {item.selectedTime.split(' ')[0]}
                    </Text>
                    <Text style={styles.ampmText}>
                      {item.selectedTime.split(' ')[1]}
                    </Text>
                  </View>

                  {/* Line Graphic */}
                  <View style={styles.lineWrapper}>
                    <View style={styles.dotCircle} />
                    {!isLast && <View style={styles.line} />}
                  </View>

                  {/* Card */}
                  <View style={styles.cardWrapper}>
                    <View style={styles.bookingCard}>
                      <View style={styles.bookingHeader}>
                        <Text style={styles.serviceName}>
                          {item.serviceName}
                        </Text>
                        <View style={styles.statusBadge}>
                          <Text style={styles.statusText}>Confirmed</Text>
                        </View>
                      </View>
                      <Text style={styles.customerName}>
                        Client:{' '}
                        <Text style={{ fontWeight: '600', color: '#333' }}>
                          {item.customer?.fullName || 'Guest'}
                        </Text>
                      </Text>
                      <View style={styles.cardFooter}>
                        <View style={styles.footerItem}>
                          <Ionicons
                            name="calendar-outline"
                            size={14}
                            color="#666"
                          />
                          <Text style={styles.footerText}>
                            {moment(item.preferredDate).format('MMM DD')}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={50} color="#ccc" />
              <Text style={styles.emptyText}>
                No appointments scheduled for today
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  // HEADER
  headerBackground: {
    backgroundColor: primaryColor, // Dark sleek header
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 80, // Extra padding for float effect
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '500',
  },
  username: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    maxWidth: 260,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    marginRight: 15,
    padding: 5,
  },
  dot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#09E34D',
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  profileImg: {
    width: '100%',
    height: '100%',
  },
  searchFakeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  searchText: {
    color: 'rgba(255,255,255,0.5)',
    marginLeft: 10,
    fontSize: 14,
  },

  // SCROLL AREA
  mainScroll: {
    flex: 1,
    marginTop: -50, // Pull content up
  },
  scrollContent: {
    paddingHorizontal: 20,
  },

  // STATS GRID
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statBox: {
    width: '31%',
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
    alignItems: 'flex-start',
  },
  statTopRow: {
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },

  // TIMELINE STYLES
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  seeAll: {
    color: '#666',
    fontSize: 13,
    fontWeight: '600',
  },
  timelineContainer: {
    paddingLeft: 5,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  timeColumn: {
    width: 50,
    alignItems: 'center',
    paddingTop: 15,
  },
  timeText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1A1A1A',
  },
  ampmText: {
    fontSize: 12,
    color: '#999',
    textTransform: 'uppercase',
  },
  lineWrapper: {
    alignItems: 'center',
    width: 30,
    marginHorizontal: 5,
  },
  dotCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: primaryColor, // Use your primary color here
    borderWidth: 3,
    borderColor: '#E5E7EB',
    marginTop: 20,
    zIndex: 2,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: -2, // Connect dots
  },
  cardWrapper: {
    flex: 1,
    paddingBottom: 20,
  },
  bookingCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  statusBadge: {
    backgroundColor: '#F0FFF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C6F6D5',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#276749',
  },
  customerName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 10,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  emptyText: {
    marginTop: 10,
    color: '#999',
  },

  // CHART SECTION
  chartSection: {
    marginTop: 10,
  },
  chartCard: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  chartContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 160,
    alignItems: 'flex-end',
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    height: 130,
    width: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  barLabel: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  chartFooter: {
    marginTop: 20,
    alignItems: 'center',
  },
  chartTotal: {
    color: '#999',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  hamburgerIconContainer: {
    padding: 5,
  },
  hamburgerLine: {
    height: 3,
    backgroundColor: '#fff',
    borderRadius: 2,
    marginVertical: 2,
  },
});

export default HomeScreen;
