import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getAppointmentsByShopId } from '../../apis/services';
import { convertFIrstCharToUpper, formatTimestamp } from '../../utils/utils';
import EmptyComponent from '../../components/EmptyComponent/EmptyComponent';
import ServiceCardSkeleton from '../../components/ServiceCardSkeleton/ServiceCardSkeleton';
import { NO_IMAGE } from '../../constants/variables';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { primaryColor } from '../../constants/colors';

const AllAppointments = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointmentHistory = useCallback(async () => {
    if (user && user.uid) {
      setLoading(true);
      const res = await getAppointmentsByShopId(user.uid);
      setLoading(false);
      if (res) {
        setAppointments(res);
      } else {
        setAppointments([]);
      }
    } else {
      setAppointments([]);
    }
  }, [user]);

  useEffect(() => {
    fetchAppointmentHistory();
  }, [fetchAppointmentHistory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAppointmentHistory();
    setRefreshing(false);
  }, [fetchAppointmentHistory]);

  const getStatusConfig = status => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { color: '#FF9800', bg: '#FFF3E0', icon: 'time-outline' };
      case 'confirmed':
        return {
          color: '#2196F3',
          bg: '#E3F2FD',
          icon: 'checkmark-circle-outline',
        };
      case 'completed':
        return {
          color: '#4CAF50',
          bg: '#E8F5E9',
          icon: 'checkmark-done-outline',
        };
      case 'cancelled':
        return {
          color: '#F44336',
          bg: '#FFEBEE',
          icon: 'close-circle-outline',
        };
      case 'rejected':
        return { color: '#D32F2F', bg: '#FFCDD2', icon: 'ban-outline' };
      default:
        return { color: '#757575', bg: '#EEEEEE', icon: 'help-circle-outline' };
    }
  };

  const renderAppointment = ({ item }) => {
    const statusConfig = getStatusConfig(item.appointmentStatus);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('ServiceSummaryScreen', { item })}
      >
        <View style={styles.cardHeader}>
          <Image
            source={{
              uri:
                typeof item.expert.imageUrl === 'string'
                  ? item.expert.imageUrl
                  : NO_IMAGE,
            }}
            style={styles.avatar}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.expertName}>{item.expert.expertName}</Text>
            <Text style={styles.dateTimeText}>
              {formatTimestamp(item.createdAt)}
            </Text>
          </View>
          <View
            style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}
          >
            <Ionicons
              name={statusConfig.icon}
              size={14}
              color={statusConfig.color}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {convertFIrstCharToUpper(item.appointmentStatus)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardBody}>
          <View style={styles.row}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.infoText}>
              {item.selectedDate || 'Date N/A'}
            </Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.infoText}>
              {item.selectedTime || 'Time N/A'}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalPrice}>₹{item.totalAmount}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={primaryColor} />

      <View style={styles.headerContainer}>
        <Image
          source={require('../../assets/images/home_bg-1.png')}
          style={styles.headerBg}
        />
        <View style={styles.overlay} />

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>All Appointments</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={onRefresh}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="refresh" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.contentContainer}>
        {loading && !refreshing ? (
          <ServiceCardSkeleton />
        ) : !loading && appointments.length === 0 ? (
          <EmptyComponent title="No Appointments Found" />
        ) : (
          <FlatList
            data={appointments}
            renderItem={renderAppointment}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[primaryColor]}
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
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  headerContainer: {
    height: 140,
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
  },
  headerBg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: primaryColor,
    opacity: 0.9,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: Platform.OS === 'ios' ? 20 : 0,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  refreshButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 12,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -25,
    paddingTop: 20,
    overflow: 'hidden',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  // Card Styles
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  expertName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  dateTimeText: {
    fontSize: 12,
    color: '#888',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 12,
  },
  cardBody: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  infoText: {
    marginLeft: 6,
    color: '#555',
    fontSize: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    padding: 10,
    borderRadius: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: primaryColor,
  },
});

export default AllAppointments;
