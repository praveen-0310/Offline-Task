import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/firestore';
import { FIREBASE_CONFIG } from './constants';

// Initialize Firebase with credentials from constants
if (!firebase.apps.length) {
  firebase.initializeApp(FIREBASE_CONFIG);
}

// Get Firebase Auth and Firestore references
export const auth = firebase.auth() as any;
export const db = firebase.firestore() as any;

export default firebase;
