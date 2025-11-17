/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { storage } from "../utils/storage";

/**
 * 
 * @param key The key under which the state is stored in storage
 * @param defaultValue The default value to use if no stored value is found
 * @param options Optional settings for storage type and fallback
 * @returns A stateful value, and a function to update it
 * 
 * @example
 * ```ts
 * const [selectedCurrency, setSelectedCurrency] = usePersistentState<string>(
 *    "selectedCurrency",
 *    "",
 *    { type: 'local', fallback: true }
 *  );
 * ```
 */
export function usePersistentState<T>(
  key: string,
  defaultValue: T,
  options?: { type?: 'local' | 'session'; fallback?: boolean }
): [T, (val: T) => void] {
  const [value, setValue] = useState<T>(() => {
    const stored = storage.get<T>(key, options);
    return stored ?? defaultValue;
  });

  useEffect(() => {
    storage.set<T>(key, value, options);
  }, [key, value]);

  return [value, setValue];
}

export default usePersistentState;

/**
 * 
 * @param key The key under which the state is stored in storage
 * @param defaultValue The default value to use if no stored value is found
 * @param options Optional settings for storage type, fallback, and TTL
 * @returns A stateful value, and a function to update it
 * 
 * @example
 * ```ts
 * const [cachedRooms, setCachedRooms] = usePersistentState<Room[]>(
 *     "cachedRoomList",
 *     [],
 *     { ttl: 5 * 60 * 1000 } // 5 minutes
 * );
 * ```
 */
export function usePersistentStateTTL<T>(
  key: string,
  defaultValue: T,
  options?: { type?: "local" | "session"; fallback?: boolean; ttl?: number }
): [T, (val: T) => void] {
  const [value, setValue] = useState<T>(() => {
    const stored = storage.get<T>(key, options);
    return stored ?? defaultValue;
  });

  useEffect(() => {
    storage.set<T>(key, value, options);
  }, [key, value]);

  return [value, setValue];
}
