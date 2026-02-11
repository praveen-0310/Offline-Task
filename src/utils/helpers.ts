import { ValidationError } from '../types';

// Generate a unique ID for tasks
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Format amount to currency string
export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Format timestamp to readable date string
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Validate task form inputs
export const validateTaskForm = (
  title: string,
  amount: string
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!title || title.trim().length === 0) {
    errors.push({
      field: 'title',
      message: 'Title is required',
    });
  }

  if (title && title.length > 100) {
    errors.push({
      field: 'title',
      message: 'Title must be 100 characters or less',
    });
  }

  if (!amount || amount.trim().length === 0) {
    errors.push({
      field: 'amount',
      message: 'Amount is required',
    });
  }

  const numAmount = parseFloat(amount);
  if (amount && (isNaN(numAmount) || numAmount <= 0)) {
    errors.push({
      field: 'amount',
      message: 'Amount must be a positive number',
    });
  }

  if (amount && numAmount > 999999.99) {
    errors.push({
      field: 'amount',
      message: 'Amount is too large',
    });
  }

  return errors;
};

// Extract error message from unknown error object
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};
// Debounce function to limit how often a function can be called
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
