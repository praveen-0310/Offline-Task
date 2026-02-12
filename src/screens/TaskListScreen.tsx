import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../hooks';
import { RootStackParamList } from '../navigation/types';
import {
  TaskCard,
  NetworkIndicator,
  LoadingSpinner,
  Button,
} from '../components';
import { processSyncQueue, deleteTask } from '../store/thunks/syncThunks';
import { selectTasksArray } from '../store/slices/tasksSlice';
import { Task } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskList'>;

export const TaskListScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(selectTasksArray);
  const isSyncing = useAppSelector((state) => state.sync.isSyncing);
  const isConnected = useAppSelector((state) => state.network.isConnected);
  const isLoading = useAppSelector((state) => state.tasks.loading);

  const handleEditPress = (task: Task) => {
    navigation.navigate('EditTask', { taskId: task.id });
  };

  const handleDeletePress = (task: Task) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"?`,
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            dispatch(deleteTask(task.id));
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleRetrySync = () => {
    if (isConnected) {
      dispatch(processSyncQueue());
    } else {
      Alert.alert('Offline', 'Please connect to the internet to sync.');
    }
  };

  const renderTaskCard = ({ item, index }: { item: Task; index: number }) => (
    <TaskCard
      task={item}
      onEditPress={() => handleEditPress(item)}
      onDeletePress={() => handleDeletePress(item)}
      index={index}
    />
  );

  const renderEmptyState = () => (
    <View style={stylesheet.emptyContainer}>
      <Text style={stylesheet.emptyText}>No tasks yet</Text>
      <Text style={stylesheet.emptySubtext}>Create your first task to get started</Text>
    </View>
  );

  return (
    <SafeAreaView style={stylesheet.container}>
      <NetworkIndicator />

      <View style={stylesheet.header}>
        <Text style={stylesheet.headerTitle}>Tasks</Text>
      </View>

      {isSyncing && (
        <View style={stylesheet.syncIndicator}>
          <Text style={stylesheet.syncText}>Syncing...</Text>
        </View>
      )}

      <View style={stylesheet.content}>
        {tasks.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={tasks}
            renderItem={renderTaskCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={stylesheet.listContent}
            scrollEnabled={tasks.length > 0}
          />
        )}
      </View>

      {tasks.some((t) => t.syncStatus === 'FAILED') && (
        <View style={stylesheet.footer}>
          <Button
            title="Retry Failed Syncs"
            variant="secondary"
            size="medium"
            onPress={handleRetrySync}
            disabled={!isConnected}
          />
        </View>
      )}

      <TouchableOpacity
        style={stylesheet.fab}
        onPress={() => navigation.navigate('CreateTask')}
        activeOpacity={0.8}
        disabled={isLoading}
      >
        {isLoading ? (
          <LoadingSpinner size="small" />
        ) : (
          <Text style={stylesheet.fabText}>+</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const stylesheet = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 0,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  syncIndicator: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
  },
  syncText: {
    color: '#047857',
    fontWeight: '600',
    fontSize: 13,
    letterSpacing: 0.3,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 0,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
    lineHeight: 40,
  },
});
