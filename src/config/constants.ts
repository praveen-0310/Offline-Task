/**
 * Application-wide constants
 * Used across the app for configuration values
 */

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
