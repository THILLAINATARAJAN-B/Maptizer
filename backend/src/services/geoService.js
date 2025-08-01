const axios = require('axios');

async function getCoordinates(locationName) {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: {
        q: locationName,
        format: 'json',
        limit: 1
      },
      headers: {
        'User-Agent': 'QlooMapApp/1.0'
      }
    });
    
    if (response.data && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return { 
        lat: parseFloat(parseFloat(lat).toFixed(6)), 
        lon: parseFloat(parseFloat(lon).toFixed(6)) 
      };
    }
    
    return { lat: 11.016845, lon: 76.955833 };
  } catch (error) {
    console.error('Geocoding error:', error);
    return { lat: 11.016845, lon: 76.955833 };
  }
}

module.exports = { getCoordinates };