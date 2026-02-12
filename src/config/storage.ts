import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  multiSet(items: Array<[string, string]>): Promise<void>;
  multiGet(keys: string[]): Promise<Array<[string, string | null]>>;
  clear(): Promise<void>;
}

// AsyncStorage implementation
export const asyncStorageAdapter: StorageAdapter = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
  multiSet: (items) => AsyncStorage.multiSet(items),
  multiGet: (keys) => AsyncStorage.multiGet(keys),
  clear: () => AsyncStorage.clear(),
};

export const getStorageAdapter = (): StorageAdapter => {
  return asyncStorageAdapter;
};

// Storage keys constants
export const STORAGE_KEYS = {
  TASKS: 'tasks',
  SYNC_QUEUE: 'sync_queue',
  LAST_SYNC: 'last_sync',
} as const;
