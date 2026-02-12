import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SyncQueue } from '../../types';

interface SyncState {
  queue: Record<string, SyncQueue>;
  isSyncing: boolean;
  syncError: string | null;
}

const initialState: SyncState = {
  queue: {},
  isSyncing: false,
  syncError: null,
};

export const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    // enqueue a sync operation
    enqueueSyncOperation: (state, action: PayloadAction<SyncQueue>) => {
      state.queue[action.payload.id] = action.payload;
    },

    // remove from queue after successful sync
    removeSyncOperation: (state, action: PayloadAction<string>) => {
      delete state.queue[action.payload];
    },

    // update sync operation (e.g., retry count, error)
    updateSyncOperation: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<SyncQueue> }>
    ) => {
      const operation = state.queue[action.payload.id];
      if (operation) {
        Object.assign(operation, action.payload.updates);
      }
    },

    // sync started
    setSyncing: (state, action: PayloadAction<boolean>) => {
      state.isSyncing = action.payload;
      if (action.payload) {
        state.syncError = null;
      }
    },

    // set sync error
    setSyncError: (state, action: PayloadAction<string | null>) => {
      state.syncError = action.payload;
      state.isSyncing = false;
    },

    // restore queue from storage
    restoreSyncQueue: (state, action: PayloadAction<Record<string, SyncQueue>>) => {
      state.queue = action.payload;
    },

    // clear all queue operations
    clearSyncQueue: (state) => {
      state.queue = {};
    },
  },
});

export const {
  enqueueSyncOperation,
  removeSyncOperation,
  updateSyncOperation,
  setSyncing,
  setSyncError,
  restoreSyncQueue,
  clearSyncQueue,
} = syncSlice.actions;

export default syncSlice.reducer;
