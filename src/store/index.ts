import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from './slices/tasksSlice';
import syncReducer from './slices/syncSlice';
import networkReducer from './slices/networkSlice';
import { persistState } from './persistence';

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    sync: syncReducer,
    network: networkReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


let persistTimeout: ReturnType<typeof setTimeout> | null = null;

store.subscribe(() => {
  if (persistTimeout) clearTimeout(persistTimeout);

  persistTimeout = setTimeout(() => {
    const state = store.getState();
    persistState(state);
  }, 500); 
});
