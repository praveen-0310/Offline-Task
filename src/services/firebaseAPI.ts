import { db, auth } from '../config/firebase';
import { Task } from '../types';

export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public retryable: boolean = true
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Firebase API Service
 * Handles all task operations with Firestore
 * Uses React Native Firebase SDK
 */
export const firebaseAPI = {
  /**
   * Get the current user's UID
   */
  getCurrentUserId(): string {
    const userId = auth().currentUser?.uid;
    if (!userId) {
      throw new APIError(401, 'User not authenticated', true);
    }
    return userId;
  },

  /**
   * Fetch all tasks from Firestore
   */
  async fetchTasks(): Promise<Task[]> {
    try {
      const userId = this.getCurrentUserId();
      const snapshot = await db()
        .collection('users')
        .doc(userId)
        .collection('tasks')
        .get();

      const tasks: Task[] = snapshot.docs.map((doc: any) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          amount: data.amount,
          createdAt: data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
          updatedAt: data.updatedAt?.toMillis?.() || data.updatedAt || Date.now(),
          syncStatus: 'SYNCED',
          localId: doc.id,
        } as Task;
      });

      return tasks;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(500, `Failed to fetch tasks: ${error}`, true);
    }
  },

  /**
   * Create a new task in Firestore
   */
  async createTask(
    taskData: Omit<Task, 'id' | 'syncStatus' | 'createdAt' | 'updatedAt' | 'localId'>
  ): Promise<Task> {
    try {
      const userId = this.getCurrentUserId();
      const now = Date.now();

      const docRef = await db()
        .collection('users')
        .doc(userId)
        .collection('tasks')
        .add({
          title: taskData.title,
          amount: taskData.amount,
          createdAt: now,
          updatedAt: now,
        });

      // Return the created task with the document ID
      return {
        id: docRef.id,
        title: taskData.title,
        amount: taskData.amount,
        createdAt: now,
        updatedAt: now,
        syncStatus: 'SYNCED',
        localId: docRef.id,
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(500, `Failed to create task: ${error}`, true);
    }
  },

  /**
   * Update an existing task in Firestore
   */
  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    try {
      const userId = this.getCurrentUserId();
      const now = Date.now();

      const updateData: Record<string, any> = {};

      if (updates.title !== undefined) {
        updateData.title = updates.title;
      }
      if (updates.amount !== undefined) {
        updateData.amount = updates.amount;
      }

      updateData.updatedAt = now;

      await db()
        .collection('users')
        .doc(userId)
        .collection('tasks')
        .doc(id)
        .update(updateData);

      // Return updated task
      return {
        id,
        title: updates.title || '',
        amount: updates.amount || 0,
        createdAt: updates.createdAt || Date.now(),
        updatedAt: now,
        syncStatus: 'SYNCED',
        localId: id,
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(500, `Failed to update task: ${error}`, true);
    }
  },

  /**
   * Delete a task from Firestore
   */
  async deleteTask(id: string): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      await db()
        .collection('users')
        .doc(userId)
        .collection('tasks')
        .doc(id)
        .delete();
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(500, `Failed to delete task: ${error}`, true);
    }
  },

  /**
   * Batch delete multiple tasks
   */
  async deleteTasks(ids: string[]): Promise<void> {
    try {
      if (ids.length === 0) return;

      const userId = this.getCurrentUserId();
      const batch = db().batch();

      ids.forEach((id) => {
        const docRef = db()
          .collection('users')
          .doc(userId)
          .collection('tasks')
          .doc(id);
        batch.delete(docRef);
      });

      await batch.commit();
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(500, `Failed to delete tasks: ${error}`, true);
    }
  },
};
