import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { Swipeable } from 'react-native-gesture-handler';
import { primaryColor } from '../../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../../context/AuthContext';
import { getNotificationsByShopId } from '../../apis/services';
import AllNotificationsScreenSkeleton from '../AllNotificationsScreenSkeleton/AllNotificationsScreenSkeleton';
import EmptyComponent from '../../components/EmptyComponent/EmptyComponent';
import { AVATAR_IMAGE } from '../../constants/images';

const { width } = Dimensions.get('window');

const AllNotificationScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { user } = useContext(AuthContext);

  // Helper to format time (Simple version)
  const formatTimeAgo = timestamp => {
    if (!timestamp) return '';
    // Assuming timestamp is Firestore _seconds or JS Date object
    const date = new Date(
      timestamp._seconds ? timestamp._seconds * 1000 : timestamp,
    );
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const fetchNotifications = useCallback(async () => {
    if (user && user.uid) {
      setLoading(true);
      const res = await getNotificationsByShopId(user.uid);
      setLoading(false);
      setNotifications(res || []);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, [fetchNotifications]);

  const handleNotificationPress = async notification => {
    const updatedNotifications = notifications.map(item =>
      item.id === notification.id ? { ...item, isRead: true } : item,
    );
    setNotifications(updatedNotifications);
    navigation.navigate('NofificationDetailsScreen', {
      notificationId: notification?.id,
    });
  };

  const deleteNotification = id => {
    setNotifications(notifications.filter(item => item.id !== id));
    // Add API call to delete from backend here
  };

  const renderRightActions = (progress, dragX, id) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.deleteActionContainer}>
        <Animated.View
          style={[
            styles.deleteActionBtn,
            { transform: [{ translateX: trans }] },
          ]}
        >
          <TouchableOpacity
            style={styles.deleteTouchable}
            onPress={() => deleteNotification(id)}
          >
            <Icons name="trash-can-outline" size={26} color="#fff" />
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const renderNotificationItem = ({ item }) => (
    <Swipeable
      renderRightActions={(progress, dragX) =>
        renderRightActions(progress, dragX, item.id)
      }
      containerStyle={styles.swipeContainer}
    >
      <TouchableOpacity
        style={[styles.card, !item.isRead && styles.unreadCard]}
        activeOpacity={0.9}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.row}>
          {/* Avatar with Icon Badge */}
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: item?.profileImage || AVATAR_IMAGE,
              }}
              style={styles.avatar}
            />
            <View style={styles.iconBadge}>
              <Icon name="calendar" size={10} color="#fff" />
            </View>
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            <View style={styles.headerRow}>
              <Text
                style={[styles.title, !item.isRead && styles.unreadTitle]}
                numberOfLines={1}
              >
                {item.title || 'Appointment Request'}
              </Text>
              <Text style={styles.timeText}>
                {formatTimeAgo(item.createdAt)}
              </Text>
            </View>

            <Text
              style={[styles.message, !item.isRead && styles.unreadMessage]}
              numberOfLines={2}
            >
              {item.message}
            </Text>
          </View>

          {/* Unread Indicator */}
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={primaryColor} />

      <View style={styles.headerContainer}>
        <Image
          source={require('../../assets/images/home_bg-1.png')}
          style={styles.headerBg}
          resizeMode="cover"
        />
        <View style={styles.overlay} />

        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <View style={styles.glassBtn}>
              <Icon name="chevron-back" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <View style={styles.bodyContainer}>
        {loading ? (
          <AllNotificationsScreenSkeleton />
        ) : !loading && notifications.length === 0 ? (
          <EmptyComponent
            title="No Notifications"
            subtitle="You're all caught up! Check back later."
          />
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={primaryColor}
                colors={[primaryColor]}
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
  // HEADER
  headerContainer: {
    height: 120,
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
    opacity: 0.85,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: Platform.OS === 'ios' ? 20 : 10,
  },
  glassBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },

  // BODY
  bodyContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -25,
    paddingTop: 15,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  // LIST ITEM
  swipeContainer: {
    marginBottom: 12,
    overflow: 'hidden',
    borderRadius: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    // Soft Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderLeftColor: primaryColor,
    // Slightly stronger shadow for unread
    shadowOpacity: 0.08,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#f0f0f0',
  },
  iconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: primaryColor,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  unreadTitle: {
    fontWeight: '800',
    color: '#000',
  },
  timeText: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  message: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  unreadMessage: {
    color: '#333',
    fontWeight: '500',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: primaryColor,
    marginLeft: 10,
  },

  // DELETE ACTION
  deleteActionContainer: {
    width: 90,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  deleteActionBtn: {
    width: 90,
    height: '100%',
  },
  deleteTouchable: {
    backgroundColor: '#FF5252',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  deleteText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});

export default AllNotificationScreen;
