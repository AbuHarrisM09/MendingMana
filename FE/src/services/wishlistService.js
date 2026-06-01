import { fetchWithAuth } from './userService';
import { ref } from 'vue';

// Shared global state for reactive wishlist sync
export const wishlistIds = ref(new Set());

export async function toggleWishlist(gadgetId) {
  const cleanId = String(gadgetId).replace('g-', '');
  const res = await fetchWithAuth('/api/wishlist/toggle', {
    method: 'POST',
    body: JSON.stringify({ gadget_id: cleanId }),
  });
  
  if (res.saved) {
    wishlistIds.value.add(cleanId);
  } else {
    wishlistIds.value.delete(cleanId);
  }
  return res;
}

export async function checkWishlist(gadgetId) {
  const cleanId = String(gadgetId).replace('g-', '');
  try {
    const res = await fetchWithAuth(`/api/wishlist/check/${cleanId}`);
    if (res.saved) {
      wishlistIds.value.add(cleanId);
    } else {
      wishlistIds.value.delete(cleanId);
    }
    return res.saved;
  } catch (err) {
    return false;
  }
}

export async function removeFromWishlist(gadgetId) {
  const cleanId = String(gadgetId).replace('g-', '');
  const res = await fetchWithAuth(`/api/wishlist/${cleanId}`, {
    method: 'DELETE',
  });
  wishlistIds.value.delete(cleanId);
  return res;
}

export async function loadWishlist() {
  try {
    const list = await fetchWithAuth('/api/wishlist');
    const newSet = new Set();
    list.forEach(item => {
      const cleanId = String(item.id).replace('g-', '');
      newSet.add(cleanId);
    });
    wishlistIds.value = newSet;
    return list;
  } catch (err) {
    wishlistIds.value = new Set();
    throw err;
  }
}
