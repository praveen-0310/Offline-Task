import { useEffect, useState } from 'react';
import { auth } from '../config/firebase';

interface UseAuthReturn {
  user: any | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * Hook for Firebase Authentication
 * Manages user login, signup, logout, and auth state
 * Uses React Native Firebase SDK
 */
export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(
      (currentUser: any) => {
        setUser(currentUser);
        setLoading(false);
      },
      (err: any) => {
        setError(err?.message || 'Auth error');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      await auth().signInWithEmailAndPassword(email, password);
    } catch (err: any) {
      const errorMessage = err?.message || 'Sign in failed';
      setError(errorMessage);
      throw err;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setError(null);
      await auth().createUserWithEmailAndPassword(email, password);
    } catch (err: any) {
      const errorMessage = err?.message || 'Sign up failed';
      setError(errorMessage);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await auth().signOut();
    } catch (err: any) {
      const errorMessage = err?.message || 'Logout failed';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    logout,
  };
};
