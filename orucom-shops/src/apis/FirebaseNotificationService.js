import { Platform, PermissionsAndroid, Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { auth, firestore } from '../config/firebase';
import { COLLECTIONS } from '../constants/collections';

class FirebaseNotificationService {
  static async requestNotificationPermission() {
    try {
      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
              title: 'Notification Permission',
              message:
                'This app needs notification permissions to send you updates',
              buttonPositive: 'OK',
            },
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }

        return true;
      } else {
        const authStatus = await messaging().requestPermission();
        return (
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL
        );
      }
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  }

  static async getFCMToken() {
    try {
      if (Platform.OS === 'ios') {
        await messaging().registerDeviceForRemoteMessages();
      }

      const token = await messaging().getToken();

      await this.storeFCMToken(token);

      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  static async storeFCMToken(token) {
    try {
      const currentUser = auth().currentUser;

      if (currentUser) {
        console.log('EXOSTS');
        const userDoc = await firestore()
          .collection('shop-owners')
          .doc(currentUser.uid)
          .get();

        if (userDoc.exists) {
          const userData = userDoc.data();
          const fcmToken = userData.fcmToken;
          console.log('FCM TOKEN=============', fcmToken);
          console.log(' TOKEN------------', token);
          if (fcmToken !== token) {
            await firestore()
              .collection(COLLECTIONS.SHOP_OWNERS)
              .doc(currentUser.uid)
              .set(
                {
                  fcmToken: token,
                  updatedAt: firestore.FieldValue.serverTimestamp(),
                },
                { merge: true },
              );
          }
        }
      }
    } catch (error) {
      console.error('Error storing FCM token:', error);
    }
  }

  static setupNotificationHandlers() {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert(
        remoteMessage.notification?.title || 'Notification',
        remoteMessage.notification?.body || 'New message received',
        [
          {
            text: 'OK',
            onPress: () => {
              // Notification pressed
              // TODO: If any logic need
            },
          },
        ],
      );
    });

    messaging().onNotificationOpenedApp(remoteMessage => {
      // Handle navigation based on notification data
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          // App opened by notification
        }
      });

    return unsubscribe;
  }

  static async subscribeToShopTopic(shopId) {
    try {
      await messaging().subscribeToTopic(`shop_${shopId}`);
    } catch (error) {
      return error;
    }
  }

  static async unsubscribeFromShopTopic(shopId) {
    try {
      await messaging().unsubscribeFromTopic(`shop_${shopId}`);
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
    }
  }
}

export default FirebaseNotificationService;
