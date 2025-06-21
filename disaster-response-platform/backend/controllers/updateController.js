const supabase = require('../services/supabaseService');
const { logAction } = require('../utils/logger');
const { io } = require('../sockets');

// POST /updates
exports.createUpdate = async (req, res) => {
  try {
    const { disaster_id, message, author } = req.body;

    if (!disaster_id || !message || !author) {
      return res.status(400).json({ error: 'disaster_id, message, and author are required' });
    }

    const { data, error } = await supabase
      .from('updates')
      .insert([{ disaster_id, message, author }])
      .select();

    if (error) {
      console.error('Create update error:', error);
      return res.status(500).json({ error: 'Failed to create update' });
    }

    logAction(`Update created for disaster ${disaster_id} by ${author}`);
    io.emit('new_update', data[0]);

    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Unexpected error creating update:', err);
    res.status(500).json({ error: 'Error creating update' });
  }
};

// GET /updates/:disasterId
exports.getUpdatesByDisasterId = async (req, res) => {
  try {
    const { disasterId } = req.params;

    const { data, error } = await supabase
      .from('updates')
      .select('*')
      .eq('disaster_id', disasterId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch updates error:', error);
      return res.status(500).json({ error: 'Failed to fetch updates' });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Unexpected error fetching updates:', err);
    res.status(500).json({ error: 'Error fetching updates' });
  }
};

// DELETE /updates/:updateId
exports.deleteUpdate = async (req, res) => {
  try {
    const { updateId } = req.params;

    const { data, error } = await supabase
      .from('updates')
      .delete()
      .eq('id', updateId)
      .select();

    if (error) {
      console.error('Delete update error:', error);
      return res.status(500).json({ error: 'Failed to delete update' });
    }

    logAction(`Update ${updateId} deleted`);
    io.emit('update_deleted', { id: updateId });

    res.status(200).json({ message: 'Update deleted', deleted: data });
  } catch (err) {
    console.error('Unexpected error deleting update:', err);
    res.status(500).json({ error: 'Error deleting update' });
  }
};
