const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { findUserByEmail, findRoleByName, createUser, updateUserPassword } = require('../models/userModel');
const { generateOtp, storeOtp, verifyOtp } = require('./otpService');
const { sendOtpEmail } = require('./mailService');

const LOGIN_ALLOWED_ROLES = new Set(['member', 'admin']);
const REGISTER_ALLOWED_ROLE = 'member';
const MIN_PASSWORD_LENGTH = 6;

function isUserBanned(user) {
  if (!user.is_banned) {
    return false;
  }
  if (!user.banned_until) {
    return true; // Ban permanen
  }
  const bannedDate = new Date(user.banned_until);
  return Number.isNaN(bannedDate.getTime()) ? false : bannedDate > new Date();
}

async function loginUser({ email, password }) {
  const user = await findUserByEmail(email);

  if (!user) {
    return {
      success: false,
      statusCode: 401,
      message: 'Email atau password salah.',
    };
  }

  if (isUserBanned(user)) {
    return {
      success: false,
      statusCode: 403,
      message: user.banned_reason || 'Akun Anda sedang diblokir.',
    };
  }

  if (!LOGIN_ALLOWED_ROLES.has(user.role_name)) {
    return {
      success: false,
      statusCode: 403,
      message: 'Role akun ini tidak memiliki akses login.',
    };
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatch) {
    return {
      success: false,
      statusCode: 401,
      message: 'Email atau password salah.',
    };
  }

  const tokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role_name,
  };

  const token = jwt.sign(tokenPayload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

  return {
    success: true,
    statusCode: 200,
    message: 'Login berhasil.',
    data: {
      token,
      tokenType: 'Bearer',
      expiresIn: env.jwtExpiresIn,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role_name,
      },
    },
  };
}

async function registerUser({ fullName, email, password }) {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    return {
      success: false,
      statusCode: 409,
      message: 'Email sudah terdaftar.',
    };
  }

  const memberRole = await findRoleByName(REGISTER_ALLOWED_ROLE);

  if (!memberRole) {
    return {
      success: false,
      statusCode: 500,
      message: 'Role member belum tersedia di database.',
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const savedUser = await createUser({
    fullName,
    email,
    passwordHash,
    roleId: memberRole.id,
  });

  return {
    success: true,
    statusCode: 201,
    message: 'Registrasi berhasil.',
    data: {
      user: {
        id: savedUser.id,
        fullName: savedUser.full_name,
        email: savedUser.email,
        role: memberRole.name,
      },
    },
  };
}

function validateRegisterPayload({ fullName, email, password }) {
  if (!fullName || !email || !password) {
    return 'Nama lengkap, email, dan password wajib diisi.';
  }

  if (String(fullName).trim().length < 3) {
    return 'Nama lengkap minimal 3 karakter.';
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(String(email).trim())) {
    return 'Format email tidak valid.';
  }

  if (String(password).length < MIN_PASSWORD_LENGTH) {
    return `Password minimal ${MIN_PASSWORD_LENGTH} karakter.`;
  }

  return null;
}

async function loginOrRegisterGoogleUser({ email, fullName, profileImageUrl = null }) {
  // 1. Cek apakah user sudah ada
  let user = await findUserByEmail(email);

  if (!user) {
    // 2. Jika belum ada, buat user baru
    const memberRole = await findRoleByName(REGISTER_ALLOWED_ROLE);
    if (!memberRole) {
      return {
        success: false,
        statusCode: 500,
        message: 'Role member belum tersedia di database.',
      };
    }

    // Buat password acak yang aman dan hash
    const dummyPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const passwordHash = await bcrypt.hash(dummyPassword, 10);

    // Buat username acak/default dari email
    const username = email.split('@')[0].slice(0, 30) + Math.floor(Math.random() * 1000);

    await createUser({
      fullName,
      email,
      passwordHash,
      roleId: memberRole.id,
      username,
      profileImageUrl,
    });

    // Ambil info lengkap user yang baru dibuat
    user = await findUserByEmail(email);
  }

  // 3. Cek status blokir/ban
  if (isUserBanned(user)) {
    return {
      success: false,
      statusCode: 403,
      message: user.banned_reason || 'Akun Anda sedang diblokir.',
    };
  }

  // 4. Generate JWT kustom
  const tokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role_name,
  };

  const token = jwt.sign(tokenPayload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

  return {
    success: true,
    statusCode: 200,
    message: 'Login Google berhasil.',
    data: {
      token,
      tokenType: 'Bearer',
      expiresIn: env.jwtExpiresIn,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role_name,
      },
    },
  };
}

async function forgotPasswordService(email) {
  const user = await findUserByEmail(email);

  if (!user) {
    return {
      success: false,
      statusCode: 404,
      message: 'Email tidak ditemukan di sistem kami.',
    };
  }

  if (isUserBanned(user)) {
    return {
      success: false,
      statusCode: 403,
      message: 'Akun ini sedang diblokir. Hubungi admin untuk bantuan.',
    };
  }

  const otp = generateOtp();
  await storeOtp(email, otp);
  
  // Kirim email di background agar API merespons dengan cepat tanpa menunggu proses SMTP selesai
  sendOtpEmail(email, otp).catch((err) => {
    console.error(`Gagal mengirim email OTP ke ${email}:`, err.message);
  });

  return {
    success: true,
    statusCode: 200,
    message: 'Kode OTP telah dikirim ke email Anda. Berlaku 5 menit.',
  };
}

async function resetPasswordService({ email, otp, newPassword }) {
  if (!email || !otp || !newPassword) {
    return {
      success: false,
      statusCode: 400,
      message: 'Email, kode OTP, dan password baru wajib diisi.',
    };
  }

  if (String(newPassword).length < MIN_PASSWORD_LENGTH) {
    return {
      success: false,
      statusCode: 400,
      message: `Password baru minimal ${MIN_PASSWORD_LENGTH} karakter.`,
    };
  }

  const otpResult = await verifyOtp(email, otp);

  if (!otpResult.valid) {
    return {
      success: false,
      statusCode: 400,
      message: otpResult.reason,
    };
  }

  const user = await findUserByEmail(email);

  if (!user) {
    return {
      success: false,
      statusCode: 404,
      message: 'Email tidak ditemukan.',
    };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await updateUserPassword(user.id, passwordHash);

  return {
    success: true,
    statusCode: 200,
    message: 'Password berhasil diperbarui. Silakan login dengan password baru Anda.',
  };
}

module.exports = {
  loginUser,
  registerUser,
  validateRegisterPayload,
  loginOrRegisterGoogleUser,
  forgotPasswordService,
  resetPasswordService,
};
