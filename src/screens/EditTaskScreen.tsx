import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../hooks';
import { RootStackParamList } from '../navigation/types';
import { FormInput, Button, NetworkIndicator, SyncStatusBadge } from '../components';
import { updateTask } from '../store/thunks/syncThunks';
import { updateTaskLocal, selectTaskById } from '../store/slices/tasksSlice';
import { enqueueSyncOperation } from '../store/slices/syncSlice';
import { formatDate } from '../utils/helpers';

type Props = NativeStackScreenProps<RootStackParamList, 'EditTask'>;

// Validation schema using Yup
const validationSchema = Yup.object().shape({
  title: Yup.string()
    .required('Title is required')
    .min(1, 'Title is required')
    .max(100, 'Title must be 100 characters or less'),
  amount: Yup.number()
    .required('Amount is required')
    .typeError('Amount must be a valid number')
    .positive('Amount must be a positive number')
    .max(999999.99, 'Amount is too large'),
});

interface FormValues {
  title: string;
  amount: string;
}

export const EditTaskScreen: React.FC<Props> = ({ route, navigation }) => {
  const { taskId } = route.params;
  const dispatch = useAppDispatch();
  const task = useAppSelector(selectTaskById(taskId));

  if (!task) {
    return (
      <SafeAreaView style={stylesheet.container}>
        <Text style={stylesheet.notFoundText}>Task not found</Text>
      </SafeAreaView>
    );
  }

  const isEditable = task.syncStatus !== 'SYNCED';

  const handleSubmit = async (values: FormValues, { setSubmitting }: any) => {

    if (values.title === task.title && parseFloat(values.amount) === task.amount) {
      setSubmitting(false);

      setTimeout(() => {
        Alert.alert('No Changes', 'No changes were made to the task.');
      }, 100);
      return;
    }

    try {
      const updates = {
        title: values.title,
        amount: parseFloat(values.amount),
      };

      const result = await dispatch(
        updateTask({
          id: taskId,
          updates,
        })
      ).unwrap();

      dispatch(updateTaskLocal({ id: taskId, updates }));
      dispatch(enqueueSyncOperation(result.syncOp));

      setSubmitting(false);

      setTimeout(() => {
        Alert.alert('Success', 'Task updated. Changes will sync when online.', [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      }, 100);
    } catch (error) {
      setSubmitting(false);

      setTimeout(() => {
        Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update task.');
      }, 100);
    }
  };

  return (
    <SafeAreaView style={stylesheet.container}>
      <NetworkIndicator />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={stylesheet.container}
      >
        <ScrollView style={stylesheet.scrollView} showsVerticalScrollIndicator={false}>
          <View style={stylesheet.content}>
            <View style={stylesheet.statusSection}>
              <Text style={stylesheet.statusLabel}>Sync Status</Text>
              <SyncStatusBadge status={task.syncStatus} />
            </View>

            <View style={stylesheet.metaSection}>
              <Text style={stylesheet.metaLabel}>Created: {formatDate(task.createdAt)}</Text>
              <Text style={stylesheet.metaLabel}>Updated: {formatDate(task.updatedAt)}</Text>
            </View>

            {!isEditable && (
              <View style={stylesheet.warningBox}>
                <Text style={stylesheet.warningText}>
                  This task has been synced to the server. Changes are not allowed.
                </Text>
              </View>
            )}

            <Formik
              initialValues={{ title: task.title, amount: task.amount.toString() }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ handleChange, handleBlur, handleSubmit: formSubmit, values, errors, touched, isSubmitting }) => (
                <>
                  <FormInput
                    label="Task Title"
                    placeholder="Enter task title"
                    value={values.title}
                    onChangeText={handleChange('title')}
                    onBlur={handleBlur('title')}
                    error={touched.title ? errors.title : undefined}
                    required
                    maxLength={100}
                    editable={isEditable && !isSubmitting}
                  />

                  <FormInput
                    label="Amount"
                    placeholder="Enter amount"
                    value={values.amount}
                    onChangeText={handleChange('amount')}
                    onBlur={handleBlur('amount')}
                    error={touched.amount ? errors.amount : undefined}
                    required
                    keyboardType="decimal-pad"
                    editable={isEditable && !isSubmitting}
                  />

                  {isEditable && (
                    <View style={stylesheet.buttonContainer}>
                      <Button
                        title="Update"
                        onPress={() => formSubmit()}
                        loading={isSubmitting}
                        disabled={isSubmitting}
                      />
                    </View>
                  )}
                </>
              )}
            </Formik>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const stylesheet = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  statusSection: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 0,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaSection: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  metaLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
    fontWeight: '500',
  },
  warningBox: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FBBF24',
    borderWidth: 1.5,
    borderLeftWidth: 4,
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
  },
  warningText: {
    color: '#92400E',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  buttonContainer: {
    marginTop: 32,
    marginBottom: 20,
  },
  notFoundText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 50,
  },
});
