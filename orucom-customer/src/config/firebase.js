import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import messaging from '@react-native-firebase/messaging';
import { firebase } from '@react-native-firebase/app';

firestore().settings({
  persistence: true,
});

// if (__DEV__) {
//   firestore().setLogLevel('debug');
// }

export { auth, firestore, storage, messaging, firebase };

const app = firebase.app();
export { app };
