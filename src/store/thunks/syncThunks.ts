import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { api, APIError } from '../../services/api';
import { storageService } from '../../services/storage';
import { SyncQueue, Task } from '../../types';
import { generateId } from '../../utils/helpers';
import { MAX_RETRIES, BACKOFF_MULTIPLIER } from '../../config/constants';
import { updateSyncStatus } from '../slices/tasksSlice';
import { removeSyncOperation, updateSyncOperation } from '../slices/syncSlice';
import { authReady } from '../../config/firebase';

// to prevent duplicate sync operations
const syncInProgressMap = new Map<string, Promise<void>>();


export const bootstrapApp = createAsyncThunk(
  'sync/bootstrap',
  async (_, { rejectWithValue }) => {
    try {
      // wait for Firebase auth to be ready before proceeding
      await authReady;

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


export const createTask = createAsyncThunk(
  'sync/createTask',
  async (
    taskData: { title: string; amount: number },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const isOnline = state.network.isConnected && state.network.isInternetReachable !== false;

      if (isOnline) {
        try {
          const serverTask = await api.createTask({
            title: taskData.title,
            amount: taskData.amount,
          });

          return {
            task: { ...serverTask, syncStatus: 'SYNCED' as const },
            syncOp: null,
            wasOnline: true,
          };
        } catch (error) {
          if (error instanceof APIError && !error.retryable) {
            console.warn('Permanent API error:', error);
            return rejectWithValue(error.message);
          }

          console.warn('API call failed, falling back to offline mode:', error);
        }
      }

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

      return {
        task: newTask,
        syncOp,
        wasOnline: false,
      };
    } catch (error) {
      console.warn('Error creating task:', error);
      return rejectWithValue('Failed to create task');
    }
  }
);

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

      // prevent editing synced tasks (design decision: only allow offline edits)
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

    // process operations sequentially to maintain order
    for (const opId of Object.keys(syncQueue)) {
      const operation = syncQueue[opId];

      // prevent duplicate sync calls
      if (syncInProgressMap.has(operation.taskId)) {
        continue;
      }

      const syncPromise = (async () => {
        try {
          const BACKOFF_DELAY = 1000 * Math.pow(BACKOFF_MULTIPLIER, operation.retryCount); // exponential backoff

          if (operation.retryCount >= MAX_RETRIES) {
            dispatch(updateSyncStatus({
              id: operation.taskId,
              status: 'FAILED',
            }));
            results.push({ opId, success: false, error: 'Max retries exceeded' });
            failureCount++;
            return;
          }

          if (operation.retryCount > 0) {
            await new Promise((resolve: (value?: any) => void) => setTimeout(resolve, BACKOFF_DELAY));
          }

          let serverData: Task | undefined;

          switch (operation.operation) {
            case 'CREATE': {
              const createdTask = await api.createTask({
                title: operation.payload.title!,
                amount: operation.payload.amount!,
              });
              serverData = createdTask;

              dispatch(updateSyncStatus({
                id: operation.taskId,
                status: 'SYNCED',
                serverData: createdTask,
              }));
              dispatch(removeSyncOperation(opId));
              break;
            }

            case 'UPDATE': {
              const updatedTask = await api.updateTask(operation.taskId, operation.payload);
              serverData = updatedTask;

              dispatch(updateSyncStatus({
                id: operation.taskId,
                status: 'SYNCED',
                serverData: updatedTask,
              }));
              dispatch(removeSyncOperation(opId));
              break;
            }
          }

          results.push({ opId, success: true });
          successCount++;
        } catch (error) {
          const isRetryable = error instanceof APIError ? error.retryable : true;

          if (isRetryable && operation.retryCount < MAX_RETRIES) {
            dispatch(updateSyncOperation({
              id: opId,
              updates: { retryCount: operation.retryCount + 1 },
            }));
            results.push({
              opId,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          } else {
            dispatch(updateSyncStatus({
              id: operation.taskId,
              status: 'FAILED',
            }));
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
