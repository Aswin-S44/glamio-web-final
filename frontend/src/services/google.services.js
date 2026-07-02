import axios from "axios";
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export const getReviews = async (placeId, page = 0) => {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews&key=${GOOGLE_MAPS_API_KEY}`;
  try {
    const res = await axios.get(url);
    if (res?.data?.result) {
      return res.data.result;
    } else {
      return { rating: 0, reviews: [] };
    }
  } catch (error) {
    return { rating: 0, reviews: [] };
  }
};
  