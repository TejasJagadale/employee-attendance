import { Client } from "@googlemaps/google-maps-services-js";

const client = new Client({});
const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const cache = new Map(); // Simple in-memory cache

export const reverseGeocode = async (lat, lon) => {
  const cacheKey = `${lat},${lon}`;
  
  // Return cached result if available
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const response = await client.reverseGeocode({
      params: {
        latlng: { lat: parseFloat(lat), lng: parseFloat(lon) },
        key: API_KEY,
        language: 'en',
        location_type: 'ROOFTOP'
      },
      timeout: 2000
    });
    
    if (response.data.status === 'OK') {
      const address = response.data.results[0].formatted_address;
      cache.set(cacheKey, address); // Cache the result
      return address;
    }
    return "Location not available";
  } catch (error) {
    console.error("Geocoding error:", error);
    return "Unable to fetch location";
  }
};