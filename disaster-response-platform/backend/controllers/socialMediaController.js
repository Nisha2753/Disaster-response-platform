const supabase = require('../services/supabaseService');
const { fetchSocialMediaPosts } = require('../services/socialMediaService');
const { getCachedData, setCachedData } = require('../services/cacheService');
const { logAction } = require('../utils/logger');
const { io } = require('../sockets');

// Constants
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// GET /disasters/:id/social-media
exports.getSocialMediaReports = async (req, res) => {
  try {
    const { id: disasterId } = req.params;

    // Step 1: Get disaster info
    const { data: disaster, error: disasterError } = await supabase
      .from('disasters')
      .select('title, tags, location_name')
      .eq('id', disasterId)
      .single();

    if (disasterError) return res.status(404).json({ error: 'Disaster not found' });

    const cacheKey = `social_media_${disasterId}`;
    const cached = await getCachedData(cacheKey);

    // Step 2: Return from cache if valid
    if (cached) {
      logAction(`Social media: cache hit for ${disaster.title}`);
      return res.status(200).json(cached);
    }

    // Step 3: Fetch new posts from Twitter/Bluesky/mock
    const query = `${disaster.tags.join(' ')} ${disaster.location_name}`;
    const posts = await fetchSocialMediaPosts(query);

    // Step 4: Cache result in Supabase
    await setCachedData(cacheKey, posts, CACHE_TTL_MS);

    // Step 5: Emit real-time update
    io.emit('social_media_updated', { disasterId, posts });

    logAction(`Social media: fresh fetch for ${disaster.title}`);
    res.status(200).json(posts);
  } catch (err) {
    console.error('Social media fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch social media reports' });
  }
};