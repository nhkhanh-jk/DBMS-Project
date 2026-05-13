const Redis = require('ioredis');
const { redisHost, redisPort } = require('../config/env');

const redis = new Redis({
  host: redisHost,
  port: redisPort,
  // BullMQ requires maxRetriesPerRequest to be null
  maxRetriesPerRequest: null,
});

// Cache keys
const CACHE_KEYS = {
  MOVIES_ALL: 'movies:all',
  MOVIES_BY_STATUS: function(status) {
    return `movies:status:${status}`;
  },
  SHOWTIMES_ALL: 'showtimes:all',
};

// Cache TTL in seconds
const CACHE_TTL = {
  MOVIES: 300, // 5 minutes
  SHOWTIMES: 120, // 2 minutes
};

// Helper functions for cache operations
const get = async (key) => {
  return await redis.get(key);
};

const set = async (key, value, ttl) => {
  await redis.set(key, JSON.stringify(value), 'EX', ttl);
};

const invalidateMoviesCache = async () => {
  await redis.del(CACHE_KEYS.MOVIES_ALL);
  // Note: In a real implementation, we might want to clear all movie-related caches
};

const invalidateShowtimesCache = async () => {
  await redis.del(CACHE_KEYS.SHOWTIMES_ALL);
  // Note: In a real implementation, we might want to clear all showtime-related caches
};

module.exports = {
  redis,
  get,
  set,
  invalidateMoviesCache,
  invalidateShowtimesCache,
  CACHE_KEYS,
  CACHE_TTL,
};
