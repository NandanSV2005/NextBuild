import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from '../lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isGuest?: boolean;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  loading: boolean;
  loginWithEmail: (e: string, p: string) => Promise<void>;
  registerWithEmail: (e: string, p: string, name?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    const safetyTimer = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 1500);

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (!mounted) return;
        if (user) {
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email?.split('@')[0] || 'User',
            photoURL: user.photoURL,
            isGuest: false,
          });
        } else {
          // Check if local guest session active
          const savedGuest = localStorage.getItem('nextbuild_guest_user');
          if (savedGuest) {
            try {
              setCurrentUser(JSON.parse(savedGuest));
            } catch {
              setCurrentUser(null);
            }
          } else {
            setCurrentUser(null);
          }
        }
        setLoading(false);
        clearTimeout(safetyTimer);
      },
      (err) => {
        console.warn('onAuthStateChanged fallback:', err);
        if (mounted) setLoading(false);
        clearTimeout(safetyTimer);
      }
    );

    return () => {
      mounted = false;
      unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    localStorage.removeItem('nextbuild_guest_user');
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const registerWithEmail = async (email: string, pass: string, name?: string) => {
    localStorage.removeItem('nextbuild_guest_user');
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (res.user && name) {
      // Set initial local state with name
      setCurrentUser({
        uid: res.user.uid,
        email: res.user.email,
        displayName: name,
        photoURL: null,
        isGuest: false,
      });
    }
  };

  const loginWithGoogle = async () => {
    localStorage.removeItem('nextbuild_guest_user');
    await signInWithPopup(auth, googleProvider);
  };

  const loginAsGuest = () => {
    const guestUser: AuthUser = {
      uid: `guest-${Date.now()}`,
      email: 'guest@nextbuild.dev',
      displayName: 'Guest Student',
      photoURL: null,
      isGuest: true,
    };
    localStorage.setItem('nextbuild_guest_user', JSON.stringify(guestUser));
    setCurrentUser(guestUser);
  };

  const logout = async () => {
    localStorage.removeItem('nextbuild_guest_user');
    setCurrentUser(null);
    try {
      await signOut(auth);
    } catch {
      // Fallback
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        loginAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
