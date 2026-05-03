import React, { useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { primaryColor } from '../../constants/colors';
import { AuthContext } from '../../context/AuthContext';
import { AVATAR_IMAGE } from '../../constants/images';
 
const DrawerItem = ({ iconName, iconSet, label, onPress }) => {
  const IconComponent =
    iconSet === 'MaterialCommunity'
      ? MaterialCommunityIcons
      : iconSet === 'Material'
      ? MaterialIcons
      : Ionicons;

  return (
    <TouchableOpacity onPress={onPress} style={styles.drawerItem}>
      <IconComponent
        name={iconName}
        size={24}
        color="#fff"
        style={styles.icon}
      />
      <Text style={styles.drawerItemText}>{label}</Text>
    </TouchableOpacity>
  );
};

const CustomDrawerContent = props => {
  const { logout, userData, loading } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props}>
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: userData?.profileImage ?? AVATAR_IMAGE }}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{userData?.parlourName ?? ''}</Text>
          <Text style={styles.userPhone}>{userData?.email ?? ''}</Text>
        </View>

        <View style={styles.drawerSection}>
          <DrawerItem
            label="Services"
            iconSet="Material"
            iconName="add-business"
            onPress={() => {
              props.navigation.navigate('AllServicesScreen');
            }}
          />
          <DrawerItem
            label="Add Expert"
            iconName="person-add-outline"
            onPress={() => {
              props.navigation.navigate('ExpertsScreen');
            }}
          />

          <DrawerItem
            label="Add Service Offer"
            iconSet="MaterialCommunity"getNotificationTitle
            iconName="playlist-plus"
            onPress={() => {
              props.navigation.navigate('AllOffersScreen');
            }}
          />
          {/* <DrawerItem
            label="Change Password"
            iconName="sync-outline"
            onPress={() => {
              props.navigation.navigate('ChangePasswordScreen');
            }}
          /> */}
          {/* <DrawerItem
            label="Settings"
            iconName="settings-outline"
            onPress={() => {}}
          /> */}
          {/* <DrawerItem
            label="Help & Support"
            iconSet="MaterialCommunity"
            iconName="help-rhombus-outline"
            onPress={() => {
              props.navigation.navigate('HelpSupportScreen');
            }}
          /> */}
          <DrawerItem
            label="Sign Out"
            iconSet="MaterialCommunity"
            iconName="logout"
            onPress={logout}
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
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  userPhone: {
    fontSize: 16,
    color: '#E0E0E0',
    marginTop: 4,
  },
  drawerSection: {
    marginTop: 5,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  icon: {
    width: 30,
  },
  drawerItemText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 15,
    fontWeight: '500',
  },
});

export default CustomDrawerContent;
