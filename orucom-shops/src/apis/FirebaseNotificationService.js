import { Platform, PermissionsAndroid, Alert } from 'react-native';
import api from '../config/api';

class NotificationService {
  static async requestNotificationPermission() {
    try {
      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
              title: 'Notification Permission',
              message: 'This app needs notification permissions to send you updates',
              buttonPositive: 'OK',
            },
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
      }
      try {
        const messaging = require('@react-native-firebase/messaging').default;
        const authStatus = await messaging().requestPermission();
        return authStatus === 1 || authStatus === 2;
      } catch {
        return false;
      }
    } catch {
      return false;
    }
  }

  static async getFCMToken() {
    try {
      const messaging = require('@react-native-firebase/messaging').default;
      if (Platform.OS === 'ios') {
        await messaging().registerDeviceForRemoteMessages();
      }
      const token = await messaging().getToken();
      await this.storeFCMToken(token);
      return token;
    } catch {
      return null;
    }
  }

  static async storeFCMToken(token) {
    try {
      await api.patch('/auth/fcm-token', { fcmToken: token });
    } catch {}
  }

  static setupNotificationHandlers() {
    try {
      const messaging = require('@react-native-firebase/messaging').default;
      const unsubscribe = messaging().onMessage(async remoteMessage => {
        Alert.alert(
          remoteMessage.notification?.title || 'Notification',
          remoteMessage.notification?.body || 'New message received',
          [{ text: 'OK' }],
        );
      });
      messaging().onNotificationOpenedApp(_msg => {});
      messaging().getInitialNotification().then(_msg => {});
      return unsubscribe;
    } catch {
      return () => {};
    }
  }

  static async subscribeToShopTopic(shopId) {
    try {
      const messaging = require('@react-native-firebase/messaging').default;
      await messaging().subscribeToTopic(`shop_${shopId}`);
    } catch {}
  }

  static async unsubscribeFromShopTopic(shopId) {
    try {
      const messaging = require('@react-native-firebase/messaging').default;
      await messaging().unsubscribeFromTopic(`shop_${shopId}`);
    } catch {}
  }
}

export default NotificationService;
