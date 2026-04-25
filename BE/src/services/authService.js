const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { findUserByEmail, findRoleByName, createUser } = require('../models/userModel');

const LOGIN_ALLOWED_ROLES = new Set(['member', 'admin']);
const REGISTER_ALLOWED_ROLE = 'member';
const MIN_PASSWORD_LENGTH = 6;

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

module.exports = {
  loginUser,
  registerUser,
  validateRegisterPayload,
};