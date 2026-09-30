export type TransactionType = 'IN' | 'OUT';

export interface Transaction {
  id: string;
  userId?: string;
  transactionNumber: string;
  type: TransactionType;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  category: string;
  sourceOrTarget: string; // Sumber Dana for IN, Tujuan Pengeluaran for OUT
  amount: number;
  description: string;
  receiptImage?: string | null; // Image URL / Storage / Base64
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: string;
  userId?: string;
  name: string;
  type: TransactionType;
  color?: string;
  iconName?: string;
  isDefault?: boolean;
}

export interface BusinessProfile {
  name: string;
  owner: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  notes: string;
  logo: string | null;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  currency: string;
  currencySymbol: string;
  confirmDelete: boolean;
  prefixTransaction: boolean;
  enablePin: boolean;
  pinCode: string; // 4 digits
  biometricEnabled: boolean;
  warnNegativeBalance: boolean;
  lastBackupDate: string | null;
  notificationsEnabled?: boolean;
}

export interface Banner {
  id: string;
  userId?: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl?: string;
  isActive: boolean;
  createdAt: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
}

export interface AuthUser {
  uid: string;
  email?: string | null;
  phoneNumber?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}

export type NavigationTab = 'dashboard' | 'transactions' | 'reports' | 'settings';

export type ReportPeriod = 'today' | 'weekly' | 'monthly' | 'yearly' | 'custom';
