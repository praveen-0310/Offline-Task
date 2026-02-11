import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { Task } from '../types';
import { formatAmount, formatDate } from '../utils/helpers';
import { SyncStatusBadge } from './SyncStatusBadge';

interface Props {
  task: Task;
  onEditPress: () => void;
  index?: number;
}

export const TaskCard: React.FC<Props> = ({ task, onEditPress, index = 0 }) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 50,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const isEditable = task.syncStatus !== 'SYNCED';

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
        opacity: opacityAnim,
      }}
    >
      <View style={stylesheet.container}>
        <View style={stylesheet.leftAccent} />

        <View style={stylesheet.content}>
          <View style={stylesheet.header}>
            <Text style={stylesheet.title} numberOfLines={1}>
              {task.title}
            </Text>
            <SyncStatusBadge status={task.syncStatus} size="small" />
          </View>

          <View style={stylesheet.body}>
            <View style={stylesheet.amountSection}>
              <Text style={stylesheet.amount}>
                {formatAmount(task.amount)}
              </Text>
            </View>
            <Text style={stylesheet.date}>{formatDate(task.createdAt)}</Text>
          </View>
        </View>

        {isEditable && (
          <TouchableOpacity
            style={stylesheet.editButton}
            onPress={onEditPress}
            activeOpacity={0.7}
          >
            <Text style={stylesheet.editIcon}>✎</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const stylesheet = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    // Modern shadow
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  leftAccent: {
    width: 4,
    height: '100%',
    backgroundColor: '#6366F1',
  },
  content: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    letterSpacing: 0.3,
  },
  body: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountSection: {
    flex: 1,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6366F1',
    letterSpacing: 0.5,
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    fontSize: 18,
    color: '#6366F1',
    fontWeight: '600',
  },
});
