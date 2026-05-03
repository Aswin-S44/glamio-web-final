import React from 'react';
import { View, Text, StyleSheet, Image, FlatList } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { primaryColor, starColor } from '../../constants/colors';

const reviewsData = [
  {
    id: '1',
    name: 'Jonson Wiliam',
    time: '1 day ago',
    rating: 4.5,
    comment:
      'Contrary to popular besimp and world class lyrandom text. It has roots',
    image: require('../../assets/images/user.png'),
  },
  {
    id: '2',
    name: 'Shikha Das',
    time: '3 month ago',
    rating: 4,
    comment:
      'Contrary to popular besimp and world class lyrandom text. It has roots',
    image: require('../../assets/images/user.png'),
  },
  {
    id: '3',
    name: 'Fiza Kubila',
    time: '2 month ago',
    rating: 3,
    comment:
      'Contrary to popular besimp and world class lyrandom text. It has roots',
    image: require('../../assets/images/user.png'),
  },
];

const StarRating = ({ rating, size = 16 }) => {
  const stars = [];
  const filledStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < filledStars; i++) {
    stars.push(
      <Ionicons
        key={`star-filled-${i}`}
        name="star"
        size={size}
        color={starColor}
      />,
    );
  }

  if (hasHalfStar) {
    stars.push(
      <Ionicons
        key="star-half"
        name="star-half-sharp"
        size={size}
        color={starColor}
      />,
    );
  }

  const emptyStars = 5 - stars.length;
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <Ionicons
        key={`star-empty-${i}`}
        name="star-outline"
        size={size}
        color="#D3D3D3"
      />,
    );
  }

  return <View style={styles.starContainer}>{stars}</View>;
};

const ProgressBar = ({ label, percentage }) => (
  <View style={styles.progressContainer}>
    <Text style={styles.progressLabel}>{label}</Text>
    <View style={styles.progressBarBackground}>
      <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
    </View>
  </View>
);

const ReviewItem = ({ item }) => (
  <View style={styles.reviewItemContainer}>
    <Image source={item.image} style={styles.avatar} />
    <View style={styles.reviewContent}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewerName}>{item.name}</Text>
      </View>
      <View style={styles.ratingRow}>
        <Text style={styles.reviewTime}>{item.time}</Text>
        <StarRating rating={item.rating} />
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
    </View>
  </View>
);

const Reviews = () => {
  return (
    <View style={styles.container}>
      <FlatList
        data={reviewsData}
        renderItem={({ item }) => <ReviewItem item={item} />}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
      <View style={styles.overallRatingContainer}>
        <View style={styles.overallHeader}>
          <Text style={styles.overallRatingNumber}>4.9</Text>
          <View>
            <Text style={styles.overallRatingTitle}>Overall Rating</Text>
            <View style={styles.overallStarsRow}>
              <StarRating rating={4.9} size={18} />
              <Text style={styles.reviewCountText}>(120) Good (5)</Text>
            </View>
          </View>
        </View>
        <View style={styles.progressSection}>
          <ProgressBar label="Service" percentage={90} />
          <ProgressBar label="Price" percentage={75} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
  },
  reviewItemContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  reviewContent: {
    flex: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  reviewTime: {
    fontSize: 13,
    color: '#888',
    marginRight: 10,
  },
  starContainer: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 15,
    color: '#555',
    marginTop: 6,
    lineHeight: 22,
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 16,
  },
  overallRatingContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  overallHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overallRatingNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 15,
  },
  overallRatingTitle: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  overallStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  reviewCountText: {
    fontSize: 14,
    color: '#888',
    marginLeft: 8,
  },
  progressSection: {
    marginTop: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 16,
    color: '#555',
    width: 70,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#EAEAEA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: primaryColor,
    borderRadius: 4,
  },
});

export default Reviews;
