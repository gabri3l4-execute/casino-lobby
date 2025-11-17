type StorageType = 'local' | 'session';

interface StorageOptions {
  type?: StorageType;
  fallback?: boolean;
  ttl?: number; // in milliseconds
}

interface StoredWithTTL<T> {
  value: T;
  expiresAt?: number;
}

const getStorage = (type: StorageType): Storage =>
  type === 'session' ? sessionStorage : localStorage;

export const storage = {
  set<T>(key: string, value: T, options: StorageOptions = {}) {
    try {
      const store = getStorage(options.type || 'local');
      const payload: StoredWithTTL<T> = {
        value,
        ...(options.ttl ? { expiresAt: Date.now() + options.ttl } : {})
      };
      store.setItem(key, JSON.stringify(payload));
    } catch (err) {
      if (options.fallback) console.warn(`Storage fallback for ${key}`, err);
    }
  },

  get<T>(key: string, options: StorageOptions = {}): T | null {
    try {
      const store = getStorage(options.type || 'local');
      const raw = store.getItem(key);
      if (!raw) return null;

      const parsed: StoredWithTTL<T> = JSON.parse(raw);
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        store.removeItem(key);
        return null;
      }

      return parsed.value;
    } catch (err) {
      if (options.fallback) console.warn(`Storage fallback for ${key}`, err);
      return null;
    }
  },

  remove(key: string, options: StorageOptions = {}) {
    try {
      const store = getStorage(options.type || 'local');
      store.removeItem(key);
    } catch (err) {
      if (options.fallback) console.warn(`Storage fallback for ${key}`, err);
    }
  },

  clear(type: StorageType = 'local') {
    try {
      getStorage(type).clear();
    } catch (err) {
      console.warn(`Failed to clear ${type} storage`, err);
    }
  }
};