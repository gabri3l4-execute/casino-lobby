type StorageType = 'local' | 'session';

interface StoredWithTTL<T> {
  value: T;
  expiresAt?: number;
}

const getStorage = (type: StorageType): Storage =>
  type === 'session' ? sessionStorage : localStorage;

export function purgeExpiredKeys(type: StorageType = 'local') {
  const store = getStorage(type);
  const keysToRemove: string[] = [];

  for (let i = 0; i < store.length; i++) {
    const key = store.key(i);
    if (!key) continue;

    try {
      const raw = store.getItem(key);
      if (!raw) continue;

      const parsed = JSON.parse(raw) as StoredWithTTL<unknown>;
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        keysToRemove.push(key);
      }
    } catch {
      // Ignore malformed entries
    }
  }

  keysToRemove.forEach((key) => store.removeItem(key));
}