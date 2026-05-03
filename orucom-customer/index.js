/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import React from 'react';
import { AuthProvider } from './src/context/AuthContext'; // import your provider
import firestore from '@react-native-firebase/firestore';

const Root = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

// firestore().settings({ persistence: true });


AppRegistry.registerComponent(appName, () => Root);
