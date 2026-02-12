import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { Task, SyncStatus } from '../../types';
import { bootstrapApp } from '../thunks/syncThunks';

interface TasksState {
  items: Record<string, Task>;
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  items: {},
  loading: false,
  error: null,
};

export const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTaskLocal: (state, action: PayloadAction<Task>) => {
      state.items[action.payload.id] = action.payload;
    },

    updateTaskLocal: (state, action: PayloadAction<{ id: string; updates: Partial<Task> }>) => {
      const task = state.items[action.payload.id];
      if (task) {
        Object.assign(task, action.payload.updates, {
          updatedAt: Date.now(),
        });
      }
    },

    updateSyncStatus: (
      state,
      action: PayloadAction<{ id: string; status: SyncStatus; serverData?: Partial<Task> }>
    ) => {
      const task = state.items[action.payload.id];
      if (task) {
        task.syncStatus = action.payload.status;
        if (action.payload.serverData) {
          Object.assign(task, action.payload.serverData);
        }
      }
    },

    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.items = {};
      action.payload.forEach((task) => {
        state.items[task.id] = task;
      });
      state.loading = false;
      state.error = null;
    },

    setTasksLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setTasksError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },

    deleteTaskLocal: (state, action: PayloadAction<string>) => {
      delete state.items[action.payload];
    },

    clearTasks: (state) => {
      state.items = {};
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapApp.pending, (state) => {
        state.loading = true;
      })
      .addCase(bootstrapApp.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.tasks;
      })
      .addCase(bootstrapApp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  addTaskLocal,
  updateTaskLocal,
  updateSyncStatus,
  deleteTaskLocal,
  setTasks,
  setTasksLoading,
  setTasksError,
  clearTasks,
} = tasksSlice.actions;

// Memoized selectors to prevent unnecessary rerenders
export const selectTasksItems = (state: RootState) => state.tasks.items;
export const selectTasksLoading = (state: RootState) => state.tasks.loading;
export const selectTasksError = (state: RootState) => state.tasks.error;

export const selectTasksArray = createSelector([selectTasksItems], (items) =>
  Object.values(items).reverse()
);

export const selectActiveTasks = createSelector([selectTasksItems], (items) =>
  Object.values(items).filter((task) => !task.isDeleted).reverse()
);

export const selectTaskById = (id: string) =>
  createSelector([selectTasksItems], (items) => items[id]);

export default tasksSlice.reducer;
