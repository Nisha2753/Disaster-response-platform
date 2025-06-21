const axios = require('axios');
const { logAction } = require('../utils/logger');

const OPENCAGE_API_KEY = process.env.OPENCAGE_API_KEY;

/**
 * Reverse geocoding: converts lat/lon to a human-readable location
 */
async function reverseGeocode(lat, lon) {
  try {
    const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
      params: {
        key: OPENCAGE_API_KEY,
        q: `${lat},${lon}`,
        pretty: 1,
        no_annotations: 1
      }
    });

    const results = response.data.results;
    if (results.length === 0) return null;

    const location = results[0].formatted;
    logAction(`Reverse geocoded (${lat}, ${lon}) -> ${location}`);
    return location;
  } catch (error) {
    console.error('Geocoding error:', error.response?.data || error.message);
    throw new Error('Failed to reverse geocode location');
  }
}

module.exports = {
  reverseGeocode
};
