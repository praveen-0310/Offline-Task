import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch } from '../hooks';
import { RootStackParamList } from '../navigation/types';
import { FormInput, Button, NetworkIndicator } from '../components';
import { createTask } from '../store/thunks/syncThunks';
import { addTaskLocal } from '../store/slices/tasksSlice';
import { enqueueSyncOperation } from '../store/slices/syncSlice';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateTask'>;

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

export const CreateTaskScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();

  const handleSubmit = async (values: FormValues, { setSubmitting }: any) => {
    try {
      const result = await dispatch(
        createTask({
          title: values.title,
          amount: parseFloat(values.amount),
        })
      ).unwrap();

      // Add task to local state
      dispatch(addTaskLocal(result.task));

      // Only enqueue sync operation if offline (syncOp will be null if online)
      if (result.syncOp) {
        dispatch(enqueueSyncOperation(result.syncOp));
      }

      setSubmitting(false);

      // Show different messages for online vs offline creation
      const successMessage = result.wasOnline
        ? 'Task created and synced successfully!'
        : 'Task created. It will sync when online.';

      setTimeout(() => {
        Alert.alert('Success', successMessage, [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      }, 100);
    } catch (error) {
      console.warn('Error creating task:', error);
      setSubmitting(false);

      // Show error alert with delay
      const errorMessage = typeof error === 'string'
        ? error
        : 'Failed to create task. Please try again.';

      setTimeout(() => {
        Alert.alert('Error', errorMessage);
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
            <Formik
              initialValues={{ title: '', amount: '' }}
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
                    editable={!isSubmitting}
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
                    editable={!isSubmitting}
                  />

                  <View style={stylesheet.buttonContainer}>
                    <Button
                      title="Create"
                      onPress={() => formSubmit()}
                      loading={isSubmitting}
                      disabled={isSubmitting}
                    />
                  </View>
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
  buttonContainer: {
    marginTop: 32,
    marginBottom: 20,
  },
});
