import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Modal,
  Linking,
  Image,
  Platform,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { primaryColor } from '../../constants/colors';
import { useRoute } from '@react-navigation/native';
import { formatDate, formatServiceName } from '../../utils/utils';
import { AVATAR_IMAGE } from '../../constants/images';

const { width } = Dimensions.get('window');

const ServiceSummaryScreen = ({ navigation }) => {
  const route = useRoute();
  const { item } = route.params;
  const [modalVisible, setModalVisible] = useState(false);

  // --- Configuration Helpers ---
  const getStatusConfig = status => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return {
          bg: '#E8F5E9',
          text: '#2E7D32',
          label: 'Booking Confirmed',
          icon: 'checkmark-circle',
        };
      case 'pending':
        return {
          bg: '#FFF3E0',
          text: '#EF6C00',
          label: 'Waiting Confirmation',
          icon: 'hourglass',
        };
      case 'cancelled':
      case 'rejected':
        return {
          bg: '#FFEBEE',
          text: '#C62828',
          label: 'Booking Cancelled',
          icon: 'close-circle',
        };
      default:
        return {
          bg: '#F5F5F5',
          text: '#616161',
          label: status,
          icon: 'help-circle',
        };
    }
  };

  const statusConfig = getStatusConfig(item.appointmentStatus);

  // --- Actions ---
  const handleCall = () => {
    if (item.customer?.phone) Linking.openURL(`tel:${item.customer?.phone}`);
  };

  const handleEmail = () => {
    if (item.customer?.email) Linking.openURL(`mailto:${item.customer?.email}`);
  };

  // --- Calculations ---
  const subtotal = item.services.reduce(
    (sum, s) => sum + s.servicePrice * (s.qty || 1),
    0,
  );
  const discount =
    item.offers?.length > 0
      ? item.offers[0].offerPrice
      : item.offerAvailable
      ? item.offerPrice
      : 0;
  const total = item.totalAmount || subtotal - discount;

  // --- Components ---
  const InfoBlock = ({ label, value, icon, color }) => (
    <View style={styles.infoBlock}>
      <View style={[styles.infoIconBg, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      {/* 1. Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.roundBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 2. Status Banner */}
        <View
          style={[styles.statusBanner, { backgroundColor: statusConfig.bg }]}
        >
          <Ionicons
            name={statusConfig.icon}
            size={20}
            color={statusConfig.text}
          />
          <Text style={[styles.statusBannerText, { color: statusConfig.text }]}>
            {statusConfig.label}
          </Text>
        </View>

        {/* 3. Expert Profile Card */}
        <View style={styles.card}>
          <View style={styles.profileContainer}>
            <Image
              source={{ uri: item.expert.imageUrl ?? AVATAR_IMAGE }}
              style={styles.avatar}
            />
            <View style={styles.profileDetails}>
              <Text style={styles.expertName}>
                {item.expert?.expertName ?? 'Expert'}
              </Text>
              <Text style={styles.expertRole}>
                {item.expert?.specialist
                  ? formatServiceName(item.expert?.specialist)
                  : 'Specialist'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Date & Time Grid */}
          <View style={styles.gridContainer}>
            <InfoBlock
              label="Date"
              value={item.selectedDate ? formatDate(item.selectedDate) : 'N/A'}
              icon="calendar"
              color="#5C6BC0"
            />
            <View style={styles.verticalDivider} />
            <InfoBlock
              label="Time"
              value={item.selectedTime ?? 'N/A'}
              icon="time"
              color="#EC407A"
            />
          </View>
        </View>

        {/* 4. Customer Action Card */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Customer</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.customerRow}>
            <View style={styles.customerAvatar}>
              <Text style={styles.customerInitials}>
                {item.customer?.fullName
                  ? item.customer.fullName.substring(0, 2).toUpperCase()
                  : 'CS'}
              </Text>
            </View>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>
                {item.customer?.fullName ?? 'Walk-in Customer'}
              </Text>
            </View>
          </View>

          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                !item.customer?.phone && styles.disabledAction,
              ]}
              onPress={handleCall}
              disabled={!item.customer?.phone}
            >
              <Ionicons name="call" size={20} color="#fff" />
              <Text style={styles.actionText}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.secondaryAction,
                !item.customer?.email && styles.disabledAction,
              ]}
              onPress={handleEmail}
              disabled={!item.customer?.email}
            >
              <Ionicons name="mail" size={20} color={primaryColor} />
              <Text style={styles.secondaryActionText}>Email</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. Bill Summary */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.billHeader}>
            <Text style={[styles.billHead, { flex: 2 }]}>SERVICE</Text>
            <Text style={[styles.billHead, { flex: 1, textAlign: 'center' }]}>
              QTY
            </Text>
            <Text style={[styles.billHead, { flex: 1, textAlign: 'right' }]}>
              PRICE
            </Text>
          </View>

          {item.services.map((service, index) => (
            <View key={index} style={styles.billRow}>
              <Text style={[styles.billItem, { flex: 2 }]}>
                {service.serviceName}
              </Text>
              <Text style={[styles.billItem, { flex: 1, textAlign: 'center' }]}>
                x{service.qty || 1}
              </Text>
              <Text
                style={[styles.billItemPrice, { flex: 1, textAlign: 'right' }]}
              >
                ₹{service.servicePrice * (service.qty || 1)}
              </Text>
            </View>
          ))}

          <View style={styles.dashedDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{subtotal}</Text>
          </View>

          {discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: '#4CAF50' }]}>
                Discount Applied
              </Text>
              <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
                - ₹{discount}
              </Text>
            </View>
          )}

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Pay</Text>
            <Text style={styles.totalValue}>₹{total}</Text>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8', // Cool grey background
  },
  // HEADER
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  roundBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },

  scrollContent: {
    padding: 20,
  },

  // STATUS BANNER
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusBannerText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '700',
  },

  // CARD STYLES
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 20,
  },
  verticalDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#F0F0F0',
  },
  dashedDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 1,
    marginVertical: 15,
  },

  // EXPERT PROFILE
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 16, // Squircle shape
    backgroundColor: '#f0f0f0',
  },
  profileDetails: {
    flex: 1,
    marginLeft: 15,
  },
  expertName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333',
  },
  expertRole: {
    fontSize: 14,
    color: '#888',
    marginVertical: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },

  // GRID (DATE/TIME)
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },

  // CUSTOMER SECTION
  sectionTitleRow: {
    marginBottom: 10,
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#555',
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  customerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerInitials: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  customerInfo: {
    marginLeft: 15,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  customerId: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: primaryColor,
    paddingVertical: 12,
    borderRadius: 12,
  },
  secondaryAction: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: primaryColor,
  },
  disabledAction: {
    backgroundColor: '#E0E0E0',
    borderColor: '#E0E0E0',
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryActionText: {
    color: primaryColor,
    fontWeight: '600',
    marginLeft: 8,
  },

  // BILL
  billHeader: {
    flexDirection: 'row',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 10,
  },
  billHead: {
    fontSize: 12,
    color: '#999',
    fontWeight: '700',
  },
  billRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  billItem: {
    fontSize: 14,
    color: '#555',
  },
  billItemPrice: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#777',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalContainer: {
    backgroundColor: '#F9FAFB',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: primaryColor,
  },
});

export default ServiceSummaryScreen;
