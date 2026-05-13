const Redis = require('ioredis');
const { redisHost, redisPort } = require('./env');

const redis = new Redis({
  host: redisHost,
  port: redisPort,
  // BullMQ requires maxRetriesPerRequest to be null
  maxRetriesPerRequest: null,
});

// Function to wait for Redis to be ready with timeout
const waitForReady = (timeout = 15000) => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Redis connection timeout after ${timeout}ms`));
    }, timeout);

    redis.once('ready', () => {
      clearTimeout(timeoutId);
      resolve();
    });
    redis.once('error', (err) => {
      clearTimeout(timeoutId);
      reject(err);
    });
  });
};

module.exports = {
  redis,
  waitForReady,
};
