import { Platform, PermissionsAndroid } from 'react-native';
import api from '../config/api';

class NotificationService {
  static async requestNotificationPermission() {
    try {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    } catch {
      return false;
    }
  }

  static async getFCMToken() { return null; }
  static async updateFCMToken(_userId) {}
  static setupNotificationHandlers() { return () => {}; }
  static async subscribeToShopTopic(_shopId) {}
  static async unsubscribeFromShopTopic(_shopId) {}
  static listenForTokenRefresh() {}
}

export default NotificationService;
