import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
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

export const firebaseAPI = {

  getCurrentUserId(): string {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new APIError(401, 'User not authenticated', true);
    }
    return userId;
  },

  // Debug method to verify the authenticated user
  getCurrentUserInfo(): { uid: string; email: string | null } {
    const user = auth.currentUser;
    if (!user) {
      return { uid: 'NOT_AUTHENTICATED', email: null };
    }
    return {
      uid: user.uid,
      email: user.email,
    };
  },

  async fetchTasks(): Promise<Task[]> {
    try {
      const userId = this.getCurrentUserId();
      const tasksRef = collection(db, 'users', userId, 'tasks');
      const snapshot = await getDocs(tasksRef);

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

  async createTask(
    taskData: Omit<Task, 'id' | 'syncStatus' | 'createdAt' | 'updatedAt' | 'localId'>
  ): Promise<Task> {
    try {
      const userId = this.getCurrentUserId();
      const now = Date.now();

      const tasksRef = collection(db, 'users', userId, 'tasks');
      const docRef = await addDoc(tasksRef, {
        title: taskData.title,
        amount: taskData.amount,
        createdAt: now,
        updatedAt: now,
      });

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

      const taskRef = doc(db, 'users', userId, 'tasks', id);
      await updateDoc(taskRef, updateData);

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

  async deleteTask(id: string): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      const taskRef = doc(db, 'users', userId, 'tasks', id);
      await deleteDoc(taskRef);
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(500, `Failed to delete task: ${error}`, true);
    }
  },

  async deleteTasks(ids: string[]): Promise<void> {
    try {
      if (ids.length === 0) return;

      const userId = this.getCurrentUserId();
      const batch = writeBatch(db);

      ids.forEach((id) => {
        const taskRef = doc(db, 'users', userId, 'tasks', id);
        batch.delete(taskRef);
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
