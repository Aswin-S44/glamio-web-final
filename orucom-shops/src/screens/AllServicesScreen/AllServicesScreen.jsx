import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Modal,
  Alert,
  RefreshControl,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import React, { useRef, useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { deleteService, getShopServices } from '../../apis/services';
import { AuthContext } from '../../context/AuthContext';
import { formatTimeAgo } from '../../utils/utils';
import ServiceCardSkeleton from '../../components/ServiceCardSkeleton/ServiceCardSkeleton';
import { primaryColor } from '../../constants/colors';

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = 110;
const SPACING = 20;

const AllServicesScreen = ({ navigation }) => {
  const [services, setServices] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [isMenuVisible, setMenuVisible] = React.useState(false);
  const [selectedService, setSelectedService] = React.useState(null);
  const { user } = React.useContext(AuthContext);
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] =
    React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  // Animation Value
  const scrollY = useRef(new Animated.Value(0)).current;

  const fetchServices = React.useCallback(async () => {
    try {
      setLoading(true);
      if (user) {
        const res = await getShopServices(user.uid);
        setServices(res || []);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not fetch services.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchServices();
    });
    return unsubscribe;
  }, [navigation, fetchServices]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchServices();
  }, [fetchServices]);

  const openMenu = item => {
    setSelectedService(item);
    setMenuVisible(true);
  };

  const closeMenu = () => {
    setMenuVisible(false);
    setSelectedService(null);
  };

  const handleEdit = () => {
    if (selectedService) {
      navigation.navigate('EditServiceScreen', { service: selectedService });
    }
    closeMenu();
  };

  const handleDelete = () => {
    if (selectedService) {
      setDeleteConfirmationVisible(true);
    }
    setMenuVisible(false);
  };

  const confirmDelete = async () => {
    if (selectedService && user && user.uid) {
      // Optimistic update for better UX
      const prevServices = [...services];
      setServices(prev => prev.filter(s => s.id !== selectedService.id));
      setDeleteConfirmationVisible(false);

      try {
        await deleteService(selectedService.id, user.uid);
      } catch (error) {
        // Revert if failed
        setServices(prevServices);
        Alert.alert('Error', 'Failed to delete item');
      }
    }
  };

  const renderServiceItem = ({ item, index }) => {
    // Entry Animation logic
    const inputRange = [
      -1,
      0,
      (CARD_HEIGHT + SPACING) * index,
      (CARD_HEIGHT + SPACING) * (index + 2),
    ];

    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0],
    });

    const opacity = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0],
    });

    return (
      <Animated.View
        style={[styles.cardContainer, { transform: [{ scale }], opacity }]}
      >
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.9}
          onPress={() =>
            navigation.navigate('ServiceDetailsScreen', { service: item })
          }
        >
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: item.imageUrl || 'https://via.placeholder.com/150',
              }}
              style={styles.serviceImage}
            />
            <View style={styles.priceBadge}>
              <Text style={styles.priceText}>₹{item.servicePrice || '0'}</Text>
            </View>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.categoryChip}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
              <TouchableOpacity
                onPress={() => openMenu(item)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialCommunityIcons
                  name="dots-horizontal"
                  size={22}
                  color="#aaa"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.serviceName} numberOfLines={1}>
              {item.serviceName || 'Unnamed Service'}
            </Text>

            <View style={styles.cardFooter}>
              <View style={styles.timeInfo}>
                <Icon name="time-outline" size={14} color="#999" />
                <Text style={styles.serviceAdded}>
                  {item.createdAt ? formatTimeAgo(item.createdAt) : 'Recently'}
                </Text>
              </View>
              <Icon
                name="chevron-forward-circle"
                size={24}
                color={primaryColor}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Modern Header */}
      <View style={styles.headerContainer}>
        <Image
          source={require('../../assets/images/home_bg-1.png')}
          style={styles.headerBgImage}
          blurRadius={3}
        />
        <View style={styles.headerGradient} />

        <View style={styles.headerSafeArea}>
          <View style={styles.navBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Services</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.headerStats}>
            <Text style={styles.statsCount}>{services.length}</Text>
            <Text style={styles.statsLabel}>Active Services</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {loading && !refreshing ? (
          <ServiceCardSkeleton />
        ) : (
          <Animated.FlatList
            data={services}
            renderItem={renderServiceItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true },
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#8e44ad"
                colors={['#8e44ad']}
              />
            }
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconBubble}>
                  <MaterialCommunityIcons
                    name="clipboard-text-outline"
                    size={50}
                    color="#cbaacb"
                  />
                </View>
                <Text style={styles.emptyText}>No Services Yet</Text>
                <Text style={styles.emptySubText}>
                  Tap the + button to add your first service
                </Text>
              </View>
            )}
          />
        )}
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('AddServicesScreen')}
      >
        <Icon name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* Actions Menu Modal */}
      <Modal
        transparent={true}
        visible={isMenuVisible}
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeMenu}
        >
          <View style={styles.bottomSheet}>
            <View style={styles.bottomSheetHandle} />
            <Text style={styles.bottomSheetTitle}>Manage Service</Text>

            <TouchableOpacity style={styles.sheetAction} onPress={handleEdit}>
              <View style={[styles.actionIcon, { backgroundColor: '#e8f5e9' }]}>
                <Icon name="create-outline" size={22} color="#2e7d32" />
              </View>
              <Text style={styles.actionText}>Edit Service</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sheetAction} onPress={handleDelete}>
              <View style={[styles.actionIcon, { backgroundColor: '#ffebee' }]}>
                <Icon name="trash-outline" size={22} color="#c62828" />
              </View>
              <Text style={[styles.actionText, { color: '#c62828' }]}>
                Delete Service
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Custom Delete Alert */}
      <Modal
        transparent={true}
        visible={deleteConfirmationVisible}
        animationType="fade"
        onRequestClose={() => setDeleteConfirmationVisible(false)}
      >
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <View style={styles.alertIconHeader}>
              <Icon name="trash" size={30} color="#fff" />
            </View>
            <Text style={styles.alertTitle}>Delete Service?</Text>
            <Text style={styles.alertMessage}>
              Are you sure you want to remove "{selectedService?.serviceName}"?
            </Text>
            <View style={styles.alertButtons}>
              <TouchableOpacity
                style={styles.alertCancelBtn}
                onPress={() => setDeleteConfirmationVisible(false)}
              >
                <Text style={styles.alertCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.alertConfirmBtn}
                onPress={confirmDelete}
              >
                <Text style={styles.alertConfirmText}>Yes, Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7', // iOS system gray background
  },

  /* Header Styles */
  headerContainer: {
    height: 240,
    width: '100%',
    justifyContent: 'flex-end',
  },
  headerBgImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: primaryColor, // Purple overlay
  },
  headerSafeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 40 : 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerStats: {
    marginBottom: 10,
  },
  statsCount: {
    fontSize: 38,
    fontWeight: '800',
    color: '#fff',
  },
  statsLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginTop: -5,
  },

  /* Content Styles */
  contentContainer: {
    flex: 1,
    backgroundColor: '#f2f2f7',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    overflow: 'hidden',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100, // Space for FAB
  },

  /* Card Styles */
  cardContainer: {
    marginBottom: SPACING,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 12,
    height: CARD_HEIGHT,
    // High quality shadow
    shadowColor: '#8e44ad',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  imageContainer: {
    width: 85,
    height: '100%',
    position: 'relative',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  priceBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  cardContent: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  categoryChip: {
    backgroundColor: primaryColor,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  serviceName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: 5,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceAdded: {
    fontSize: 12,
    color: '#95a5a6',
    marginLeft: 4,
  },

  /* FAB Styles */
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
    // Glow effect
    shadowColor: { primaryColor },
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },

  /* Empty State */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyIconBubble: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    maxWidth: '70%',
  },

  /* Modal & Bottom Sheet */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    paddingBottom: 40,
  },
  bottomSheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 20,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  sheetAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  /* Alert Modal */
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertBox: {
    backgroundColor: '#fff',
    width: '85%',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    elevation: 10,
  },
  alertIconHeader: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -55,
    marginBottom: 15,
    borderWidth: 4,
    borderColor: '#fff',
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  alertMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  alertButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  alertCancelBtn: {
    flex: 1,
    backgroundColor: '#f1f2f6',
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 10,
    alignItems: 'center',
  },
  alertConfirmBtn: {
    flex: 1,
    backgroundColor: primaryColor,
    paddingVertical: 12,
    borderRadius: 12,
    marginLeft: 10,
    alignItems: 'center',
  },
  alertCancelText: {
    color: '#333',
    fontWeight: '600',
  },
  alertConfirmText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default AllServicesScreen;
