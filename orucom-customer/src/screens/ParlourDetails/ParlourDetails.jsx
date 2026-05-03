import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Reviews from '../../components/Reviews/Reviews';
import { primaryColor } from '../../constants/colors';
import ServiceSection from '../../sections/ServiceSection/ServiceSection';
import GallerySection from '../../sections/GallerySection/GallerySection';
import { NO_IMAGE } from '../../constants/images';
import StarRating from '../../components/StarRating/StarRating';
import AboutSection from '../../sections/AboutSection/AboutSection';
import { updateShopViewers } from '../../apis/services';

const ParlourDetails = ({ route, navigation }) => {
  const { parlourData } = route.params;

  const [activeTab, setActiveTab] = React.useState('Service');
  const [services, setServices] = React.useState([]);
  const [offers, setOffers] = React.useState([]);
  const [loadingServices, setLoadingServices] = React.useState(false);
  const [loadingOffers, setLoadingOffers] = React.useState(false);
  const [experts, setExperts] = useState([]);

  useEffect(() => {
    if (parlourData) {
      if (parlourData?.services?.length > 0) {
        setServices(parlourData?.services ?? []);
      }
      if (parlourData?.offers?.length > 0) {
        setOffers(parlourData?.offers ?? []);
      }
      if (parlourData?.experts?.length > 0) {
        setExperts(parlourData?.experts ?? []);
      }
    }
  }, [parlourData]);

  useEffect(() => {
    if (parlourData) {
      updateShopViewers(parlourData.id);
    }
  }, [parlourData]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" />
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              typeof parlourData.profileImage === 'string'
                ? parlourData.profileImage
                : NO_IMAGE,
          }}
          style={styles.image}
        />
        <View style={styles.overlay} />

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>{parlourData?.parlourName ?? ''}</Text>
            <Text style={styles.locationText}>
              {parlourData?.address ?? ''}
            </Text>
            <View style={styles.ratingContainer}>
              <StarRating rating={parlourData.totalRating ?? 4.5} />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Service' && styles.activeTab]}
          onPress={() => setActiveTab('Service')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'Service' && styles.activeTabText,
            ]}
          >
            Service
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'About' && styles.activeTab]}
          onPress={() => setActiveTab('About')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'About' && styles.activeTabText,
            ]}
          >
            About
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'Gallery' && styles.activeTab]}
          onPress={() => setActiveTab('Gallery')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'Gallery' && styles.activeTabText,
            ]}
          >
            Gallery
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Review' && styles.activeTab]}
          onPress={() => setActiveTab('Review')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'Review' && styles.activeTabText,
            ]}
          >
            Review
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'About' && (
        <AboutSection
          about={parlourData?.about ?? ''}
          experts={experts}
          phone={parlourData?.phone ?? ''}
          email={parlourData?.email ?? ''}
          googleReviewUrl={parlourData?.googleReviewUrl ?? ''}
          address={parlourData?.address ?? ''}
        />
      )}

      {activeTab === 'Service' && (
        <View style={styles.content}>
          <ServiceSection
            shopId={parlourData.uid}
            initialServices={services}
            initialOffers={offers}
            loadingServices={loadingServices}
            loadingOffers={loadingOffers}
            experts={experts}
          />
        </View>
      )}

      {activeTab === 'Gallery' && (
        <View style={styles.content}>
          <GallerySection
            shopId={parlourData?.uid}
            placeId={parlourData?.placeId}
          />
        </View>
      )}

      {activeTab === 'Review' && (
        <View style={styles.content}>
          <Reviews placeId={parlourData?.placeId ?? null} />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    height: 300,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
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
    fontSize: 18,
    marginLeft: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    color: '#fff',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookButton: {
    backgroundColor: primaryColor,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginLeft: 10,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#000',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: primaryColor,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  activeTabText: {
    fontWeight: 'bold',
  },
  content: {
    // This style might need adjustment depending on other sections' needs
    // For AboutSection, it's better handled by the ScrollView and Card styles within it.
    flex: 1,
  },
});

export default ParlourDetails;
