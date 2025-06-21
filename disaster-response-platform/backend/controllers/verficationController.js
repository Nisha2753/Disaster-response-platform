const supabase = require('../services/supabaseService');
const { logAction } = require('../utils/logger');
const { io } = require('../sockets');

// PATCH /verifications/:id
exports.verifyEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { verified_by, status, remarks } = req.body;

    if (!verified_by || !status) {
      return res.status(400).json({ error: 'verified_by and status are required' });
    }

    const { data, error } = await supabase
      .from('verifications')
      .update({
        status,
        verified_by,
        remarks: remarks || null,
        verified_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Verification update error:', error);
      return res.status(500).json({ error: 'Failed to verify entry' });
    }

    logAction(`Entry ${id} verified as ${status} by ${verified_by}`);
    io.emit('entry_verified', { id, status, verified_by });

    res.status(200).json({ message: 'Entry verified', data: data[0] });
  } catch (err) {
    console.error('Unexpected error verifying entry:', err);
    res.status(500).json({ error: 'Error verifying entry' });
  }
};

// GET /verifications?status=pending
exports.getVerifications = async (req, res) => {
  try {
    const { status } = req.query;

    const query = supabase.from('verifications').select('*');

    if (status) {
      query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Verification fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch verifications' });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Unexpected error fetching verifications:', err);
    res.status(500).json({ error: 'Error fetching verifications' });
  }
};
