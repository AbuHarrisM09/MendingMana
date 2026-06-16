import api from './api';

/**
 * Public API: Perform on-the-fly gadget comparison
 * @param {Array<string>} gadgetIds - Array of gadget IDs (e.g., ['g-1', 'g-2'])
 * @returns {Promise<{gadgets: Array<any>, specGroups: Array<any>}>}
 */
export async function compareGadgets(gadgetIds) {
  return api.post('/api/compare', { gadgetIds });
}

/**
 * Member API: Fetch all comparison sessions saved by the member
 */
export async function getCompareSessions() {
  return api.get('/api/compare/sessions');
}

/**
 * Member API: Fetch a single comparison session with details and specs matrix
 */
export async function getCompareSessionById(id) {
  return api.get(`/api/compare/sessions/${id}`);
}

/**
 * Member API: Create a new comparison session
 * @param {string} title - Optional title (if empty, backend auto-generates)
 * @param {Array<string>} gadgetIds - Array of gadget IDs to include
 */
export async function createCompareSession(title, gadgetIds) {
  return api.post('/api/compare/sessions', { title, gadgetIds });
}

/**
 * Member API: Update comparison session title or sync all gadgets
 * @param {number|string} id - Session ID
 * @param {string} [title] - Optional new title
 * @param {Array<string>} [gadgetIds] - Optional new gadget ID list
 */
export async function updateCompareSession(id, title, gadgetIds) {
  return api.put(`/api/compare/sessions/${id}`, { title, gadgetIds });
}

/**
 * Member API: Delete a comparison session
 */
export async function deleteCompareSession(id) {
  return api.delete(`/api/compare/sessions/${id}`);
}

/**
 * Member API: Add single gadget to comparison session
 */
export async function addCompareSessionItem(sessionId, gadgetId) {
  return api.post(`/api/compare/sessions/${sessionId}/items`, { gadgetId });
}

/**
 * Member API: Remove single gadget from comparison session
 */
export async function removeCompareSessionItem(sessionId, gadgetId) {
  return api.delete(`/api/compare/sessions/${sessionId}/items/${gadgetId}`);
}
