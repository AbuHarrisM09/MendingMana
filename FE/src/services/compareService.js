import { fetchWithAuth } from './userService';

/**
 * Public API: Perform on-the-fly gadget comparison
 * @param {Array<string>} gadgetIds - Array of gadget IDs (e.g., ['g-1', 'g-2'])
 * @returns {Promise<{gadgets: Array<any>, specGroups: Array<any>}>}
 */
export async function compareGadgets(gadgetIds) {
  const res = await fetch('/api/compare', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ gadgetIds })
  });
  
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Gagal membandingkan gadget');
  }
  return data;
}

/**
 * Member API: Fetch all comparison sessions saved by the member
 */
export async function getCompareSessions() {
  return fetchWithAuth('/api/compare/sessions');
}

/**
 * Member API: Fetch a single comparison session with details and specs matrix
 */
export async function getCompareSessionById(id) {
  return fetchWithAuth(`/api/compare/sessions/${id}`);
}

/**
 * Member API: Create a new comparison session
 * @param {string} title - Optional title (if empty, backend auto-generates)
 * @param {Array<string>} gadgetIds - Array of gadget IDs to include
 */
export async function createCompareSession(title, gadgetIds) {
  return fetchWithAuth('/api/compare/sessions', {
    method: 'POST',
    body: JSON.stringify({ title, gadgetIds })
  });
}

/**
 * Member API: Update comparison session title or sync all gadgets
 * @param {number|string} id - Session ID
 * @param {string} [title] - Optional new title
 * @param {Array<string>} [gadgetIds] - Optional new gadget ID list
 */
export async function updateCompareSession(id, title, gadgetIds) {
  return fetchWithAuth(`/api/compare/sessions/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title, gadgetIds })
  });
}

/**
 * Member API: Delete a comparison session
 */
export async function deleteCompareSession(id) {
  return fetchWithAuth(`/api/compare/sessions/${id}`, {
    method: 'DELETE'
  });
}

/**
 * Member API: Add single gadget to comparison session
 */
export async function addCompareSessionItem(sessionId, gadgetId) {
  return fetchWithAuth(`/api/compare/sessions/${sessionId}/items`, {
    method: 'POST',
    body: JSON.stringify({ gadgetId })
  });
}

/**
 * Member API: Remove single gadget from comparison session
 */
export async function removeCompareSessionItem(sessionId, gadgetId) {
  return fetchWithAuth(`/api/compare/sessions/${sessionId}/items/${gadgetId}`, {
    method: 'DELETE'
  });
}
