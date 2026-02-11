import { getStorageAdapter, STORAGE_KEYS } from '../config/storage';
import { Task, SyncQueue } from '../types';

const storage = getStorageAdapter();

export const storageService = {
  // tasks persistence
  async saveTasks(tasks: Record<string, Task>): Promise<void> {
    await storage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  },

  async getTasks(): Promise<Record<string, Task>> {
    try {
      const data = await storage.getItem(STORAGE_KEYS.TASKS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  // sync queue persistence
  async saveSyncQueue(queue: Record<string, SyncQueue>): Promise<void> {
    await storage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
  },

  async getSyncQueue(): Promise<Record<string, SyncQueue>> {
    try {
      const data = await storage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  // last sync timestamp
  async setLastSync(timestamp: number): Promise<void> {
    await storage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp.toString());
  },

  async getLastSync(): Promise<number | null> {
    try {
      const data = await storage.getItem(STORAGE_KEYS.LAST_SYNC);
      return data ? parseInt(data, 10) : null;
    } catch {
      return null;
    }
  },

  // clear all persisted data
  async clearAll(): Promise<void> {
    await storage.clear();
  },
};
