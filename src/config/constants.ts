/**
 * Application-wide constants
 * Used across the app for configuration values
 */

// Firebase Configuration
export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyCk39wYTWAbwbGo0p1dvWPAQOEIHElqIVw',
  authDomain: 'offlinetask.firebaseapp.com',
  projectId: 'offlinetask',
  storageBucket: 'offlinetask.firebasestorage.app',
  messagingSenderId: '794973121660',
  appId: '1:794973121660:web:8f30e558f418f48ca9edf9',
  measurementId: 'G-0K7M3FBRV8',
};

// Sync Configuration
export const MAX_RETRIES = 3;
export const API_TIMEOUT = 10000; // 10 seconds
export const BACKOFF_MULTIPLIER = 2; // exponential backoff: 1000 * 2^retryCount

// Storage Configuration
export const DEBOUNCE_PERSIST = 500; // 500ms debounce for AsyncStorage persistence

// API Configuration
export const API_BASE_URL = 'http://localhost:3000/api';

// UI Configuration
export const NETWORK_INDICATOR_ANIMATION_DURATION = 300;
