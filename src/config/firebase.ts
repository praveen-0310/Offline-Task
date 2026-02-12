import { initializeApp } from 'firebase/app';
import { initializeAuth, signInWithEmailAndPassword, Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { FIREBASE_CONFIG } from './constants';

// Fixed user credentials - persists across app clears and reinstalls
const FIXED_USER_EMAIL = 'praveen.j.chand@gmail.com';
const FIXED_USER_PASSWORD = 'j.praveen';

// intialize the firebase app with the config
const app = initializeApp(FIREBASE_CONFIG);

export const auth: Auth = initializeAuth(app);

export const db = getFirestore(app);

// Sign in with fixed user account
const initializeAuthUser = async () => {
  try {
    await new Promise((resolve: (value?: any) => void) => setTimeout(resolve, 50));

    if (!auth.currentUser) {
      await signInWithEmailAndPassword(auth, FIXED_USER_EMAIL, FIXED_USER_PASSWORD);
    }
  } catch (error) {
    console.warn('Fixed user sign-in failed:', error);
  }
};

export const authReady = initializeAuthUser();

export default app;
