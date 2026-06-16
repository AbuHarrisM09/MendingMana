import api from './api';

export async function login(payload) {
  return api.post('/api/auth/login', payload);
}

export async function register(payload) {
  return api.post('/api/auth/register', payload);
}