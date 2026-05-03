import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

const BulletPoint = ({ text }) => (
  <View style={styles.bulletContainer}>
    <View style={styles.bullet} />
    <Text style={styles.bulletText}>{text}</Text>
  </View>
);

const PrivacyPolicyScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/home_bg-1.png')}
          style={styles.headerImage}
        />
        <View style={styles.overlay} />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color="#fff" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.mainTitle}>Privacy & Policy</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Information We Collect Form You
          </Text>
          <Text style={styles.paragraph}>
            Contrary to popular belief, Lorem Inosimplyrandom and text. It has
            roots in a piece of classical Latin literature 45 BC, making it over
            2000 years old.
          </Text>
          <BulletPoint text="Distracted by the readable content of a page when looking at its layout." />
          <BulletPoint text="Distracted by the readable content of a page when looking at its layout." />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services & Offers</Text>
          <Text style={styles.paragraph}>
            Contrary to popular belief, Lorelpsnosimplyrandom car text. It has
            roots a piece of classical Latin liteture 45 BC, making it over 2000
            years old.
          </Text>
          <BulletPoint text="Distracted by the readable content of a page when looking at its layout." />
          <BulletPoint text="Distracted by the readable content of a page when looking at its layout." />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Driver Pass Price and Service Free
          </Text>
          <Text style={styles.paragraph}>
            Contrary to popular belief, Lorem Inosimplyrandom and text. It has
            roots in a piece of classical Latin literature 45 BC, making it over
            2000 years old.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    height: 120,
    justifyContent: 'center',
    paddingTop: 20,
  },
  headerImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(128, 0, 128, 0.6)',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 5,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingHorizontal: 25,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 25,
    color: '#333',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 15,
  },
  bulletContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8e44ad',
    marginTop: 7,
    marginRight: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
});

export default PrivacyPolicyScreen;
