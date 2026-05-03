import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

const StarRating = ({
  rating,
  size = 20,
  color = '#FFA500',
  emptyColor = '#FFFFFF',
}) => {
  const stars = [];
  const filledStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < filledStars; i++) {
    stars.push(
      <Ionicons key={`full-${i}`} name="star" size={size} color={color} />,
    );
  }

  if (hasHalfStar) {
    stars.push(
      <Ionicons key="half" name="star-half-sharp" size={size} color={color} />,
    );
  }

  const emptyStars = 5 - stars.length;
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <Ionicons
        key={`empty-${i}`}
        name="star-outline"
        size={size}
        color={emptyColor}
      />,
    );
  }

  return <>{stars}</>;
};

export default StarRating;
