
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

async function handle(res) {
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

export async function fetchUrls() {
  const res = await fetch(`${API_BASE}/api/urls`);
  return handle(res);
}

export async function createShortUrl(url) {
  const res = await fetch(`${API_BASE}/api/urls`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  return handle(res);
}

export async function deleteShortUrl(code) {
  const res = await fetch(`${API_BASE}/api/urls/${code}`, { method: 'DELETE' });
  return handle(res);
}
