import React, { useContext, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Modal,
  Platform,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import ImageViewer from 'react-native-image-zoom-viewer';
import {
  primaryColor,
  primaryDark,
  primaryPale,
  dark,
  textMuted,
  surfaceMuted,
  borderMid,
} from '../../constants/colors';
import { AuthContext } from '../../context/AuthContext';
import ProfileScreenSkeleton from '../../components/ProfileScreenSkeleton/ProfileScreenSkeleton';
import { DEFAULT_AVATAR } from '../../constants/images';
import { useFocusEffect } from '@react-navigation/native';
import PrivacyPolicyScreen from '../PrivacyPolicyScreen/PrivacyPolicyScreen';
import TermsAndConditionScreen from '../TermsAndConditionScreen/TermsAndConditionScreen';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MenuItem = ({ iconName, iconBg, label, onPress, danger }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.75}>
    <LinearGradient colors={iconBg} style={styles.menuItemIconBg}>
      <Ionicons name={iconName} size={20} color="#fff" />
    </LinearGradient>
    <Text style={[styles.menuItemText, danger && { color: '#E53E3E' }]}>{label}</Text>
    <Ionicons name="chevron-forward" size={18} color={textMuted} />
  </TouchableOpacity>
);

const AccordionItem = ({ iconName, iconBg, label, children }) => {
  const [open, setOpen] = useState(false);
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(!open);
  };
  return (
    <View style={styles.accordionWrap}>
      <TouchableOpacity style={styles.menuItem} onPress={toggle} activeOpacity={0.75}>
        <LinearGradient colors={iconBg} style={styles.menuItemIconBg}>
          <Ionicons name={iconName} size={20} color="#fff" />
        </LinearGradient>
        <Text style={styles.menuItemText}>{label}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-forward'} size={18} color={textMuted} />
      </TouchableOpacity>
      {open && <View style={styles.accordionBody}>{children}</View>}
    </View>
  );
};

const ProfileScreen = ({ navigation }) => {
  const { userData, loading, refreshUser, logout } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);
  const [imgVisible, setImgVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshUser();
    }, []),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshUser();
    setRefreshing(false);
  }, [refreshUser]);

  const profileImageUri =
    typeof userData?.profileImage === 'string' && userData.profileImage
      ? userData.profileImage
      : DEFAULT_AVATAR;

  if (loading) {
    return <ProfileScreenSkeleton />;
  }

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor={primaryColor} barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />
        }
      >
        {/* Header Gradient */}
        <LinearGradient
          colors={[primaryDark, primaryColor]}
          style={styles.headerGrad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>My Profile</Text>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('EditProfileScreen')}
            >
              <Ionicons name="pencil" size={16} color={primaryColor} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={() => setImgVisible(true)}
            activeOpacity={0.85}
          >
            <Image source={{ uri: profileImageUri }} style={styles.avatar} />
            <View style={styles.avatarBadge}>
              <Ionicons name="camera-outline" size={14} color="#fff" />
            </View>
          </TouchableOpacity>

          <Text style={styles.userName} numberOfLines={1}>
            {userData?.username || 'User'}
          </Text>
          {userData?.email ? (
            <Text style={styles.userSub}>{userData.email}</Text>
          ) : null}
          {userData?.phone ? (
            <Text style={styles.userSub}>{userData.phone}</Text>
          ) : null}
        </LinearGradient>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Appointments', icon: 'calendar-outline' },
            { label: 'Favorites', icon: 'heart-outline' },
            { label: 'Reviews', icon: 'star-outline' },
          ].map(s => (
            <View key={s.label} style={styles.statItem}>
              <Ionicons name={s.icon} size={22} color={primaryColor} />
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          <MenuItem
            iconName="person-outline"
            iconBg={[primaryDark, primaryColor]}
            label="Edit Profile"
            onPress={() => navigation.navigate('EditProfileScreen')}
          />

          <MenuItem
            iconName="calendar-outline"
            iconBg={['#9B59B6', '#8E44AD']}
            label="My Appointments"
            onPress={() => navigation.navigate('Appointment')}
          />

          <AccordionItem
            iconName="help-circle-outline"
            iconBg={['#3498DB', '#2980B9']}
            label="Support & Help"
          >
            <View style={styles.contactRow}>
              <Ionicons name="mail-outline" size={18} color={textMuted} />
              <Text style={styles.contactText}>Nominoinnovations@gmail.com</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="call-outline" size={18} color={textMuted} />
              <Text style={styles.contactText}>+91-8606229268</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="call-outline" size={18} color={textMuted} />
              <Text style={styles.contactText}>+91-9048817123</Text>
            </View>
          </AccordionItem>

          <AccordionItem
            iconName="shield-checkmark-outline"
            iconBg={['#27AE60', '#229954']}
            label="Privacy Policy"
          >
            <PrivacyPolicyScreen />
          </AccordionItem>

          <AccordionItem
            iconName="document-text-outline"
            iconBg={['#F39C12', '#D68910']}
            label="Terms & Conditions"
          >
            <TermsAndConditionScreen />
          </AccordionItem>

          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            onPress={logout}
            activeOpacity={0.75}
          >
            <LinearGradient colors={['#E74C3C', '#C0392B']} style={styles.menuItemIconBg}>
              <Ionicons name="log-out-outline" size={20} color="#fff" />
            </LinearGradient>
            <Text style={[styles.menuItemText, { color: '#E53E3E' }]}>Logout</Text>
            <Ionicons name="chevron-forward" size={18} color="#E53E3E" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={imgVisible} transparent>
        <ImageViewer
          imageUrls={[{ url: profileImageUri }]}
          enableSwipeDown
          onSwipeDown={() => setImgVisible(false)}
          onCancel={() => setImgVisible(false)}
          renderHeader={() => (
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setImgVisible(false)}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          )}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },

  headerGrad: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 22,
    position: 'relative',
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
  editBtn: {
    position: 'absolute',
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarWrapper: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  avatar: { width: 94, height: 94, borderRadius: 47, resizeMode: 'cover' },
  avatarBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 4 },
  userSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 2 },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },
  statItem: { alignItems: 'center', gap: 6 },
  statLabel: { fontSize: 12, color: textMuted, fontWeight: '500' },

  menuSection: { paddingHorizontal: 20, marginTop: 20 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  menuItemIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuItemText: { flex: 1, fontSize: 15, color: dark, fontWeight: '500' },
  accordionWrap: { marginBottom: 10 },
  accordionBody: {
    backgroundColor: surfaceMuted,
    borderRadius: 14,
    padding: 14,
    marginTop: -8,
    borderWidth: 1,
    borderColor: borderMid,
  },
  contactRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10 },
  contactText: { fontSize: 13, color: dark },
  logoutItem: { marginTop: 6 },

  closeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    zIndex: 99,
    padding: 8,
  },
});

export default ProfileScreen;
