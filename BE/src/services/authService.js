const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { findUserByEmail } = require('../models/userModel');

const LOGIN_ALLOWED_ROLES = new Set(['member', 'admin']);

function isUserTemporarilyBanned(bannedUntil) {
  if (!bannedUntil) {
    return false;
  }

  const bannedDate = new Date(bannedUntil);
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

  if (user.is_banned || isUserTemporarilyBanned(user.banned_until)) {
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

module.exports = {
  loginUser,
};
