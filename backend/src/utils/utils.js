import axios from "axios";
import dotenv from "dotenv";
import { cloudinary } from "../config/cloudinary.js";
const apiKey = process.env.GOOGLE_MAPS_API_KEY;

export const getPlaceIdFromName = async (name) => {
  let url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${name}&inputtype=textquery&fields=place_id&key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data) {
    return data.candidates[0].place_id;
  }
};

// export const getLatLngFromAddress = async (name, address) => {
//   try {
//     const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
//       address
//     )}&key=${apiKey}`;

//     const res = await fetch(apiUrl);
//     const data = await res.json();

//     if (data.results.length > 0) {
//       const { lat, lng } = data.results[0].geometry.location;
//       let placeId = null;
//       if (lat && lng) {
//         placeId = await getPlaceIdFromName(name);
//       }
//       let totalRating = 0;
//       if (placeId) {
//         totalRating = await getTotalRating(placeId);
//       }
//       if (totalRating.rating) {
//         totalRating = totalRating.rating;
//       }

//       return {
//         coordinates: { latitude: lat, longitude: lng },
//         placeId,
//         totalRating,
//       };
//     }

//     return {
//       coordinates: null,
//       placeId: null,
//       totalRating: null,
//     };
//   } catch (error) {
//     return error;
//   }
// };

export const getTotalRating = async (placeId) => {
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

export const getLatLngFromAddress = async (name, address) => {
  try {
    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${apiKey}`;

    const res = await fetch(apiUrl);
    const data = await res.json();

    if (data.results && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      let placeId = null;
      let totalRating = null;

      if (lat && lng) {
        placeId = await getPlaceIdFromName(name);
      }

      if (placeId) {
        const ratingData = await getTotalRating(placeId);

        totalRating = ratingData.rating || null;
      }

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
    return {
      coordinates: null,
      placeId: null,
      totalRating: null,
      error: error.message,
    };
  }
};

export const uploadImageToCloudinary = async (base64Image) => {
  if (!base64Image || !base64Image.startsWith("data:")) {
    return null;
  }

  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "shop_images",
      transformation: [{ width: 1000, height: 1000, crop: "limit" }],
    });
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return null;
  }
};

export const uploadMultipleImagesToCloudinary = async (base64Images) => {
  if (!base64Images || !Array.isArray(base64Images)) {
    return [];
  }

  const uploadPromises = base64Images
    .filter((img) => img && img.startsWith("data:"))
    .map((img) => uploadImageToCloudinary(img));

  const results = await Promise.all(uploadPromises);
  return results.filter((url) => url !== null);
};
