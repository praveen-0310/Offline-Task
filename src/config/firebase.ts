import { initializeApp } from 'firebase/app';
import { initializeAuth, signInAnonymously, Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { FIREBASE_CONFIG } from './constants';

// intialize the firebase app with the config
const app = initializeApp(FIREBASE_CONFIG);

export const auth: Auth = initializeAuth(app);

export const db = getFirestore(app);

// create a promise that resolves when user is authenticated
const initializeAuthUser = async () => {
  try {
    await new Promise((resolve: (value?: any) => void) => setTimeout(resolve, 50));

    if (!auth.currentUser) {
      await signInAnonymously(auth);
      console.log('Anonymous user signed in:', auth.currentUser?.uid);
    }
  } catch (error) {
    console.warn('Anonymous sign-in failed:', error);
  }
};

export const authReady = initializeAuthUser();

export default app;
