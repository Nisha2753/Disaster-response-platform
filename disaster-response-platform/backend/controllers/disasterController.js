const supabase = require('../services/supabaseService');
const { extractLocationFromText, geocodeLocation } = require('../services/geocodingService');
const { logAction } = require('../utils/logger');
const { io } = require('../sockets'); // WebSocket server instance

// Create a disaster
exports.createDisaster = async (req, res) => {
  try {
    const { title, location_name, description, tags, owner_id } = req.body;

    // Step 1: Extract location name if not provided
    let finalLocationName = location_name;
    if (!finalLocationName) {
      finalLocationName = await extractLocationFromText(description);
    }

    // Step 2: Convert location name to lat/lng
    const location = await geocodeLocation(finalLocationName);

    // Step 3: Insert into Supabase
    const { data, error } = await supabase
      .from('disasters')
      .insert([
        {
          title,
          location_name: finalLocationName,
          location,
          description,
          tags,
          owner_id,
          audit_trail: [{ action: 'create', user_id: owner_id, timestamp: new Date().toISOString() }]
        }
      ])
      .select();

    if (error) return res.status(500).json({ error: error.message });

    // Step 4: Log & WebSocket emit
    logAction(`Disaster created: ${title}`);
    io.emit('disaster_updated', data[0]);

    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Create disaster error:', err);
    res.status(500).json({ error: 'Failed to create disaster' });
  }
};

// Get all disasters (with optional tag filter)
exports.getDisasters = async (req, res) => {
  try {
    const { tag } = req.query;
    let query = supabase.from('disasters').select('*');

    if (tag) {
      query = query.contains('tags', [tag]);
    }

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json(data);
  } catch (err) {
    console.error('Fetch disasters error:', err);
    res.status(500).json({ error: 'Failed to fetch disasters' });
  }
};

// Update disaster by ID
exports.updateDisaster = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, location_name, description, tags, owner_id } = req.body;

    let updatePayload = { title, location_name, description, tags };
    if (location_name) {
      const location = await geocodeLocation(location_name);
      updatePayload.location = location;
    }

    // Append to audit trail
    const { data: current } = await supabase.from('disasters').select('audit_trail').eq('id', id).single();
    const newAuditTrail = current?.audit_trail || [];
    newAuditTrail.push({ action: 'update', user_id: owner_id, timestamp: new Date().toISOString() });

    updatePayload.audit_trail = newAuditTrail;

    const { data, error } = await supabase
      .from('disasters')
      .update(updatePayload)
      .eq('id', id)
      .select();

    if (error) return res.status(500).json({ error: error.message });

    logAction(`Disaster updated: ${id}`);
    io.emit('disaster_updated', data[0]);

    res.status(200).json(data[0]);
  } catch (err) {
    console.error('Update disaster error:', err);
    res.status(500).json({ error: 'Failed to update disaster' });
  }
};

// Delete disaster by ID
exports.deleteDisaster = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase.from('disasters').delete().eq('id', id).select();

    if (error) return res.status(500).json({ error: error.message });

    logAction(`Disaster deleted: ${id}`);
    io.emit('disaster_updated', { id, deleted: true });

    res.status(200).json({ message: 'Disaster deleted', data });
  } catch (err) {
    console.error('Delete disaster error:', err);
    res.status(500).json({ error: 'Failed to delete disaster' });
  }
};