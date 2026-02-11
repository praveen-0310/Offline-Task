import { Task } from '../types';

// For React Native: Use hardcoded values or platform-specific configuration
const API_BASE_URL = __DEV__ ? 'http://localhost:3000/api' : 'https://api.production.com/api';
const API_TIMEOUT = 10000;

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

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = API_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

export const api = {
  // Fetch all tasks from server
  async fetchTasks(): Promise<Task[]> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/tasks`);

      if (!response.ok) {
        throw new APIError(
          response.status,
          `Failed to fetch tasks: ${response.statusText}`,
          response.status >= 500
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('AbortError')) {
        throw new APIError(0, 'Request timeout', true);
      }
      throw error;
    }
  },

  // Create a new task
  async createTask(task: Omit<Task, 'id' | 'syncStatus' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });

      if (!response.ok) {
        throw new APIError(
          response.status,
          `Failed to create task: ${response.statusText}`,
          response.status >= 500
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('AbortError')) {
        throw new APIError(0, 'Request timeout', true);
      }
      throw error;
    }
  },

  // Update an existing task
  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new APIError(
          response.status,
          `Failed to update task: ${response.statusText}`,
          response.status >= 500
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('AbortError')) {
        throw new APIError(0, 'Request timeout', true);
      }
      throw error;
    }
  },

  // Delete a task
  async deleteTask(id: string): Promise<void> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new APIError(
          response.status,
          `Failed to delete task: ${response.statusText}`,
          response.status >= 500
        );
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('AbortError')) {
        throw new APIError(0, 'Request timeout', true);
      }
      throw error;
    }
  },
};
