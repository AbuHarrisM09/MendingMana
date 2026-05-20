export async function getGadgets() {
  const res = await fetch('/api/gadgets');
  const data = await res.json().catch(() => ([]));
  if (!res.ok) {
    throw new Error(data.message || 'Gagal memuat daftar gadget');
  }
  return data;
}

export async function getGadgetById(id) {
  const res = await fetch('/api/gadgets/' + id);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Gagal memuat detail gadget');
  }
  return data;
}
