import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  StatusBar,
  Image,
} from 'react-native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import {
  deleteNotificationById,
  getNotificationsByCustomerId,
  markNotificationAsRead,
} from '../../apis/services';
import Icon from 'react-native-vector-icons/Ionicons';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import { DEFAULT_AVATAR } from '../../constants/images';
import { StyleSheet } from 'react-native';
import { primaryColor } from '../../constants/colors';
import EmptyComponent from '../../components/EmptyComponent/EmptyComponent';
import { Swipeable } from 'react-native-gesture-handler';
import AllNotificationsScreenSkeleton from '../AllNotificationsScreenSkeleton/AllNotificationsScreenSkeleton';

const AllNotificationScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { userId } = useContext(AuthContext);

  const fetchNotifications = useCallback(async () => {
    if (userId) {
      setLoading(true);
      const res = await getNotificationsByCustomerId(userId);
      setLoading(false);
      setNotifications(res || []);
    }
  }, [userId]);

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
    await markNotificationAsRead(notification.id);
  };

  const deleteNotification = async id => {
    setNotifications(notifications.filter(item => item.id !== id));
    await deleteNotificationById(id);
  };

  const renderRightActions = (progress, dragX, notification) => {
    return (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteNotification(notification.id)}
      >
        <Icons name="trash-can-outline" size={20} color="#E84F67" />
      </TouchableOpacity>
    );
  };

  const renderNotificationItem = ({ item }) => (
    <Swipeable
      renderRightActions={(progress, dragX) =>
        renderRightActions(progress, dragX, item)
      }
    >
      <TouchableOpacity
        style={[
          styles.notificationItem,
          item.isRead && styles.readNotification,
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <Image
          source={{
            uri: item.shop?.profileImage || DEFAULT_AVATAR,
          }}
          style={styles.avatar}
        />
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>
            {item.notificationType == 'appointment_accepted'
              ? 'Appointment accepted'
              : item.notificationType == 'appointment_rejected'
              ? 'Appointment rejected'
              : 'Notification'}
          </Text>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <Text style={styles.notificationTime}>
            {new Date(item.createdAt._seconds * 1000).toLocaleString()}
          </Text>
        </View>
        {!item.isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={primaryColor} />
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/home_bg-1.png')}
          style={styles.headerImage}
        />
        <View style={styles.overlay} />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color="#fff" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Notifications</Text>
        {loading ? (
          <AllNotificationsScreenSkeleton />
        ) : !loading && notifications.length === 0 ? (
          <EmptyComponent />
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    height: 120,
    justifyContent: 'center',
    paddingTop: 20,
  },
  headerImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: primaryColor,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 15,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 5,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingTop: 10,
  },
  listContainer: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: primaryColor,
  },
  readNotification: {
    backgroundColor: '#ffffff',
    borderLeftColor: '#ccc',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: 'whitesmoke',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '80%',
    borderRadius: 8,
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    textAlign: 'center',
    marginVertical: 10,
    color: '#333',
  },
});

export default AllNotificationScreen;
