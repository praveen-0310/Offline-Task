// Core domain types
export type SyncStatus = 'PENDING' | 'SYNCED' | 'FAILED';
export type Operation = 'CREATE' | 'UPDATE' | 'DELETE';

export interface Task {
  id: string;
  title: string;
  amount: number;
  createdAt: number; // timestamp
  updatedAt: number;
  syncStatus: SyncStatus;
  isDeleted?: boolean;
  localId?: string; // Generated locally before sync
}

export interface SyncQueue {
  id: string;
  taskId: string;
  operation: Operation;
  payload: Partial<Task>;
  retryCount: number;
  lastError?: string;
  createdAt: number;
  processedAt?: number;
}

export interface NetworkState {
  isConnected: boolean;
  type: 'unknown' | 'none' | 'cellular' | 'wifi' | 'bluetooth' | 'ethernet' | 'vpn' | 'other';
  isInternetReachable: boolean | null;
}

export interface AppState {
  tasks: {
    items: Record<string, Task>;
    loading: boolean;
    error: string | null;
  };
  sync: {
    queue: Record<string, SyncQueue>;
    isSyncing: boolean;
    lastSyncTime: number | null;
    syncError: string | null;
  };
  network: NetworkState;
}
