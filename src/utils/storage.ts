import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, OperationType, handleFirestoreError } from '../firebase';
import { Transaction, Category, BusinessProfile, AppSettings, Banner } from '../types';
import { getTodayDateString } from './formatters';

const STORAGE_KEYS = {
  TRANSACTIONS: 'bukukas_transactions_v2',
  CATEGORIES: 'bukukas_categories_v2',
  PROFILE: 'bukukas_profile_v2',
  SETTINGS: 'bukukas_settings_v2',
  BANNERS: 'bukukas_banners_v2',
  AUTO_BACKUP_TIMESTAMP: 'bukukas_auto_backup_v2',
};

export const DEFAULT_IN_CATEGORIES: Category[] = [
  { id: 'in-1', name: 'Penjualan', type: 'IN', isDefault: true, color: '#10b981' },
  { id: 'in-2', name: 'Modal', type: 'IN', isDefault: true, color: '#3b82f6' },
  { id: 'in-3', name: 'Iuran', type: 'IN', isDefault: true, color: '#8b5cf6' },
  { id: 'in-4', name: 'Donasi', type: 'IN', isDefault: true, color: '#ec4899' },
  { id: 'in-5', name: 'Sumbangan', type: 'IN', isDefault: true, color: '#f59e0b' },
  { id: 'in-6', name: 'Pembayaran', type: 'IN', isDefault: true, color: '#14b8a6' },
  { id: 'in-7', name: 'Pendapatan', type: 'IN', isDefault: true, color: '#06b6d4' },
  { id: 'in-8', name: 'Lainnya', type: 'IN', isDefault: true, color: '#64748b' },
];

export const DEFAULT_OUT_CATEGORIES: Category[] = [
  { id: 'out-1', name: 'Belanja', type: 'OUT', isDefault: true, color: '#ef4444' },
  { id: 'out-2', name: 'Gaji', type: 'OUT', isDefault: true, color: '#f97316' },
  { id: 'out-3', name: 'Listrik', type: 'OUT', isDefault: true, color: '#eab308' },
  { id: 'out-4', name: 'Air', type: 'OUT', isDefault: true, color: '#0284c7' },
  { id: 'out-5', name: 'Internet', type: 'OUT', isDefault: true, color: '#6366f1' },
  { id: 'out-6', name: 'Transportasi', type: 'OUT', isDefault: true, color: '#a855f7' },
  { id: 'out-7', name: 'Operasional', type: 'OUT', isDefault: true, color: '#d946ef' },
  { id: 'out-8', name: 'Perlengkapan', type: 'OUT', isDefault: true, color: '#f43f5e' },
  { id: 'out-9', name: 'Pemeliharaan', type: 'OUT', isDefault: true, color: '#78716c' },
  { id: 'out-10', name: 'Lainnya', type: 'OUT', isDefault: true, color: '#64748b' },
];

export const DEFAULT_BUSINESS_PROFILE: BusinessProfile = {
  name: 'Buku Kas Pro',
  owner: '',
  address: '',
  phone: '',
  whatsapp: '08179015181',
  email: '',
  notes: 'Catat Keuangan Lebih Mudah',
  logo: null,
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  currency: 'IDR',
  currencySymbol: 'Rp',
  confirmDelete: true,
  prefixTransaction: true,
  enablePin: false,
  pinCode: '',
  biometricEnabled: false,
  warnNegativeBalance: true,
  lastBackupDate: null,
  notificationsEnabled: true,
};

// ==========================================
// LOCAL STORAGE LAYER (FOR INSTANT PERSISTENCE & OFFLINE RESILIENCE)
// ==========================================

export function loadLocalTransactions(userId?: string): Transaction[] {
  try {
    const key = userId ? `${STORAGE_KEYS.TRANSACTIONS}_${userId}` : STORAGE_KEYS.TRANSACTIONS;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error loading local transactions:', e);
    return [];
  }
}

export function saveLocalTransactions(transactions: Transaction[], userId?: string): void {
  try {
    const key = userId ? `${STORAGE_KEYS.TRANSACTIONS}_${userId}` : STORAGE_KEYS.TRANSACTIONS;
    localStorage.setItem(key, JSON.stringify(transactions));
  } catch (e) {
    console.error('Error saving local transactions:', e);
  }
}

