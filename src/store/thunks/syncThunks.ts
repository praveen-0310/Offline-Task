import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { api, APIError } from '../../services/api';
import { storageService } from '../../services/storage';
import { SyncQueue, Task } from '../../types';
import { generateId } from '../../utils/helpers';

// Prevent duplicate sync operations
const syncInProgressMap = new Map<string, Promise<void>>();


export const bootstrapApp = createAsyncThunk(
  'sync/bootstrap',
  async (_, { rejectWithValue }) => {
    try {
      const [tasks, syncQueue, lastSync] = await Promise.all([
        storageService.getTasks(),
        storageService.getSyncQueue(),
        storageService.getLastSync(),
      ]);

      return { tasks, syncQueue, lastSync };
    } catch (error) {
      console.warn('Bootstrap failed, starting with empty state:', error);
      return rejectWithValue('Failed to bootstrap app');
    }
  }
);

/**
 * THUNK: Create a new task locally and enqueue for sync
 * Reasoning: Optimistic update - add to local state immediately
 * User sees instant feedback, sync happens in background
 */
export const createTask = createAsyncThunk(
  'sync/createTask',
  async (
    taskData: { title: string; amount: number },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const taskId = generateId();
      const now = Date.now();

      const newTask: Task = {
        id: taskId,
        title: taskData.title,
        amount: taskData.amount,
        createdAt: now,
        updatedAt: now,
        syncStatus: 'PENDING',
        localId: taskId,
      };

      const syncQueueId = generateId();
      const syncOp: SyncQueue = {
        id: syncQueueId,
        taskId,
        operation: 'CREATE',
        payload: {
          title: taskData.title,
          amount: taskData.amount,
        },
        retryCount: 0,
        createdAt: now,
      };

      return { task: newTask, syncOp };
    } catch (error) {
      console.warn('Error creating task:', error);
      return rejectWithValue('Failed to create task');
    }
  }
);

/**
 * THUNK: Update a task locally
 * Only allow editing if not synced
 */
export const updateTask = createAsyncThunk(
  'sync/updateTask',
  async (
    { id, updates }: { id: string; updates: Partial<Task> },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const task = state.tasks.items[id];

      if (!task) {
        return rejectWithValue('Task not found');
      }

      // Prevent editing synced tasks (design decision: only allow offline edits)
      if (task.syncStatus === 'SYNCED') {
        return rejectWithValue('Cannot edit synced tasks');
      }

      const now = Date.now();
      const syncQueueId = generateId();

      const syncOp: SyncQueue = {
        id: syncQueueId,
        taskId: id,
        operation: 'UPDATE',
        payload: updates,
        retryCount: 0,
        createdAt: now,
      };

      return { id, updates, syncOp };
    } catch (error) {
      console.warn('Error updating task:', error);
      return rejectWithValue('Failed to update task');
    }
  }
);

/**
 * THUNK: Process sync queue
 * Core sync logic with:
 * - Deduplication: prevent duplicate API calls for same operation
 * - Retry logic: exponential backoff for failed operations
 * - Error recovery: distinguish retryable vs non-retryable errors
 * - Optimistic updates: update local state before server confirmation
 */
export const processSyncQueue = createAsyncThunk(
  'sync/processQueue',
  async (_, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState;
    const syncQueue = state.sync.queue;
    const isConnected = state.network.isConnected && state.network.isInternetReachable !== false;

    if (!isConnected) {
      return rejectWithValue('No internet connection');
    }

    if (Object.keys(syncQueue).length === 0) {
      return { successCount: 0, failureCount: 0 };
    }

    let successCount = 0;
    let failureCount = 0;
    const results: Array<{ opId: string; success: boolean; error?: string }> = [];

    // Process operations sequentially to maintain order
    for (const opId of Object.keys(syncQueue)) {
      const operation = syncQueue[opId];

      // Prevent duplicate sync calls
      if (syncInProgressMap.has(operation.taskId)) {
        continue;
      }

      // Create a promise for this sync operation
      const syncPromise = (async () => {
        try {
          const MAX_RETRIES = parseInt(process.env.MAX_RETRIES || '3', 10);
          const BACKOFF_DELAY = 1000 * Math.pow(2, operation.retryCount); // exponential backoff

          // Don't retry indefinitely
          if (operation.retryCount >= MAX_RETRIES) {
            results.push({ opId, success: false, error: 'Max retries exceeded' });
            failureCount++;
            return;
          }

          // Wait before retry
          if (operation.retryCount > 0) {
            await new Promise((resolve) => setTimeout(resolve, BACKOFF_DELAY));
          }

          let serverData: Task | undefined;

          switch (operation.operation) {
            case 'CREATE': {
              const createdTask = await api.createTask({
                title: operation.payload.title!,
                amount: operation.payload.amount!,
              });
              serverData = createdTask;
              break;
            }

            case 'UPDATE': {
              const updatedTask = await api.updateTask(operation.taskId, operation.payload);
              serverData = updatedTask;
              break;
            }
          }

          results.push({ opId, success: true });
          successCount++;
        } catch (error) {
          const isRetryable = error instanceof APIError ? error.retryable : true;

          if (isRetryable && operation.retryCount < (parseInt(process.env.MAX_RETRIES || '3', 10))) {
            // Mark for retry
            results.push({
              opId,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          } else {
            // Permanent failure
            results.push({
              opId,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
            failureCount++;
          }
        }
      })();

      syncInProgressMap.set(operation.taskId, syncPromise);
      await syncPromise;
      syncInProgressMap.delete(operation.taskId);
    }

    // Persist updated state
    await storageService.saveTasks(state.tasks.items);
    await storageService.saveSyncQueue(state.sync.queue);

    return { successCount, failureCount, results };
  }
);

/**
 * THUNK: Retry a specific failed operation
 * User manually retries from UI
 */
export const retryFailedOperation = createAsyncThunk(
  'sync/retryOperation',
  async (operationId: string, { rejectWithValue }) => {
    try {
      return { operationId };
    } catch (error) {
      console.warn('Error retrying operation:', error);
      return rejectWithValue('Failed to retry operation');
    }
  }
);
