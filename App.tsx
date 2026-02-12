import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { RootNavigator } from './src/navigation/RootNavigator';
import { restoreTasks, restoreSyncQueue } from './src/store/persistence';
import { setTasks } from './src/store/slices/tasksSlice';
import { restoreSyncQueue as restoreSyncQueueAction } from './src/store/slices/syncSlice';

export const App: React.FC = () => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const hydrateStore = async () => {
      try {
        // Restore tasks
        const tasksData = await restoreTasks();
        if (tasksData) {
          const tasksArray = Object.values(tasksData);
          store.dispatch(setTasks(tasksArray));
        }

        // Restore sync queue
        const syncQueueData = await restoreSyncQueue();
        if (syncQueueData) {
          store.dispatch(restoreSyncQueueAction(syncQueueData));
        }
      } catch (error) {
        console.error('Error hydrating store:', error);
      } finally {
        setIsHydrated(true);
      }
    };

    hydrateStore();
  }, []);

  if (!isHydrated) {
    return null; 
  }

  return (
    <Provider store={store}>
      <RootNavigator />
    </Provider>
  );
};

export default App;