export function loadLocalCategories(userId?: string): Category[] {
  try {
    const key = userId ? `${STORAGE_KEYS.CATEGORIES}_${userId}` : STORAGE_KEYS.CATEGORIES;
    const raw = localStorage.getItem(key);
    if (!raw) {
      const initial = [...DEFAULT_IN_CATEGORIES, ...DEFAULT_OUT_CATEGORIES];
      saveLocalCategories(initial, userId);
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading local categories:', e);
    return [...DEFAULT_IN_CATEGORIES, ...DEFAULT_OUT_CATEGORIES];
  }
}

export function saveLocalCategories(categories: Category[], userId?: string): void {
  try {
    const key = userId ? `${STORAGE_KEYS.CATEGORIES}_${userId}` : STORAGE_KEYS.CATEGORIES;
    localStorage.setItem(key, JSON.stringify(categories));
  } catch (e) {
    console.error('Error saving local categories:', e);
  }
}

export function loadLocalBusinessProfile(userId?: string): BusinessProfile {
  try {
    const key = userId ? `${STORAGE_KEYS.PROFILE}_${userId}` : STORAGE_KEYS.PROFILE;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : DEFAULT_BUSINESS_PROFILE;
  } catch (e) {
    console.error('Error loading local business profile:', e);
    return DEFAULT_BUSINESS_PROFILE;
  }
}

export function saveLocalBusinessProfile(profile: BusinessProfile, userId?: string): void {
  try {
    const key = userId ? `${STORAGE_KEYS.PROFILE}_${userId}` : STORAGE_KEYS.PROFILE;
    localStorage.setItem(key, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving local profile:', e);
  }
}

export function loadLocalSettings(userId?: string): AppSettings {
  try {
    const key = userId ? `${STORAGE_KEYS.SETTINGS}_${userId}` : STORAGE_KEYS.SETTINGS;
    const raw = localStorage.getItem(key);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch (e) {
    console.error('Error loading local settings:', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveLocalSettings(settings: AppSettings, userId?: string): void {
  try {
    const key = userId ? `${STORAGE_KEYS.SETTINGS}_${userId}` : STORAGE_KEYS.SETTINGS;
    localStorage.setItem(key, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving local settings:', e);
  }
}

export function loadLocalBanners(userId?: string): Banner[] {
  try {
    const key = userId ? `${STORAGE_KEYS.BANNERS}_${userId}` : STORAGE_KEYS.BANNERS;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error loading local banners:', e);
    return [];
  }
}

export function saveLocalBanners(banners: Banner[], userId?: string): void {
  try {
    const key = userId ? `${STORAGE_KEYS.BANNERS}_${userId}` : STORAGE_KEYS.BANNERS;
    localStorage.setItem(key, JSON.stringify(banners));
  } catch (e) {
    console.error('Error saving local banners:', e);
  }
}

// Aliases for unified synchronous local calls
export const loadTransactions = loadLocalTransactions;
export const saveTransactions = saveLocalTransactions;
export const loadCategories = loadLocalCategories;
export const saveCategories = saveLocalCategories;
export const loadBusinessProfile = loadLocalBusinessProfile;
export const saveBusinessProfile = saveLocalBusinessProfile;
export const loadSettings = loadLocalSettings;
export const saveSettings = saveLocalSettings;
export const loadBanners = loadLocalBanners;
export const saveBanners = saveLocalBanners;

// ==========================================
// FIRESTORE REALTIME ONLINE DATABASE LAYER
// ==========================================

/**
 * Subscribe to realtime user transactions from Firestore
 */
export function subscribeUserTransactions(
  userId: string,
  onUpdate: (transactions: Transaction[]) => void
) {
  const path = `users/${userId}/transactions`;
  const txRef = collection(db, 'users', userId, 'transactions');
  const q = query(txRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: Transaction[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as Transaction;
        list.push({ ...data, id: d.id });
      });
      saveLocalTransactions(list, userId);
      onUpdate(list);
    },
    (err) => {
      console.warn('Realtime transactions snapshot info, using local cache:', err);
    }
  );
}

/**
 * Save or update transaction to Firestore
 */
export async function saveFirestoreTransaction(
  userId: string,
  transaction: Transaction
): Promise<void> {
  const path = `users/${userId}/transactions/${transaction.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'transactions', transaction.id);
    await setDoc(docRef, {
      ...transaction,
      userId,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.warn('Firestore write warning for tx:', error);
  }
}

/**
 * Delete transaction from Firestore
 */
export async function deleteFirestoreTransaction(
  userId: string,
  transactionId: string
): Promise<void> {
  const path = `users/${userId}/transactions/${transactionId}`;
  try {
    const docRef = doc(db, 'users', userId, 'transactions', transactionId);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Firestore delete warning for tx:', error);
  }
}

/**
 * Subscribe to user categories
 */
export function subscribeUserCategories(
  userId: string,
  onUpdate: (categories: Category[]) => void
) {
  const path = `users/${userId}/categories`;
  const catRef = collection(db, 'users', userId, 'categories');

  return onSnapshot(
    catRef,
    async (snapshot) => {
      if (snapshot.empty) {
        // Initialize default categories for new user
        const defaults = [...DEFAULT_IN_CATEGORIES, ...DEFAULT_OUT_CATEGORIES];
        for (const cat of defaults) {
          try {
            await setDoc(doc(db, 'users', userId, 'categories', cat.id), {
              ...cat,
              userId,
            });
          } catch (e) {
            console.error('Error seeding default category:', e);
          }
        }
        onUpdate(defaults);
        saveLocalCategories(defaults, userId);
      } else {
        const list: Category[] = [];
        snapshot.forEach((d) => {
          list.push({ ...(d.data() as Category), id: d.id });
        });
        saveLocalCategories(list, userId);
        onUpdate(list);
      }
    },
    (err) => {
      console.warn('Realtime categories snapshot info, using local cache:', err);
    }
  );
}

/**
 * Save or update category in Firestore
 */
export async function saveFirestoreCategory(
  userId: string,
  category: Category
): Promise<void> {
  const path = `users/${userId}/categories/${category.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'categories', category.id);
    await setDoc(docRef, { ...category, userId });
  } catch (error) {
    console.warn('Firestore write warning for category:', error);
  }
}

/**
 * Delete category in Firestore
 */
export async function deleteFirestoreCategory(
  userId: string,
  categoryId: string
): Promise<void> {
  const path = `users/${userId}/categories/${categoryId}`;
  try {
    const docRef = doc(db, 'users', userId, 'categories', categoryId);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Firestore delete warning for category:', error);
  }
}

/**
 * Subscribe to user profile & settings
 */
export function subscribeUserProfile(
  userId: string,
  onUpdate: (profile: BusinessProfile, settings: AppSettings) => void
) {
  const path = `users/${userId}`;
  const userRef = doc(db, 'users', userId);

  return onSnapshot(
    userRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const profile: BusinessProfile = {
          name: data.businessName || DEFAULT_BUSINESS_PROFILE.name,
          owner: data.businessOwner || '',
          address: data.businessAddress || '',
          phone: data.businessPhone || '',
          whatsapp: data.businessWhatsapp || '08179015181',
          email: data.businessEmail || data.email || '',
          notes: data.businessNotes || 'Catat Keuangan Lebih Mudah',
          logo: data.businessLogo || null,
        };
        const settings: AppSettings = {
          theme: data.theme || 'light',
          currency: data.currency || 'IDR',
          currencySymbol: 'Rp',
          confirmDelete: data.confirmDelete ?? true,
          prefixTransaction: true,
          enablePin: data.enablePin ?? false,
          pinCode: data.pinCode || '',
          biometricEnabled: data.biometricEnabled ?? false,
          warnNegativeBalance: data.warnNegativeBalance ?? true,
          lastBackupDate: data.lastBackupDate || null,
          notificationsEnabled: data.notificationsEnabled ?? true,
        };
        saveLocalBusinessProfile(profile, userId);
        saveLocalSettings(settings, userId);
        onUpdate(profile, settings);
      }
    },
    (err) => {
      console.warn('Realtime profile snapshot info, using local cache:', err);
    }
  );
}

/**
 * Save user profile & settings to Firestore
 */
export async function saveFirestoreUserProfile(
  userId: string,
  profile: BusinessProfile,
  settings: AppSettings
): Promise<void> {
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(
      userRef,
      {
        uid: userId,
        businessName: profile.name,
        businessOwner: profile.owner,
        businessAddress: profile.address,
        businessPhone: profile.phone,
        businessWhatsapp: profile.whatsapp,
        businessEmail: profile.email,
        businessNotes: profile.notes,
        businessLogo: profile.logo,
        theme: settings.theme,
        currency: settings.currency,
        confirmDelete: settings.confirmDelete,
        enablePin: settings.enablePin,
        pinCode: settings.pinCode,
        biometricEnabled: settings.biometricEnabled,
        warnNegativeBalance: settings.warnNegativeBalance,
        lastBackupDate: settings.lastBackupDate,
        notificationsEnabled: settings.notificationsEnabled ?? true,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Firestore write warning for profile:', error);
  }
}

/**
 * Subscribe to banners
 */
export function subscribeUserBanners(
  userId: string,
  onUpdate: (banners: Banner[]) => void
) {
  const path = `users/${userId}/banners`;
  const bannerRef = collection(db, 'users', userId, 'banners');

  return onSnapshot(
    bannerRef,
    (snapshot) => {
      const list: Banner[] = [];
      snapshot.forEach((d) => {
        list.push({ ...(d.data() as Banner), id: d.id });
      });
      saveLocalBanners(list, userId);
      onUpdate(list);
    },
    (err) => {
      console.warn('Realtime banner snapshot info, using local cache:', err);
    }
  );
}

export async function saveFirestoreBanner(userId: string, banner: Banner): Promise<void> {
  const path = `users/${userId}/banners/${banner.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'banners', banner.id);
    await setDoc(docRef, { ...banner, userId });
  } catch (error) {
    console.warn('Firestore write warning for banner:', error);
  }
}

export async function deleteFirestoreBanner(userId: string, bannerId: string): Promise<void> {
  const path = `users/${userId}/banners/${bannerId}`;
  try {
    const docRef = doc(db, 'users', userId, 'banners', bannerId);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Firestore delete warning for banner:', error);
  }
}

/**
 * Upload image to Firebase Storage with base64 fallback
 */
export async function uploadImageToStorage(
  userId: string,
  dataUrl: string,
  folder: 'receipts' | 'banners' | 'logos'
): Promise<string> {
  try {
    const filename = `${folder}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.jpg`;
    const storageRef = ref(storage, `users/${userId}/${folder}/${filename}`);
    await uploadString(storageRef, dataUrl, 'data_url');
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (err) {
    console.warn('Storage upload failed or bucket restricted, storing optimized dataUrl locally/firestore:', err);
    // Return compressed dataUrl directly as safe fallback
    return dataUrl;
  }
}

// ==========================================
// CALCULATIONS & EXPORT HELPERS
// ==========================================

export function calculateTotals(transactions: Transaction[]) {
  let totalIn = 0;
  let totalOut = 0;

  for (const t of transactions) {
    if (t.type === 'IN') {
      totalIn += t.amount;
    } else {
      totalOut += t.amount;
    }
  }

  const balance = totalIn - totalOut;
  const count = transactions.length;

  return { totalIn, totalOut, balance, count };
}

export function calculateDatePeriodStats(transactions: Transaction[]) {
  const today = getTodayDateString();
  const currentMonth = today.slice(0, 7); // YYYY-MM

  let inToday = 0;
  let outToday = 0;
  let inThisMonth = 0;
  let outThisMonth = 0;

  for (const t of transactions) {
    if (t.date === today) {
      if (t.type === 'IN') inToday += t.amount;
      else outToday += t.amount;
    }
    if (t.date.startsWith(currentMonth)) {
      if (t.type === 'IN') inThisMonth += t.amount;
      else outThisMonth += t.amount;
    }
  }

  return {
    inToday,
    outToday,
    balanceToday: inToday - outToday,
    inThisMonth,
    outThisMonth,
    balanceThisMonth: inThisMonth - outThisMonth,
  };
}

/**
 * Backup entire database to JSON blob
 */
export function exportBackupJSON(
  profile: BusinessProfile,
  settings: AppSettings,
  categories: Category[],
  transactions: Transaction[],
  banners: Banner[] = []
): { filename: string; jsonString: string } {
  const data = {
    appName: 'BUKU KAS PRO',
    version: '2.0.0 (Cloud & PWA Edition)',
    exportDate: new Date().toISOString(),
    creator: 'Jamhur (08179015181)',
    businessProfile: profile,
    settings,
    categories,
    transactions,
    banners,
  };

  const today = getTodayDateString();
  const filename = `backup_bukukas_${today}.json`;
  const jsonString = JSON.stringify(data, null, 2);

  return { filename, jsonString };
}

/**
 * Automatic background snapshot to ensure no data is ever lost
 */
export function performAutoBackup(
  userId: string,
  transactions: Transaction[],
  categories: Category[],
  profile: BusinessProfile,
  settings: AppSettings
) {
  try {
    const backupObj = {
      timestamp: Date.now(),
      dateStr: new Date().toISOString(),
      transactions,
      categories,
      profile,
      settings,
    };
    localStorage.setItem(`${STORAGE_KEYS.AUTO_BACKUP_TIMESTAMP}_${userId}`, JSON.stringify(backupObj));
  } catch (err) {
    console.warn('Auto backup local write warning:', err);
  }
}

/**
 * Restore database from JSON
 */
export function restoreBackupJSON(jsonString: string): {
  success: boolean;
  message: string;
  data?: any;
} {
  try {
    const data = JSON.parse(jsonString);
    if (!data.transactions || !Array.isArray(data.transactions)) {
      return { success: false, message: 'File backup tidak valid: data transaksi tidak ditemukan.' };
    }

    return {
      success: true,
      message: `Berhasil memverifikasi cadangan dengan ${data.transactions.length} transaksi!`,
      data,
    };
  } catch {
    return {
      success: false,
      message: 'Format file JSON rusak atau tidak kompatibel.',
    };
  }
}
