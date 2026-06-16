const { redisClient, isRedisEnabled } = require('../config/redis');

function cacheMiddleware(ttl = 300) {
  return async (req, res, next) => {
    // Jika Redis tidak aktif atau tidak terhubung, lewati langsung ke controller
    if (!isRedisEnabled()) {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      const cachedData = await redisClient.get(key);
      if (cachedData) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('Content-Type', 'application/json');
        return res.send(cachedData);
      }

      // Cache Miss - Modifikasi res.json untuk menyimpan respons di Redis
      res.setHeader('X-Cache', 'MISS');
      const originalJson = res.json.bind(res);

      res.json = (body) => {
        // Simpan data ke Redis jika status respons sukses (2xx)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redisClient.set(key, JSON.stringify(body), 'EX', ttl).catch(err => {
            console.error('Failed to save to Redis cache:', err.message);
          });
        }
        return originalJson(body);
      };

      next();
    } catch (err) {
      console.error('Redis cache middleware warning:', err.message);
      next();
    }
  };
}

// Helper untuk menghapus cache dengan pola kunci tertentu
async function invalidateCache(pattern) {
  if (!isRedisEnabled()) return;
  try {
    // Cari semua kunci yang cocok dengan pattern
    const keys = await redisClient.keys(`cache:${pattern}`);
    if (keys.length > 0) {
      await redisClient.del(...keys);
      console.log(`Cache cleared for pattern "${pattern}" (${keys.length} keys deleted).`);
    }
  } catch (err) {
    console.error('Failed to invalidate cache:', err.message);
  }
}

module.exports = {
  cacheMiddleware,
  invalidateCache,
};
