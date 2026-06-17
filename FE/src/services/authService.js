import api from './api';

export async function login(payload) {
  return api.post('/api/auth/login', payload);
}

export async function register(payload) {
  return api.post('/api/auth/register', payload);
}

export async function forgotPassword(email) {
  return api.post('/api/auth/forgot-password', { email });
}

export async function resetPassword({ email, otp, newPassword }) {
  return api.post('/api/auth/reset-password', { email, otp, newPassword });
}