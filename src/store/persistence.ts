import { getStorageAdapter, STORAGE_KEYS } from '../config/storage';
import { RootState } from './index';
import { Task, SyncQueue } from '../types';

const storage = getStorageAdapter();


//  Persists the entire state to AsyncStorage

export const persistState = async (state: RootState): Promise<void> => {
  try {
    const tasksData = JSON.stringify(state.tasks.items);
    const syncQueueData = JSON.stringify(state.sync.queue);
    const lastSyncData = state.sync.lastSyncTime?.toString() || '';

    await storage.multiSet([
      [STORAGE_KEYS.TASKS, tasksData],
      [STORAGE_KEYS.SYNC_QUEUE, syncQueueData],
      [STORAGE_KEYS.LAST_SYNC, lastSyncData],
    ]);
  } catch (error) {
    console.error('Error persisting state:', error);
  }
};

 //Restores the tasks state from AsyncStorage
export const restoreTasks = async (): Promise<Record<string, Task> | null> => {
  try {
    const tasksData = await storage.getItem(STORAGE_KEYS.TASKS);
    if (tasksData) {
      return JSON.parse(tasksData);
    }
    return null;
  } catch (error) {
    console.error('Error restoring tasks:', error);
    return null;
  }
};

//restores the sync queue from AsyncStorage
export const restoreSyncQueue = async (): Promise<Record<string, SyncQueue> | null> => {
  try {
    const queueData = await storage.getItem(STORAGE_KEYS.SYNC_QUEUE);
    if (queueData) {
      return JSON.parse(queueData);
    }
    return null;
  } catch (error) {
    console.error('Error restoring sync queue:', error);
    return null;
  }
};

// restores the last sync time from AsyncStorage

export const restoreLastSyncTime = async (): Promise<number | null> => {
  try {
    const timeData = await storage.getItem(STORAGE_KEYS.LAST_SYNC);
    if (timeData) {
      return parseInt(timeData, 10);
    }
    return null;
  } catch (error) {
    console.error('Error restoring last sync time:', error);
    return null;
  }
};

// clears all persisted data from AsyncStorage

export const clearPersistedState = async (): Promise<void> => {
  try {
    await storage.removeItem(STORAGE_KEYS.TASKS);
    await storage.removeItem(STORAGE_KEYS.SYNC_QUEUE);
    await storage.removeItem(STORAGE_KEYS.LAST_SYNC);
  } catch (error) {
    console.error('Error clearing persisted state:', error);
  }
};
