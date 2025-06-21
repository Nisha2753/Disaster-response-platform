const supabase = require('../services/supabaseService');
const { logAction } = require('../utils/logger');
const { io } = require('../sockets');

// GET /disasters/:id/resources?lat=...&lon=...
exports.getNearbyResources = async (req, res) => {
  try {
    const { id: disasterId } = req.params;
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    if (isNaN(latNum) || isNaN(lonNum)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    // Build geospatial query
    const query = `
      SELECT * FROM resources 
      WHERE disaster_id = $1
        AND ST_DWithin(location, ST_SetSRID(ST_Point($2, $3), 4326), 10000)
    `;

    const { data, error } = await supabase.rpc('exec_sql', {
      sql: query,
      params: [disasterId, lonNum, latNum]
    });

    if (error) {
      console.error('Geospatial query error:', error);
      return res.status(500).json({ error: 'Failed to fetch resources' });
    }

    logAction(`Resource lookup: ${data.length} resources near (${lat}, ${lon})`);
    io.emit('resources_updated', { disasterId, count: data.length });

    res.status(200).json(data);
  } catch (err) {
    console.error('Resource fetch error:', err);
    res.status(500).json({ error: 'Error fetching resources' });
  }
};