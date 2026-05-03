import React, { useState, useContext, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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
import NotificationService from './apis/FirebaseNotificationService';
import EditProfileScreen from './screens/EditProfileScreen/EditProfileScreen';
import AllNotificationScreen from './screens/AllNotificationScreen/AllNotificationScreen';
import NofificationDetailsScreen from './screens/NofificationDetailsScreen/NofificationDetailsScreen';
import SigninWithGoogleScreen from './screens/SigninWithGoogleScreen/SigninWithGoogleScreen';
import AppointmentSummaryScreen from './screens/AppointmentSummaryScreen/AppointmentSummaryScreen';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="ParlourDetails" component={ParlourDetails} />
      <Stack.Screen name="AppointmentScreen" component={AppointmentScreen} />
      <Stack.Screen name="BookingScreen" component={BookingScreen} />
      <Stack.Screen name="BookingSummaryScreen" component={BookingSummaryScreen} />
      <Stack.Screen name="BeautyExpertDetailsScreen" component={BeautyExpertDetailsScreen} />
      <Stack.Screen name="SearchResultsScreen" component={SearchResultsScreen} />
      <Stack.Screen name="AllNotificationScreen" component={AllNotificationScreen} />
      <Stack.Screen name="NotificationDetailsScreen" component={NofificationDetailsScreen} />
      <Stack.Screen name="AppointmentSummaryScreen" component={AppointmentSummaryScreen} />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: primaryColor,
        tabBarInactiveTintColor: '#cccccc',
        tabBarStyle: { backgroundColor: '#fff' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name="home" size={focused ? 26 : 20} color={focused ? primaryColor : color} />
          ),
        }}
      />
      <Tab.Screen
        name="Shops"
        component={NearByShopsList}
        options={{
          tabBarLabel: 'Nearby Shops',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name="location" size={focused ? 26 : 20} color={focused ? primaryColor : color} />
          ),
        }}
      />
      <Tab.Screen
        name="Appointment"
        component={AllAppointments}
        options={{
          tabBarLabel: 'Appointments',
          tabBarIcon: ({ focused, color }) => (
            <Icon name="calendar" size={focused ? 26 : 20} color={focused ? primaryColor : color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Account',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name="person-circle-outline" size={focused ? 26 : 20} color={focused ? primaryColor : color} />
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
      <Drawer.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
    </Drawer.Navigator>
  );
}

function MainAppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AppDrawer" component={AppDrawer} />
      <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />
      <Stack.Screen name="HelpSupportScreen" component={HelpSupportScreen} />
      <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
      <Stack.Screen name="Appointment" component={AllAppointments} />
      <Stack.Screen name="ParlourDetails" component={ParlourDetails} />
      <Stack.Screen name="SearchResultsScreen" component={SearchResultsScreen} />
      <Stack.Screen name="BookingScreen" component={BookingScreen} />
      <Stack.Screen name="BookingSummaryScreen" component={BookingSummaryScreen} />
      <Stack.Screen name="BeautyExpertDetailsScreen" component={BeautyExpertDetailsScreen} />
      <Stack.Screen name="AppointmentSummaryScreen" component={AppointmentSummaryScreen} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SigninWithGoogleScreen" component={SigninWithGoogleScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="OTPVerificationScreen" component={OTPVerificationScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const { userData, loading } = useContext(AuthContext);

  useEffect(() => {
    if (!loading && userData) {
      NotificationService.setupNotificationHandlers();
      NotificationService.requestNotificationPermission().then(granted => {
        if (granted) NotificationService.getFCMToken();
      });
    }
  }, [loading, userData]);

  const getInitialRoute = () => {
    if (loading) return 'Splash';
    if (userData) return 'MainAppStack';
    return 'AuthStack';
  };

  const initialRouteName = getInitialRoute();

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
          {initialRouteName === 'AuthStack' && (
            <Stack.Screen name="AuthStack" component={AuthStack} />
          )}
          {initialRouteName === 'MainAppStack' && (
            <Stack.Screen name="MainAppStack" component={MainAppStack} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
