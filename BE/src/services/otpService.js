const { redisClient, isRedisEnabled } = require('../config/redis');

const OTP_TTL_SECONDS = 300; // 5 menit
const OTP_PREFIX = 'otp:forgot:';

// In-memory fallback jika Redis tidak aktif
const memoryStore = new Map();

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 digit
}

async function storeOtp(email, otp) {
  const key = OTP_PREFIX + email.toLowerCase();

  if (isRedisEnabled()) {
    await redisClient.set(key, otp, 'EX', OTP_TTL_SECONDS);
  } else {
    memoryStore.set(key, otp);
    // Auto-cleanup setelah TTL
    setTimeout(() => {
      memoryStore.delete(key);
    }, OTP_TTL_SECONDS * 1000);
  }
}

async function verifyOtp(email, otp) {
  const key = OTP_PREFIX + email.toLowerCase();

  let storedOtp;
  if (isRedisEnabled()) {
    storedOtp = await redisClient.get(key);
  } else {
    storedOtp = memoryStore.get(key) || null;
  }

  if (!storedOtp) {
    return { valid: false, reason: 'OTP sudah kedaluwarsa atau tidak ditemukan.' };
  }

  if (storedOtp !== String(otp)) {
    return { valid: false, reason: 'Kode OTP salah.' };
  }

  // OTP valid, hapus agar tidak bisa dipakai ulang
  if (isRedisEnabled()) {
    await redisClient.del(key);
  } else {
    memoryStore.delete(key);
  }

  return { valid: true };
}

module.exports = {
  generateOtp,
  storeOtp,
  verifyOtp,
};
