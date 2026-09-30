import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  signInWithPhoneNumber,
  signInAnonymously,
  RecaptchaVerifier,
  ConfirmationResult,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { AuthUser } from '../types';

const LOCAL_AUTH_STORAGE_KEY = 'bukukas_local_auth_user';

interface AuthContextType {
  currentUser: User | null;
  authUser: AuthUser | null;
  isLocalAccount: boolean;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAnonymously: () => Promise<void>;
  loginLocally: (email?: string, displayName?: string) => void;
  sendPasswordReset: (email: string) => Promise<void>;
  sendPhoneOtp: (phoneNumber: string, appVerifier: RecaptchaVerifier) => Promise<ConfirmationResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [localUser, setLocalUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const registerWithEmail = async (email: string, pass: string) => {
    await createUserWithEmailAndPassword(auth, email, pass);
  };

  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const loginAnonymously = async () => {
    try {
      await signInAnonymously(auth);
    } catch (err: any) {
      console.warn('Firebase anonymous auth unavailable, falling back to local instant account:', err);
      // Fallback to seamless instant account
      loginLocally('instan@bukukas.pro', 'Pengguna Instan');
    }
  };

  const loginLocally = (email?: string, displayName?: string) => {
    const cleanEmail = email?.trim() || 'pemilik@bukukas.pro';
    const cleanName = displayName?.trim() || cleanEmail.split('@')[0];
    const uid = 'usr_local_' + Math.abs(cleanEmail.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)).toString(36);
    const newLocalUser: AuthUser = {
      uid,
      email: cleanEmail,
      displayName: cleanName,
      photoURL: null,
    };
    try {
      localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify(newLocalUser));
    } catch {}
    setLocalUser(newLocalUser);
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const sendPhoneOtp = async (phoneNumber: string, appVerifier: RecaptchaVerifier) => {
    return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  };

  const logout = async () => {
    try {
      localStorage.removeItem(LOCAL_AUTH_STORAGE_KEY);
    } catch {}
    setLocalUser(null);
    try {
      await signOut(auth);
    } catch {}
  };

  const authUser: AuthUser | null = currentUser
    ? {
        uid: currentUser.uid,
        email: currentUser.email,
        phoneNumber: currentUser.phoneNumber,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
      }
    : localUser;

  const isLocalAccount = !currentUser && !!localUser;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        authUser,
        isLocalAccount,
        loading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        loginAnonymously,
        loginLocally,
        sendPasswordReset,
        sendPhoneOtp,
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
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
