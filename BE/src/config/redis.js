const Redis = require('ioredis');
const env = require('./env');

let redisClient = null;

if (env.redisUrl) {
  try {
    // Inisialisasi ioredis dengan retryStrategy agar tidak terus menerus mencoba jika server mati
    redisClient = new Redis(env.redisUrl, {
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        // Coba lagi setelah 2 detik, maks 3 kali retry untuk menghindari overload/blocking
        if (times > 3) {
          return null; // stop retrying
        }
        return 2000;
      }
    });

    redisClient.on('connect', () => {
      console.log('Redis connected successfully.');
    });

    redisClient.on('error', (err) => {
      console.error('Redis connection warning:', err.message);
    });
  } catch (err) {
    console.error('Failed to initialize Redis client:', err.message);
    redisClient = null;
  }
} else {
  console.warn('REDIS_URL is not set. Caching will be disabled.');
}

module.exports = {
  redisClient,
  isRedisEnabled: () => redisClient !== null && redisClient.status === 'ready',
};
