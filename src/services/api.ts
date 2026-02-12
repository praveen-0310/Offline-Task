// Main API export - uses Firebase Firestore
export { firebaseAPI as api, APIError } from './firebaseAPI';

// Optional: Keep REST API option for fallback
// To use REST API instead of Firebase, import from this file:
// import { restAPI as api } from './restAPI';

/*
 * To switch between Firebase and REST API:
 *
 * 1. Firebase (recommended - what we're using now):
 *    export { firebaseAPI as api, APIError } from './firebaseAPI';
 *
 * 2. REST API (if you prefer):
 *    export { restAPI as api, APIError } from './restAPI';
 *
 * The sync thunks and other code will work with either backend!
 */
