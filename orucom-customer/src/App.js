import React, { useState, useContext, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/FontAwesome';
import HomeScreen from './screens/HomeScreen/HomeScreen';
import ProfileScreen from './screens/ProfileScreen/ProfileScreen';
import AllAppointments from './screens/AllAppointments/AllAppointments';
import CustomDrawerContent from './components/CustomDrawerContent/CustomDrawerContent';
import ParlourDetails from './screens/ParlourDetails/ParlourDetails';
import BookingScreen from './screens/BookingScreen/BookingScreen';
import BookingSummaryScreen from './screens/BookingSummaryScreen/BookingSummaryScreen';
import AppointmentScreen from './screens/AppointmentScreen/AppointmentScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen/ChangePasswordScreen';
import HelpSupportScreen from './screens/HelpSupportScreen/HelpSupportScreen';
import NearByShopsList from './screens/NearByShopsList/NearByShopsList';
import BeautyExpertDetailsScreen from './screens/BeautyExpertDetailsScreen/BeautyExpertDetailsScreen';
import OTPVerificationScreen from './screens/OTPVerificationScreen/OTPVerificationScreen';
import SplashScreen from './screens/SplashScreen/SplashScreen';
import SignInScreen from './screens/SignInScreen/SignInScreen';
import SignUpScreen from './screens/SignUpScreen/SignUpScreen';
import { primaryColor } from './constants/colors';
import { AuthContext } from './context/AuthContext';
import SearchResultsScreen from './screens/SearchResultsScreen/SearchResultsScreen';
import FirebaseNotificationService from './apis/FirebaseNotificationService';
import EditProfileScreen from './screens/EditProfileScreen/EditProfileScreen';
import AllNotificationScreen from './screens/AllNotificationScreen/AllNotificationScreen';
import NofificationDetailsScreen from './screens/NofificationDetailsScreen/NofificationDetailsScreen';
import SigninWithGoogleScreen from './screens/SigninWithGoogleScreen/SigninWithGoogleScreen';
import firestore from '@react-native-firebase/firestore';
import AppointmentSummaryScreen from './screens/AppointmentSummaryScreen/AppointmentSummaryScreen';

const Tab = createMaterialBottomTabNavigator();
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="ParlourDetails" component={ParlourDetails} />
      <Stack.Screen name="AppointmentScreen" component={AppointmentScreen} />
      <Stack.Screen name="BookingScreen" component={BookingScreen} />
      <Stack.Screen
        name="BookingSummaryScreen"
        component={BookingSummaryScreen}
      />
      <Stack.Screen
        name="BeautyExpertDetailsScreen"
        component={BeautyExpertDetailsScreen}
      />
      <Stack.Screen
        name="SearchResultsScreen"
        component={SearchResultsScreen}
      />
      <Stack.Screen
        name="AllNotificationScreen"
        component={AllNotificationScreen}
      />
      <Stack.Screen
        name="NotificationDetailsScreen"
        component={NofificationDetailsScreen}
      />
      <Stack.Screen
        name="AppointmentSummaryScreen"
        component={AppointmentSummaryScreen}
      />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      barStyle={{ backgroundColor: '#fff' }}
      activeColor="#ffffff"
      inactiveColor="#cccccc"
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name="home"
              size={focused ? 26 : 20}
              color={focused ? primaryColor : color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Shops"
        component={NearByShopsList}
        options={{
          tabBarLabel: 'Nearby Shops',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name="location"
              size={focused ? 26 : 20}
              color={focused ? primaryColor : color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Appointment"
        component={AllAppointments}
        options={{
          tabBarLabel: 'Appointments',
          tabBarIcon: ({ focused, color }) => (
            <Icon
              name="calendar"
              size={focused ? 26 : 20}
              color={focused ? primaryColor : color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Account',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name="person-circle-outline"
              size={focused ? 26 : 20}
              color={focused ? primaryColor : color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AppDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      drawerStyle={{ width: 300 }}
    >
      <Drawer.Screen
        name="Main"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
    </Drawer.Navigator>
  );
}

function MainAppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AppDrawer" component={AppDrawer} />
      <Stack.Screen
        name="ChangePasswordScreen"
        component={ChangePasswordScreen}
      />
      <Stack.Screen name="HelpSupportScreen" component={HelpSupportScreen} />
      <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
      <Stack.Screen name="Appointment" component={AllAppointments} />
      <Stack.Screen name="ParlourDetails" component={ParlourDetails} />
      <Stack.Screen
        name="SearchResultsScreen"
        component={SearchResultsScreen}
      />
      <Stack.Screen name="BookingScreen" component={BookingScreen} />
      <Stack.Screen
        name="BookingSummaryScreen"
        component={BookingSummaryScreen}
      />
      <Stack.Screen
        name="BeautyExpertDetailsScreen"
        component={BeautyExpertDetailsScreen}
      />
      <Stack.Screen
        name="AppointmentSummaryScreen"
        component={AppointmentSummaryScreen}
      />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="SigninWithGoogleScreen"
        component={SigninWithGoogleScreen}
      />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen
        name="OTPVerificationScreen"
        component={OTPVerificationScreen}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const { user, userData, loading, isEmailVerified } = useContext(AuthContext);
  const [notificationSetupComplete, setNotificationSetupComplete] =
    useState(false);

  // useEffect(() => {
  //   const initializeNotifications = async () => {
  //     // if (!notificationSetupComplete) {
  //     try {
  //       FirebaseNotificationService.setupNotificationHandlers();
  //       // FirebaseNotificationService.listenForTokenRefresh();
  //       const hasPermission =
  //         await FirebaseNotificationService.requestNotificationPermission();

  //       if (hasPermission && user) {
  //         await FirebaseNotificationService.getFCMToken();
  //       }
  //       // setNotificationSetupComplete(true);
  //     } catch (error) {
  //       console.error('App initialization error:', error);
  //     }
  //     // }
  //   };
  //   if (!loading) {
  //     initializeNotifications();
  //   }
  // }, [loading, user, notificationSetupComplete, userData]);

  const getInitialRoute = () => {
    if (loading) return 'Splash';
    if (userData) {
      if (userData.emailVerified || isEmailVerified) return 'MainAppStack';
      else return 'OTPVerificationScreen';
    }
    return 'AuthStack';
  };

  const initialRouteName = getInitialRoute();

  useEffect(() => {
    const checkHealth = async () => {
      await firestore()
        .collection('ping')
        .limit(1)
        .get()
        .catch(() => {});
    };
    checkHealth();
  }, []);

  if (loading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SplashScreen />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {initialRouteName === 'Splash' && (
            <Stack.Screen name="Splash" component={SplashScreen} />
          )}
          {initialRouteName === 'AuthStack' && (
            <Stack.Screen name="AuthStack" component={AuthStack} />
          )}
          {initialRouteName === 'OTPVerificationScreen' && (
            <Stack.Screen
              name="OTPVerificationScreen"
              component={OTPVerificationScreen}
            />
          )}
          {initialRouteName === 'MainAppStack' && (
            <Stack.Screen name="MainAppStack" component={MainAppStack} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
