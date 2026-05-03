import axios from 'axios';
import { format, formatDistanceToNow, isValid } from 'date-fns';
import { GOOGLE_MAPS_API_KEY } from '@env';
// const apiKey = GOOGLE_MAPS_API_KEY;
const apiKey = 'AIzaSyBOKng2fU2So-ep_9fPWQq3cq5lKVtq5BY';
export function formatFirestoreTimestamp(timestamp) {
  if (!timestamp?.seconds) return '';

  const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6);

  return `Added ${formatDistanceToNow(date, { addSuffix: true })}`;
}

export const formatDateTime = dateTime => {
  return formatDistanceToNow(dateTime, { addSuffix: true });
};

export const timeAgo = date => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (let interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }
  return 'just now';
};

export const formatTimestamp = timestamp => {
  const date = new Date(
    timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000,
  );
  return format(date, 'dd MMM yyyy');
};

export const convertFIrstCharToUpper = s => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const formatDate = dateString => {
  if (!dateString) return '-';

  const parts = dateString.split('-');
  if (parts.length !== 3) return '-';

  const [day, month, year] = parts.map(Number);
  const date = new Date(year, month - 1, day);

  if (!isValid(date)) return '-';

  return format(date, 'dd MMM yyyy');
};

export const formatTimeAgo = createdAt => {
  const date = createdAt?._seconds
    ? new Date(createdAt._seconds * 1000)
    : new Date(createdAt);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return `Added ${diffSec} seconds ago`;
  if (diffMin < 60) return `Added ${diffMin} minutes ago`;
  if (diffHr < 24) return `Added ${diffHr} hours ago`;
  if (diffDay < 7) return `Added ${diffDay} days ago`;
  return `Added on ${date.toLocaleDateString()}`;
};

export const formattedTimeAgo = dateString => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 },
  ];
  for (let i of intervals) {
    const count = Math.floor(seconds / i.seconds);
    if (count >= 1) {
      return `Added ${count} ${i.label}${count > 1 ? 's' : ''} ago`;
    }
  }
  return 'Just now';
};

export const formatServiceName = str => {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const getLatLngFromShortUrl = async shortUrl => {
  const response = await fetch(shortUrl, { redirect: 'follow' });
  const finalUrl = response.url;
  const match = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match) {
    return { latitude: parseFloat(match[1]), longitude: parseFloat(match[2]) };
  }
  return null;
};

export const getTotalRating = async placeId => {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews&key=${apiKey}`;

  try {
    const res = await axios.get(url);
    const reviewResponse = {
      rating: 0,
      reviews: [],
    };
    if (res && res.data && res.data?.result) {
      return res.data.result;
    } else {
      return reviewResponse;
    }
  } catch (error) {
    return error;
  }
};

export const getPlaceIdFromName = async name => {
  let url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${name}&inputtype=textquery&fields=place_id&key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data) {
    return data.candidates[0].place_id;
  }
};

export const getLatLngFromAddress = async (name, address) => {
  try {
    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address,
    )}&key=${apiKey}`;
    console.log('APIURL************************,', apiUrl);
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      let placeId = null;
      if (lat && lng) {
        placeId = await getPlaceIdFromName(name);
      }
      let totalRating = 0;
      if (placeId) {
        totalRating = await getTotalRating(placeId);
      }
      if (totalRating.rating) {
        totalRating = totalRating.rating;
      }

      console.log('********************', {
        coordinates: { latitude: lat, longitude: lng },
        placeId,
        totalRating,
      });

      return {
        coordinates: { latitude: lat, longitude: lng },
        placeId,
        totalRating,
      };
    }

    return {
      coordinates: null,
      placeId: null,
      totalRating: null,
    };
  } catch (error) {
    return error;
  }
};

export const generateRandomName = () => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};
