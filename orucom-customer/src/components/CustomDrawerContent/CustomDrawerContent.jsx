import React, { useCallback, useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { primaryColor } from '../../constants/colors';
import { AuthContext } from '../../context/AuthContext';
import { DEFAULT_AVATAR } from '../../constants/images';
import { generateRandomName } from '../../utils/utils';
import { useFocusEffect } from '@react-navigation/native';

const DrawerItem = ({ icon, label, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.drawerItem}>
    <View style={styles.iconContainer}>{icon}</View>
    <Text style={styles.drawerItemText}>{label}</Text>
  </TouchableOpacity>
);

const CustomDrawerContent = props => {
  const { user, userData, refreshUser, logout, userId } =
    useContext(AuthContext);
  const [randomName, setRandomName] = useState('');

  useEffect(() => {
    if (!userData?.fullName) {
      setRandomName(generateRandomName());
    }
  }, [userData?.fullName]);

  useFocusEffect(
    useCallback(() => {
      if (user?.uid) {
        refreshUser();
      }
    }, [user?.uid, refreshUser, userId]),
  );

  const handleDeleteAccount = async () => {
    const url =
      'https://www.nominoinnovations.com/p/orucom-account-deletion-request.html';
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert(
        'Error',
        'Unable to open the link. Please visit the website manually.',
      );
    }
  };

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props}>
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: userData?.profileImage ?? DEFAULT_AVATAR }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.userName}>
              {userData?.fullName ?? randomName}
            </Text>
            <Text style={styles.userPhone}>{userData?.email ?? '_'}</Text>
          </View>
        </View>

        <View style={styles.drawerSection}>
          <DrawerItem
            label="Sign Out"
            icon={
              <MaterialCommunityIcons
                name="logout"
                size={24}
                color={primaryColor}
              />
            }
            onPress={logout}
          />
          <DrawerItem
            label="Delete Account"
            icon={
              <MaterialCommunityIcons
                name="delete-outline"
                size={24}
                color={primaryColor}
              />
            }
            onPress={handleDeleteAccount}
          />
        </View>
      </DrawerContentScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: primaryColor,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginTop: 30,
    marginBottom: 20,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },
  userName: {
    fontSize: 20,
    fontWeight: '400',
    color: '#fff',
  },
  userPhone: {
    fontSize: 16,
    color: '#E0E0E0',
    marginTop: 4,
  },
  drawerSection: {
    marginTop: 15,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  drawerItemText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '300',
  },
});

export default CustomDrawerContent;
