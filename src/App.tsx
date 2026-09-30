import React, { useState, useEffect, useRef } from 'react';
import {
  Transaction,
  Category,
  BusinessProfile,
  AppSettings,
  NavigationTab,
  TransactionType,
  Banner,
} from './types';
import {
  loadLocalTransactions,
  saveLocalTransactions,
  loadLocalCategories,
  saveLocalCategories,
  loadLocalBusinessProfile,
  saveLocalBusinessProfile,
  loadLocalSettings,
  saveLocalSettings,
  loadLocalBanners,
  saveLocalBanners,
  calculateTotals,
  subscribeUserTransactions,
  saveFirestoreTransaction,
  deleteFirestoreTransaction,
  subscribeUserCategories,
  saveFirestoreCategory,
  deleteFirestoreCategory,
  subscribeUserProfile,
  saveFirestoreUserProfile,
  subscribeUserBanners,
  saveFirestoreBanner,
  deleteFirestoreBanner,
  performAutoBackup,
} from './utils/storage';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';
import { SplashScreen } from './components/SplashScreen';
import { PinLockScreen } from './components/PinLockScreen';
import { TopAppBar } from './components/TopAppBar';
import { BottomNavBar } from './components/BottomNavBar';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { TransactionFormModal } from './components/TransactionFormModal';
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { CategoriesModal } from './components/CategoriesModal';
import { GuideModal } from './components/GuideModal';
import { AndroidStudioGuideModal } from './components/AndroidStudioGuideModal';
import { AuthModal } from './components/AuthModal';
import { BannerModal } from './components/BannerModal';
import { WhatsAppSenderModal } from './components/WhatsAppSenderModal';

