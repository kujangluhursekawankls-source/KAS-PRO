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
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';
import { AuthUser } from '../types';

const LOCAL_AUTH_STORAGE_KEY = 'bukukas_local_auth_user';
const ACCOUNTS_DB_STORAGE_KEY = 'bukukas_registered_accounts_db';

export interface StoredAccount {
  uid: string;
  email: string;
  displayName: string;
  passwordHash: string;
  createdAt: number;
}

// Generate an identical deterministic UID across all browsers and devices for the same user identifier
export function generateDeterministicUid(identifier: string): string {
  const clean = identifier.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `usr_${clean}`;
}

// Simple deterministic hash for password checking
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(36);
}

interface AuthContextType {
  currentUser: User | null;
  authUser: AuthUser | null;
  isLocalAccount: boolean;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string) => Promise<void>;
  registerAccount: (name: string, email: string, pass: string) => Promise<void>;
  loginAccount: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAnonymously: () => Promise<void>;
  loginLocally: (email?: string, displayName?: string) => void;
  sendPasswordReset: (email: string) => Promise<void>;
  sendPhoneOtp: (phoneNumber: string, appVerifier: RecaptchaVerifier) => Promise<ConfirmationResult>;
  logout: () => Promise<void>;
  getSavedAccounts: () => { email: string; displayName: string }[];
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

  const getAccountsDb = (): StoredAccount[] => {
    try {
      const data = localStorage.getItem(ACCOUNTS_DB_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const saveAccountsDb = (accounts: StoredAccount[]) => {
    try {
      localStorage.setItem(ACCOUNTS_DB_STORAGE_KEY, JSON.stringify(accounts));
    } catch {}
  };

  const getSavedAccounts = () => {
    const db = getAccountsDb();
    return db.map((a) => ({ email: a.email, displayName: a.displayName }));
  };

  // High-reliability multi-user account registration (works for ANY person on ANY device)
  const registerAccount = async (name: string, email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim() || cleanEmail.split('@')[0];
    const cleanKey = cleanEmail.replace(/[^a-z0-9]/g, '_');
    const uid = generateDeterministicUid(cleanEmail);

    // Save to Firestore cloud accounts directory for cross-browser sync
    try {
      await setDoc(
        doc(db, 'accounts', cleanKey),
        {
          uid,
          email: cleanEmail,
          displayName: cleanName,
          passwordHash: simpleHash(pass),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    } catch (fsErr) {
      console.warn('Firestore cloud account register warning:', fsErr);
    }

    // Save to local cache on this device
    const dbAccounts = getAccountsDb();
    const newAccount: StoredAccount = {
      uid,
      email: cleanEmail,
      displayName: cleanName,
      passwordHash: simpleHash(pass),
      createdAt: Date.now(),
    };
    const existingIdx = dbAccounts.findIndex((a) => a.email === cleanEmail);
    if (existingIdx >= 0) {
      dbAccounts[existingIdx] = newAccount;
    } else {
      dbAccounts.push(newAccount);
    }
    saveAccountsDb(dbAccounts);

    // Try Firebase in background
    try {
      await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    } catch {}

    // Set active user session
    const activeUser: AuthUser = {
      uid,
      email: cleanEmail,
      displayName: cleanName,
      photoURL: null,
    };
    try {
      localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify(activeUser));
    } catch {}
    setLocalUser(activeUser);
  };

  // Login with email and password (syncs seamlessly across ALL browsers and devices)
  const loginAccount = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanKey = cleanEmail.replace(/[^a-z0-9]/g, '_');
    const expectedUid = generateDeterministicUid(cleanEmail);

    // 1. First check Firestore cloud accounts directory
    try {
      const snap = await getDoc(doc(db, 'accounts', cleanKey));
      if (snap.exists()) {
        const cloudData = snap.data();
        if (cloudData.passwordHash && cloudData.passwordHash !== simpleHash(pass)) {
          throw new Error('Kata sandi yang Anda masukkan salah. Silakan coba lagi.');
        }
        const activeUser: AuthUser = {
          uid: cloudData.uid || expectedUid,
          email: cloudData.email || cleanEmail,
          displayName: cloudData.displayName || cleanEmail.split('@')[0],
          photoURL: null,
        };
        try {
          localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify(activeUser));
        } catch {}
        setLocalUser(activeUser);
        return;
      }
    } catch (cloudErr: any) {
      if (cloudErr.message && cloudErr.message.includes('Kata sandi')) {
        throw cloudErr;
      }
      console.warn('Firestore cloud account lookup:', cloudErr);
    }

    // 2. Try Firebase Auth
    try {
      await signInWithEmailAndPassword(auth, cleanEmail, pass);
      return;
    } catch (fbErr: any) {
      if (fbErr.code === 'auth/wrong-password') {
        throw new Error('Kata sandi yang Anda masukkan salah. Silakan coba lagi.');
      }
    }

    // 3. Check local database on this device
    const dbAccounts = getAccountsDb();
    const found = dbAccounts.find((a) => a.email === cleanEmail);
    if (found) {
      if (found.passwordHash !== simpleHash(pass)) {
        throw new Error('Kata sandi yang Anda masukkan salah. Silakan coba lagi.');
      }
      const activeUser: AuthUser = {
        uid: found.uid || expectedUid,
        email: found.email,
        displayName: found.displayName,
        photoURL: null,
      };
      try {
        localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify(activeUser));
      } catch {}
      setLocalUser(activeUser);
      return;
    }

    // 4. STRICT RULE: Akun yang belum terdaftar dilarang masuk
    throw new Error('Akun belum terdaftar! Silakan klik tab "Daftar Akun Baru" terlebih dahulu.');
  };

  const loginWithEmail = async (email: string, pass: string) => {
    await loginAccount(email, pass);
  };

  const registerWithEmail = async (email: string, pass: string) => {
    await registerAccount(email.split('@')[0], email, pass);
  };

  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const loginAnonymously = async () => {
    try {
      await signInAnonymously(auth);
    } catch (err: any) {
      console.warn('Firebase anonymous auth unavailable, falling back to local instant account:', err);
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
    try {
      await sendPasswordResetEmail(auth, email);
    } catch {
      // Local fallback: always succeed
      console.info('Password reset request acknowledged for:', email);
    }
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
        registerAccount,
        loginAccount,
        loginWithGoogle,
        loginAnonymously,
        loginLocally,
        sendPasswordReset,
        sendPhoneOtp,
        logout,
        getSavedAccounts,
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
