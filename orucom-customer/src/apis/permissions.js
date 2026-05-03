import { Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export const getLocationPermission = async () => {
  let permission;

  if (Platform.OS === 'android') {
    permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
  } else if (Platform.OS === 'ios') {
    permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
  }

  const result = await check(permission);

  if (result === RESULTS.GRANTED) {
    return true;
  } else {
    const requestResult = await request(permission);
    return requestResult === RESULTS.GRANTED;
  }
};
