import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Animated,
} from 'react-native';
import { getGalleryImages } from '../../apis/services';
import EmptyComponent from '../../components/EmptyComponent/EmptyComponent';
import { primaryColor } from '../../constants/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ServiceCardSkeleton from '../../components/ServiceCardSkeleton/ServiceCardSkeleton';

const { width } = Dimensions.get('window');
const cardSize = (width - 24 * 2 - 16) / 2;

const GalleryItem = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)}>
      <Image source={{ uri: item }} style={styles.image} />
    </TouchableOpacity>
  );
};

const GallerySection = ({ placeId }) => {
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const flatListRef = useRef(null);
  const swipeHintAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchGallery = async () => {
      if (placeId) {
        setLoading(true);
        const res = await getGalleryImages(placeId);
        if (res && res.length > 0) {
          setImages(res);
        }
        setLoading(false);
      }
    };
    fetchGallery();
  }, [placeId]);

  const handleImagePress = imageUrl => {
    const index = images.indexOf(imageUrl);
    setSelectedImageIndex(index);
    setModalVisible(true);
    triggerSwipeHint();
  };

  const triggerSwipeHint = () => {
    swipeHintAnim.setValue(0);
    Animated.sequence([
      Animated.timing(swipeHintAnim, {
        toValue: 1,
        duration: 11000,
        useNativeDriver: true,
      }),
      Animated.timing(swipeHintAnim, {
        toValue: 0,
        duration: 11000,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const goToNextImage = () => {
    const newIndex =
      selectedImageIndex === images.length - 1 ? 0 : selectedImageIndex + 1;
    setSelectedImageIndex(newIndex);
    flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
  };

  const goToPreviousImage = () => {
    const newIndex =
      selectedImageIndex === 0 ? images.length - 1 : selectedImageIndex - 1;
    setSelectedImageIndex(newIndex);
    flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
  };

  const renderModalImage = ({ item }) => (
    <Image
      source={{ uri: item }}
      style={styles.fullScreenImage}
      resizeMode="contain"
    />
  );

  const swipeHintTranslateX = swipeHintAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [-20, 20, 0],
  });

  const swipeHintOpacity = swipeHintAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 0],
  });

  return (
    <>
      {loading ? (
        <ServiceCardSkeleton />
      ) : images.length === 0 ? (
        <EmptyComponent />
      ) : (
        <FlatList
          data={images}
          renderItem={({ item }) => (
            <GalleryItem item={item} onPress={handleImagePress} />
          )}
          keyExtractor={item => item}
          numColumns={2}
          contentContainerStyle={styles.container}
          columnWrapperStyle={styles.row}
        />
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <FlatList
              ref={flatListRef}
              data={images}
              renderItem={renderModalImage}
              keyExtractor={(item, index) => item + index}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={selectedImageIndex}
              getItemLayout={(data, index) => ({
                length: width,
                offset: width * index,
                index,
              })}
              onScrollToIndexFailed={info => {
                const wait = new Promise(resolve => setTimeout(resolve, 500));
                wait.then(() => {
                  flatListRef.current?.scrollToIndex({
                    index: info.index,
                    animated: true,
                  });
                });
              }}
              onMomentumScrollEnd={event => {
                const newIndex = Math.round(
                  event.nativeEvent.contentOffset.x / width,
                );
                setSelectedImageIndex(newIndex);
              }}
            />

            <Animated.View
              style={[
                styles.swipeHintContainer,
                {
                  opacity: swipeHintOpacity,
                  transform: [{ translateX: swipeHintTranslateX }],
                },
              ]}
            >
              <Ionicons
                name="swap-horizontal-outline"
                size={40}
                color="white"
              />
              <Text style={styles.swipeHintText}>Swipe to view more</Text>
            </Animated.View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={20} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navButtonLeft}
              onPress={goToPreviousImage}
            >
              <Ionicons name="chevron-back" size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navButtonRight}
              onPress={goToNextImage}
            >
              <Ionicons name="chevron-forward" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
  },
  row: {
    justifyContent: 'space-between',
    flexDirection: 'column',
  },
  card: {
    width: '100%',
    height: cardSize,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  modalView: {
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
  },
  fullScreenImage: {
    width: Dimensions.get('window').width,
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonLeft: {
    position: 'absolute',
    top: '50%',
    left: 10,
    marginTop: -25,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonRight: {
    position: 'absolute',
    top: '50%',
    right: 10,
    marginTop: -25,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeHintContainer: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
  },
  swipeHintText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 16,
  },
});

export default GallerySection;