export default function App() {
  const { currentUser, authUser } = useAuth();
  const toast = useToast();

  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);

  // Core Data States
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    loadLocalTransactions(currentUser?.uid)
  );
  const [categories, setCategories] = useState<Category[]>(() =>
    loadLocalCategories(currentUser?.uid)
  );
  const [profile, setProfile] = useState<BusinessProfile>(() =>
    loadLocalBusinessProfile(currentUser?.uid)
  );
  const [settings, setSettings] = useState<AppSettings>(() =>
    loadLocalSettings(currentUser?.uid)
  );
  const [banners, setBanners] = useState<Banner[]>(() =>
    loadLocalBanners(currentUser?.uid)
  );

  // Navigation
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');

  // Security Lock
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    const s = loadLocalSettings();
    return s.enablePin && s.pinCode.length === 4;
  });

  // Modal States
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formModalType, setFormModalType] = useState<TransactionType>('IN');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [apkGuideModalOpen, setApkGuideModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [whatsappSelectedTx, setWhatsappSelectedTx] = useState<Transaction | null>(null);

  // Ref to track if user is authenticated to trigger online sync
  const currentUid = currentUser?.uid || authUser?.uid;

  // Realtime Firestore synchronization per account
  useEffect(() => {
    if (!currentUid) {
      // In offline / guest mode, load local guest data
      setTransactions(loadLocalTransactions());
      setCategories(loadLocalCategories());
      setProfile(loadLocalBusinessProfile());
      setSettings(loadLocalSettings());
      setBanners(loadLocalBanners());
      return;
    }

    // Immediately load local cached data for this user ID (offline-first & fast startup)
    const userTxs = loadLocalTransactions(currentUid);
    const userCats = loadLocalCategories(currentUid);
    let userProfile = loadLocalBusinessProfile(currentUid);
    const userSettings = loadLocalSettings(currentUid);
    let userBanners = loadLocalBanners(currentUid);

    // If this account hasn't saved its profile locally yet, inherit local profile draft if available
    if (!userProfile.owner && !userProfile.address) {
      const guestProfile = loadLocalBusinessProfile();
      if (guestProfile.owner || guestProfile.logo || (guestProfile.name && guestProfile.name !== 'Buku Kas Pro')) {
        userProfile = { ...guestProfile };
        saveLocalBusinessProfile(userProfile, currentUid);
      }
    }

    setTransactions(userTxs);
    setCategories(userCats);
    setProfile(userProfile);
    setSettings(userSettings);
    setBanners(userBanners);

    // Subscribe to Firestore collections in realtime for any authenticated account
    if (currentUid) {
      const unsubTx = subscribeUserTransactions(currentUid, (firestoreTxs) => {
        if (firestoreTxs) {
          setTransactions(firestoreTxs);
        }
      });

      const unsubCats = subscribeUserCategories(currentUid, (firestoreCats) => {
        if (firestoreCats && firestoreCats.length > 0) {
          setCategories(firestoreCats);
        }
      });

      const unsubProfile = subscribeUserProfile(currentUid, (firestoreProfile, firestoreSettings) => {
        setProfile(firestoreProfile);
        setSettings(firestoreSettings);
      });

      const unsubBanners = subscribeUserBanners(currentUid, (firestoreBanners) => {
        if (firestoreBanners) {
          setBanners(firestoreBanners);
        }
      });

      return () => {
        unsubTx();
        unsubCats();
        unsubProfile();
        unsubBanners();
      };
    }
  }, [currentUid]);

  // Sync dark mode class with root html element
  const isDark =
    settings.theme === 'dark' ||
    (settings.theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Financial summary
  const { balance } = calculateTotals(transactions);

  // Handlers for transactions
  const handleOpenAddModal = (type: TransactionType) => {
    setEditingTransaction(null);
    setFormModalType(type);
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (tx: Transaction) => {
    setEditingTransaction(tx);
    setFormModalType(tx.type);
    setFormModalOpen(true);
  };

  const handleOpenDetailModal = (tx: Transaction) => {
    setSelectedTransaction(tx);
    setDetailModalOpen(true);
  };

  const handleSaveTransaction = async (
    data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>,
    editId?: string
  ) => {
    if (editId) {
      // Edit existing
      const updated = transactions.map((t) =>
        t.id === editId
          ? {
              ...t,
              ...data,
              userId: currentUid,
              updatedAt: Date.now(),
            }
          : t
      );
      setTransactions(updated);
      saveLocalTransactions(updated, currentUid);

      const targetTx = updated.find((t) => t.id === editId);
      if (targetTx && currentUid) {
        await saveFirestoreTransaction(currentUid, targetTx);
      }

      if (selectedTransaction?.id === editId && targetTx) {
        setSelectedTransaction(targetTx);
      }
      toast.success('Transaksi berhasil diperbarui!', 'Update Berhasil');
      performAutoBackup(currentUid || 'guest', updated, categories, profile, settings);
    } else {
      // Add new
      const newTx: Transaction = {
        ...data,
        id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        userId: currentUid,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const updated = [newTx, ...transactions];
      setTransactions(updated);
      saveLocalTransactions(updated, currentUid);

      if (currentUid) {
        await saveFirestoreTransaction(currentUid, newTx);
      }

      toast.success(
        `Kas ${newTx.type === 'IN' ? 'Masuk' : 'Keluar'} sebesar Rp ${newTx.amount.toLocaleString(
          'id-ID'
        )} berhasil dicatat!`,
        'Tersimpan'
      );
      performAutoBackup(currentUid || 'guest', updated, categories, profile, settings);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    saveLocalTransactions(updated, currentUid);

    if (currentUid) {
      await deleteFirestoreTransaction(currentUid, id);
    }

    if (selectedTransaction?.id === id) {
      setSelectedTransaction(null);
      setDetailModalOpen(false);
    }

    toast.info('Transaksi berhasil dihapus dari pembukuan.', 'Dihapus');
    performAutoBackup(currentUid || 'guest', updated, categories, profile, settings);
  };

  // Category handlers
  const handleAddCategory = async (newCat: Omit<Category, 'id'>) => {
    const created: Category = {
      ...newCat,
      id: `cat-${Date.now()}`,
      userId: currentUid,
    };
    const updated = [...categories, created];
    setCategories(updated);
    saveLocalCategories(updated, currentUid);

    if (currentUid) {
      await saveFirestoreCategory(currentUid, created);
    }
    toast.success(`Kategori "${created.name}" berhasil ditambahkan.`);
  };

  const handleUpdateCategory = async (id: string, newName: string) => {
    const updated = categories.map((c) => (c.id === id ? { ...c, name: newName } : c));
    setCategories(updated);
    saveLocalCategories(updated, currentUid);

    const changed = updated.find((c) => c.id === id);
    if (changed && currentUid) {
      await saveFirestoreCategory(currentUid, changed);
    }
    toast.success('Kategori berhasil diubah.');
  };

  const handleDeleteCategory = async (id: string) => {
    const updated = categories.filter((c) => c.id !== id);
    setCategories(updated);
    saveLocalCategories(updated, currentUid);

    if (currentUid) {
      await deleteFirestoreCategory(currentUid, id);
    }
    toast.info('Kategori berhasil dihapus.');
  };

  // Profile and Settings update
  const handleUpdateProfile = async (newProfile: BusinessProfile) => {
    setProfile(newProfile);
    saveLocalBusinessProfile(newProfile, currentUid);

    if (currentUid) {
      await saveFirestoreUserProfile(currentUid, newProfile, settings);
    }
    toast.success('Profil usaha berhasil disimpan!');
  };

  const handleUpdateSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveLocalSettings(newSettings, currentUid);

    if (currentUid) {
      await saveFirestoreUserProfile(currentUid, profile, newSettings);
    }
    toast.success('Pengaturan berhasil diperbarui.');
  };

  const handleToggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    handleUpdateSettings({ ...settings, theme: next });
  };

  const handleRestoreSuccess = (data: any) => {
    if (data.transactions) setTransactions(data.transactions);
    if (data.categories) setCategories(data.categories);
    if (data.businessProfile) setProfile(data.businessProfile);
    if (data.settings) setSettings(data.settings);
    if (data.banners) setBanners(data.banners);

    if (currentUid) {
      if (data.transactions) saveLocalTransactions(data.transactions, currentUid);
      if (data.categories) saveLocalCategories(data.categories, currentUid);
      if (data.businessProfile) saveLocalBusinessProfile(data.businessProfile, currentUid);
      if (data.settings) saveLocalSettings(data.settings, currentUid);
      if (data.banners) saveLocalBanners(data.banners, currentUid);
    }
    toast.success('Data pembukuan berhasil dipulihkan dari file cadangan!', 'Restore Berhasil');
  };

  // Open WhatsApp Modal for a specific transaction or overall report
  const handleOpenWhatsAppModal = (tx?: Transaction) => {
    setWhatsappSelectedTx(tx || null);
    setWhatsappModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between transition-colors">
      {/* 1. Splash Screen */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* 2. Security PIN Screen */}
      {!showSplash && isLocked && settings.enablePin && (
        <PinLockScreen
          correctPin={settings.pinCode}
          biometricEnabled={settings.biometricEnabled}
          onUnlock={() => setIsLocked(false)}
        />
      )}

      {/* 3. Main App Container (Mobile viewport constrained) */}
      <div className="mx-auto w-full max-w-md min-h-screen flex flex-col bg-white dark:bg-slate-900 border-x border-slate-200/80 dark:border-slate-800 shadow-2xl relative">
        {/* Top App Bar */}
        <TopAppBar
          profile={profile}
          isDark={isDark}
          onToggleTheme={handleToggleTheme}
          onOpenGuide={() => setGuideModalOpen(true)}
          onOpenApkGuide={() => setApkGuideModalOpen(true)}
          onOpenAuth={() => setAuthModalOpen(true)}
          onOpenWhatsAppModal={() => handleOpenWhatsAppModal()}
        />

        {/* Main View Area */}
        <main className="flex-1 px-4 pt-3.5 pb-20">
          {currentTab === 'dashboard' && (
            <DashboardView
              transactions={transactions}
              profile={profile}
              banners={banners}
              onOpenAddModal={handleOpenAddModal}
              onOpenDetailModal={handleOpenDetailModal}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onOpenBannerModal={() => setBannerModalOpen(true)}
              onOpenWhatsAppModal={() => handleOpenWhatsAppModal()}
              onOpenApkGuide={() => setApkGuideModalOpen(true)}
            />
          )}

          {currentTab === 'transactions' && (
            <TransactionsView
              transactions={transactions}
              categories={categories}
              onOpenAddModal={handleOpenAddModal}
              onOpenDetailModal={handleOpenDetailModal}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              transactions={transactions}
              profile={profile}
              onOpenDetailModal={handleOpenDetailModal}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              profile={profile}
              settings={settings}
              transactions={transactions}
              categories={categories}
              banners={banners}
              isDark={isDark}
              onUpdateProfile={handleUpdateProfile}
              onUpdateSettings={handleUpdateSettings}
              onUpdateBanners={setBanners}
              onOpenCategoriesModal={() => setCategoriesModalOpen(true)}
              onOpenGuide={() => setGuideModalOpen(true)}
              onOpenApkGuide={() => setApkGuideModalOpen(true)}
              onOpenAuth={() => setAuthModalOpen(true)}
              onOpenBannerModal={() => setBannerModalOpen(true)}
              onOpenWhatsAppModal={() => handleOpenWhatsAppModal()}
              onRestoreSuccess={handleRestoreSuccess}
              onLockApp={() => setIsLocked(true)}
            />
          )}
        </main>

        {/* Bottom Navigation & Floating Action Button */}
        <BottomNavBar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenAddModal={handleOpenAddModal}
        />
      </div>

      {/* 4. Modals & Dialogs */}
      {/* Transaction Add / Edit Modal */}
      <TransactionFormModal
        isOpen={formModalOpen}
        type={formModalType}
        editingTransaction={editingTransaction}
        categories={categories}
        currentBalance={balance}
        existingCount={transactions.length}
        warnNegativeBalance={settings.warnNegativeBalance}
        onClose={() => {
          setFormModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        onAddCategory={handleAddCategory}
      />

      {/* Transaction Detail & Struk Digital Modal */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        profile={profile}
        confirmDeleteEnabled={settings.confirmDelete}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedTransaction(null);
        }}
        onEdit={(tx) => handleOpenEditModal(tx)}
        onDelete={handleDeleteTransaction}
      />

      {/* Category Management Modal */}
      <CategoriesModal
        isOpen={categoriesModalOpen}
        categories={categories}
        transactions={transactions}
        onClose={() => setCategoriesModalOpen(false)}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      {/* Panduan Penggunaan Modal */}
      <GuideModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
      />

      {/* Android Studio & APK Builder Guide Modal */}
      <AndroidStudioGuideModal
        isOpen={apkGuideModalOpen}
        onClose={() => setApkGuideModalOpen(false)}
      />

      {/* Firebase Authentication Modal (Login / Register / OTP / Reset) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Banner Upload & Management Modal */}
      <BannerModal
        isOpen={bannerModalOpen}
        userId={currentUid || 'local_user'}
        banners={banners}
        onClose={() => setBannerModalOpen(false)}
        onUpdateBanners={setBanners}
      />

      {/* WhatsApp Sender Modal (Laporan / Struk / Info Toko) */}
      <WhatsAppSenderModal
        isOpen={whatsappModalOpen}
        profile={profile}
        transactions={transactions}
        selectedTransaction={whatsappSelectedTx}
        onClose={() => {
          setWhatsappModalOpen(false);
          setWhatsappSelectedTx(null);
        }}
      />
    </div>
  );
}
