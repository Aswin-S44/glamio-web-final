import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  Image,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { AuthContext } from '../../context/AuthContext';
import EmptyComponent from '../../components/EmptyComponent/EmptyComponent';
import { NO_IMAGE } from '../../constants/images';
import { convertFIrstCharToUpper, formatText } from '../../utils/utils';
import AllAppointmentsScreenSkeleton from '../AllAppointmentsScreenSkeleton/AllAppointmentsScreenSkeleton';
import {
  primaryColor,
  primaryDark,
  primaryPale,
  dark,
  textMuted,
  surfaceMuted,
} from '../../constants/colors';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../config/api';

const STATUS_CONFIG = {
  pending: { bg: '#FFF0F7', text: primaryColor, label: 'Pending' },
  confirmed: { bg: primaryColor, text: '#fff', label: 'Confirmed' },
  completed: { bg: '#EDE9FE', text: '#6D28D9', label: 'Completed' },
  cancelled: { bg: '#F3F4F6', text: '#6B7280', label: 'Cancelled' },
  canceled: { bg: '#F3F4F6', text: '#6B7280', label: 'Cancelled' },
};

const AppointmentCard = ({ item, navigation }) => {
  const status = (item.appointmentStatus || item.status || 'pending').toLowerCase();
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const expertImg = typeof item.expert?.imageUrl === 'string' ? item.expert.imageUrl : NO_IMAGE;

  const formatDate = raw => {
    if (!raw) return '';
    try {
      return new Date(raw).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('AppointmentSummaryScreen', { item })}
      activeOpacity={0.85}
    >
      <View style={styles.cardLeft}>
        <Image source={{ uri: expertImg }} style={styles.expertImg} />
        <View style={styles.verticalLine} />
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}>
          <Text style={styles.expertName} numberOfLines={1}>
            {item.expert?.expertName || item.expert?.name || 'Expert'}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.statusText, { color: cfg.text }]}>{cfg.label}</Text>
          </View>
        </View>

        <Text style={styles.specialty} numberOfLines={1}>
          {formatText(item.expert?.specialist ?? '')}
        </Text>

        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={13} color={textMuted} />
          <Text style={styles.metaText}>{formatDate(item.createdAt)}</Text>
          {item.selectedTime ? (
            <>
              <Ionicons name="time-outline" size={13} color={textMuted} style={{ marginLeft: 10 }} />
              <Text style={styles.metaText}>{item.selectedTime}</Text>
            </>
          ) : null}
        </View>

        {item.totalAmount ? (
          <Text style={styles.amount}>
            <Text style={{ color: textMuted, fontSize: 12 }}>Total: </Text>
            {item.totalAmount}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const AllAppointments = ({ route, navigation }) => {
  const { userId } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

  const fetchAppointments = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data } = await api.get('/appointments/my');
      setAppointments(data.appointments || []);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [fetchAppointments]),
  );

  useEffect(() => {
    if (route.params?.newAppointment) fetchAppointments();
  }, [route.params?.newAppointment, fetchAppointments]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  }, [fetchAppointments]);

  const filtered =
    activeFilter === 'all'
      ? appointments
      : appointments.filter(a => {
          const s = (a.appointmentStatus || a.status || '').toLowerCase();
          return s === activeFilter || (activeFilter === 'cancelled' && s === 'canceled');
        });

  if (loading && !refreshing) {
    return <AllAppointmentsScreenSkeleton />;
  }

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor={primaryColor} barStyle="light-content" />

      <LinearGradient
        colors={[primaryDark, primaryColor]}
        style={styles.topSection}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.pageTitle}>Appointments</Text>
        <Text style={styles.pageSubtitle}>
          {appointments.length} total booking{appointments.length !== 1 ? 's' : ''}
        </Text>
      </LinearGradient>

      <View style={styles.body}>
        {/* Filter Pills */}
        <FlatList
          data={FILTERS}
          horizontal
          keyExtractor={f => f}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          renderItem={({ item: f }) => (
            <TouchableOpacity
              style={[styles.filterPill, activeFilter === f && styles.filterPillActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
                {convertFIrstCharToUpper(f)}
              </Text>
            </TouchableOpacity>
          )}
        />

        {filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <EmptyComponent title="No appointments found" />
          </View>
        ) : (
          <FlatList
            data={filtered}
            renderItem={({ item }) => (
              <AppointmentCard item={item} navigation={navigation} />
            )}
            keyExtractor={(item, i) => String(item.id ?? i)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={primaryColor}
              />
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },

  topSection: {
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingBottom: 28,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  pageTitle: { fontSize: 26, fontWeight: '800', color: '#fff' },
  pageSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.82)', marginTop: 4 },

  body: { flex: 1 },

  filterRow: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: surfaceMuted,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: primaryColor,
    borderColor: primaryColor,
  },
  filterText: { fontSize: 13, color: textMuted, fontWeight: '500' },
  filterTextActive: { color: '#fff', fontWeight: '700' },

  listContent: { paddingHorizontal: 20, paddingBottom: 30 },

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardLeft: { alignItems: 'center', marginRight: 14 },
  expertImg: {
    width: 52,
    height: 52,
    borderRadius: 16,
    resizeMode: 'cover',
    backgroundColor: '#F3F4F6',
  },
  verticalLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#F1F5F9',
    marginTop: 8,
    borderRadius: 2,
  },
  cardBody: { flex: 1 },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  expertName: { flex: 1, fontSize: 15, fontWeight: '700', color: dark },
  statusBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginLeft: 8,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  specialty: { fontSize: 13, color: textMuted, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  metaText: { fontSize: 12, color: textMuted },
  amount: { fontSize: 13, fontWeight: '700', color: dark, marginTop: 2 },

  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default AllAppointments;
