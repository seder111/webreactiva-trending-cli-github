const store = new Map();
const DEFAULT_TTL = 5 * 60 * 1000;

export function get(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttl) {
    store.delete(key);
    return null;
  }
  return entry.data;
}

export function set(key, data, ttl = DEFAULT_TTL) {
  store.set(key, { data, timestamp: Date.now(), ttl });
}
