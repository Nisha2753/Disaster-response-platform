const cache = new Map();

/**
 * Set a value in cache with optional TTL (milliseconds)
 */
function setCache(key, value, ttl = 5 * 60 * 1000) {
  const expireAt = Date.now() + ttl;
  cache.set(key, { value, expireAt });
}

/**
 * Get a value from cache if it hasn’t expired
 */
function getCache(key) {
  const cached = cache.get(key);
  if (!cached) return null;

  if (Date.now() > cached.expireAt) {
    cache.delete(key);
    return null;
  }

  return cached.value;
}

/**
 * Clear the cache (optional utility)
 */
function clearCache() {
  cache.clear();
}

module.exports = {
  setCache,
  getCache,
  clearCache
};
