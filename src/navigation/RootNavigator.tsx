import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppDispatch, useNetworkListener, useSyncOnNetworkRestore } from '../hooks';
import { RootStackParamList } from './types';
import { TaskListScreen, CreateTaskScreen, EditTaskScreen } from '../screens';
import { bootstrapApp } from '../store/thunks/syncThunks';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const dispatch = useAppDispatch();

  useNetworkListener();
  useSyncOnNetworkRestore();

  useEffect(() => {
    // loading  the persisted data in app start
    dispatch(bootstrapApp());
  }, [dispatch]);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="TaskList" component={TaskListScreen} />
        <Stack.Screen
          name="CreateTask"
          component={CreateTaskScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="EditTask"
          component={EditTaskScreen}
          options={{ presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
