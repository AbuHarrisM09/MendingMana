import api from './api';

export async function getGadgets() {
  return api.get('/api/gadgets');
}

export async function getGadgetById(id) {
  return api.get('/api/gadgets/' + id);
}
