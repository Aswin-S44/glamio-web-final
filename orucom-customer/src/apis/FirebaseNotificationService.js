import { Platform, PermissionsAndroid, Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { auth, firestore } from '../config/firebase';

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
        // iOS
        const authStatus = await messaging().requestPermission();
        return (
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL
        );
      }
    } catch (error) {
      return false;
    }
  }

  // Get FCM token
  static async getFCMToken() {
    try {
      if (Platform.OS === 'ios') {
        await messaging().registerDeviceForRemoteMessages();
      }

      const token = await messaging().getToken();

      // Store token in Firestore for the current user
      await this.storeFCMToken(token);

      return token;
    } catch (error) {
      return null;
    }
  }

  static async updateFCMToken(userId) {
    try {
      if (Platform.OS === 'ios') {
        await messaging().registerDeviceForRemoteMessages();
      }

      const token = await messaging().getToken();

      const userDoc = await firestore()
        .collection('customers')
        .doc(userId)
        .get();

      if (userDoc.exists) {
        const userData = userDoc.data();

        const fcmToken = userData?.fcmToken;

        if (!fcmToken || fcmToken == null || fcmToken !== token) {
          await firestore().collection('customers').doc(userId).set(
            {
              fcmToken: token,
              updatedAt: firestore.FieldValue.serverTimestamp(),
            },
            { merge: true },
          );
        }
      }

      // Store token in Firestore for the current user
      //await this.storeFCMToken(token);

      // return token;
    } catch (error) {
      return null;
    }
  }

  // Store FCM token in Firestore
  static async storeFCMToken(token) {
    try {
      const currentUser = auth().currentUser;

      if (currentUser) {
        const userDoc = await firestore()
          .collection('customers')
          .doc(currentUser.uid)
          .get();

        if (userDoc.exists) {
          const userData = userDoc.data();

          const fcmToken = userData?.fcmToken;

          if (!fcmToken || fcmToken == null || fcmToken !== token) {
            await firestore().collection('customers').doc(currentUser.uid).set(
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
      // Error storing fcm token
    }
  }

  // Setup notification handlers
  static setupNotificationHandlers() {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert(
        remoteMessage.notification?.title || 'Notification',
        remoteMessage.notification?.body || 'New message received',
        [
          {
            text: 'OK',
            onPress: () => {
              // logic here
            },
          },
        ],
      );
    });

    // Notification opened from background/quit state
    messaging().onNotificationOpenedApp(remoteMessage => {
      // Handle navigation based on notification data
    });

    // Check if app was opened by notification
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          // app open notiicaiton
        }
      });

    return unsubscribe;
  }

  // Subscribe to topics (for shop notifications)
  static async subscribeToShopTopic(shopId) {
    try {
      await messaging().subscribeToTopic(`shop_${shopId}`);
    } catch (error) {
      // Error subscribing to topic
    }
  }

  // Unsubscribe from topics
  static async unsubscribeFromShopTopic(shopId) {
    try {
      await messaging().unsubscribeFromTopic(`shop_${shopId}`);
    } catch (error) {
      // 'Error unsubscribing from topic
    }
  }

  static listenForTokenRefresh() {
    messaging().onTokenRefresh(async newToken => {
      await this.storeFCMToken(newToken);
    });
  }
}

export default FirebaseNotificationService;
