import React, { useContext, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  TouchableOpacity,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
  RefreshControl,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/FontAwesome';
import ImageViewer from 'react-native-image-zoom-viewer';
import { primaryColor } from '../../constants/colors';
import { AuthContext } from '../../context/AuthContext';
import ProfileScreenSkeleton from '../../components/ProfileScreenSkeleton/ProfileScreenSkeleton';
import { generateRandomName } from '../../utils/utils';
import { DEFAULT_AVATAR } from '../../constants/images';
import { useFocusEffect } from '@react-navigation/native';
import PrivacyPolicyScreen from '../PrivacyPolicyScreen/PrivacyPolicyScreen';
import LinearGradient from 'react-native-linear-gradient';
import TermsAndConditionScreen from '../TermsAndConditionScreen/TermsAndConditionScreen';

const { width } = Dimensions.get('window');

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const AccordionMenuItem = ({ iconName, label, children, isLast }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleAccordion = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={[styles.accordionContainer, isLast && { marginBottom: 0 }]}>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={toggleAccordion}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#A7C7E7', '#7BB0E1']}
          style={styles.menuItemIconBackground}
        >
          <Ionicons name={iconName} size={22} color="#fff" />
        </LinearGradient>
        <Text style={styles.menuItemText}>{label}</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-forward'}
          size={20}
          color="#888"
        />
      </TouchableOpacity>
      {expanded && <View style={styles.accordionContent}>{children}</View>}
    </View>
  );
};

const ProfileScreen = ({ navigation }) => {
  const { user, userData, loading, refreshUser, logout, userId } =
    useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (user?.uid && userId) {
        refreshUser();
      }
    }, [user?.uid, refreshUser, userId]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (user?.uid && userId) {
      await refreshUser();
    }
    setRefreshing(false);
  }, [user?.uid, refreshUser, userId]);

  const profileImageUri =
    typeof userData?.profileImage === 'string' && userData.profileImage
      ? userData.profileImage
      : DEFAULT_AVATAR;

  const images = [{ url: profileImageUri }];

  return (
    <View style={styles.outerContainer}>
      {loading ? (
        <ProfileScreenSkeleton />
      ) : (
        <>
          <StatusBar backgroundColor="#FF6B6B" barStyle="light-content" />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={primaryColor}
              />
            }
          >
            <LinearGradient
              colors={['#FF6B6B', primaryColor]}
              style={styles.headerBackground}
            >
              <View style={styles.header}>
                <Text style={styles.mainTitle}>Profile</Text>
                <TouchableOpacity
                  style={styles.editIcon}
                  onPress={() => navigation.navigate('EditProfileScreen')}
                >
                  <Icon name="pencil" size={18} color={primaryColor} />
                </TouchableOpacity>
              </View>

              <View style={styles.profileSection}>
                <TouchableOpacity
                  onPress={() => setIsImageViewerVisible(true)}
                  activeOpacity={0.8}
                  style={styles.avatarWrapper}
                >
                  <Image
                    source={{ uri: profileImageUri }}
                    style={styles.avatar}
                  />
                  <View style={styles.avatarBadge}>
                    <Ionicons name="camera-outline" size={18} color="#fff" />
                  </View>
                </TouchableOpacity>
                <Text style={styles.userName} numberOfLines={1}>
                  {userData?.fullName ?? generateRandomName()}
                </Text>
                {userData?.email && (
                  <Text style={styles.userContact}>{userData.email}</Text>
                )}
                {userData?.phone && (
                  <Text style={styles.userContact}>{userData.phone}</Text>
                )}
              </View>
            </LinearGradient>

            <View style={styles.menuSection}>
              <AccordionMenuItem
                iconName="help-circle-outline"
                label="Support & Help"
              >
                <View style={styles.subMenuItem}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color="#666"
                    style={styles.contactIcon}
                  />
                  <Text style={styles.contactText}>
                    Nominoinnovations@gmail.com
                  </Text>
                </View>
                <View style={styles.subMenuItem}>
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color="#666"
                    style={styles.contactIcon}
                  />
                  <Text style={styles.contactText}>+91-8606229268</Text>
                </View>
                <View style={styles.subMenuItem}>
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color="#666"
                    style={styles.contactIcon}
                  />
                  <Text style={styles.contactText}>+91-9048817123</Text>
                </View>
              </AccordionMenuItem>

              <AccordionMenuItem
                iconName="shield-checkmark-outline"
                label="Privacy Policy"
              >
                <View>
                  <PrivacyPolicyScreen />
                </View>
              </AccordionMenuItem>

              <AccordionMenuItem
                iconName="document-text-outline"
                label="Terms & Conditions"
              >
                <View>
                  <TermsAndConditionScreen />
                </View>
              </AccordionMenuItem>

              <TouchableOpacity
                style={styles.logoutButton}
                activeOpacity={0.8}
                onPress={logout}
              >
                <LinearGradient
                  colors={['#FF7F7F', '#FF4D4D']}
                  style={styles.menuItemIconBackground}
                >
                  <Ionicons name="log-out-outline" size={22} color="#fff" />
                </LinearGradient>
                <Text style={styles.logoutText}>Logout</Text>
                <Ionicons name="chevron-forward" size={20} color="#888" />
              </TouchableOpacity>
            </View>
          </ScrollView>

          <Modal visible={isImageViewerVisible} transparent={true}>
            <ImageViewer
              imageUrls={images}
              enableSwipeDown
              onSwipeDown={() => setIsImageViewerVisible(false)}
              onCancel={() => setIsImageViewerVisible(false)}
              renderHeader={() => (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsImageViewerVisible(false)}
                >
                  <Ionicons name="close" size={30} color="#fff" />
                </TouchableOpacity>
              )}
            />
          </Modal>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  headerBackground: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 40,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 25,
    position: 'relative',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  editIcon: {
    position: 'absolute',
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#fff',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    resizeMode: 'cover',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    padding: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  userContact: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 2,
    textAlign: 'center',
  },
  menuSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  menuItemIconBackground: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderRadius: 10,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  accordionContainer: {
    marginBottom: 12,
  },
  accordionContent: {
    backgroundColor: '#F9F9F9',
    padding: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginTop: -8,
    zIndex: -1,
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  contactIcon: {
    marginRight: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#555',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 14,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  logoutText: {
    flex: 1,
    fontSize: 16,
    color: '#FF4D4D',
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    zIndex: 99,
    padding: 10,
  },
});

export default ProfileScreen;
