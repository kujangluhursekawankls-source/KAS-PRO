import React, { useState, useRef } from 'react';
import {
  BusinessProfile,
  AppSettings,
  Transaction,
  Category,
  Banner,
} from '../types';
import {
  exportBackupJSON,
  restoreBackupJSON,
  uploadImageToStorage,
  saveFirestoreBanner,
  deleteFirestoreBanner,
} from '../utils/storage';
import { exportTransactionsExcel } from '../utils/excelExport';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Store,
  Palette,
  Shield,
  Database,
  Camera,
  Upload,
  Download,
  FileSpreadsheet,
  Check,
  Smartphone,
  Tags,
  MessageSquare,
  Lock,
  ChevronRight,
  HelpCircle,
  Package,
  User as UserIcon,
  LogOut,
  LogIn,
  Layers,
  Cloud,
  Bell,
  Trash2,
  Plus,
  Loader2,
  Sparkles,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react';

interface SettingsViewProps {
  profile: BusinessProfile;
  settings: AppSettings;
  transactions: Transaction[];
  categories: Category[];
  banners: Banner[];
  isDark: boolean;
  onUpdateProfile: (newProfile: BusinessProfile) => void;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onOpenCategoriesModal: () => void;
  onOpenGuide: () => void;
  onOpenApkGuide: () => void;
  onOpenAuth: () => void;
  onOpenBannerModal: () => void;
  onOpenWhatsAppModal: () => void;
  onRestoreSuccess: (data: any) => void;
  onLockApp: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  settings,
  transactions,
  categories,
  banners,
  isDark,
  onUpdateProfile,
  onUpdateSettings,
  onOpenCategoriesModal,
  onOpenGuide,
  onOpenApkGuide,
  onOpenAuth,
  onOpenBannerModal,
  onOpenWhatsAppModal,
  onRestoreSuccess,
  onLockApp,
}) => {
  const { currentUser, authUser, logout } = useAuth();
  const toast = useToast();

  // Local edit state for Profile
  const [profileForm, setProfileForm] = useState<BusinessProfile>(profile);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  // Security PIN states
  const [showPinModal, setShowPinModal] = useState(false);
  const [tempPin, setTempPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Banner Management State (update banner dari menu setting)
  const bannerSectionRef = useRef<HTMLDivElement>(null);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerLink, setBannerLink] = useState('');
  const [bannerPreviewImage, setBannerPreviewImage] = useState<string | null>(null);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isDeletingBannerId, setIsDeletingBannerId] = useState<string | null>(null);

  const handleBannerImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Format gambar harus JPG, JPEG, PNG, atau WEBP.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setBannerPreviewImage(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveNewBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerPreviewImage) {
      toast.warning('Silakan pilih foto / banner terlebih dahulu.');
      return;
    }

    const uid = currentUser?.uid || 'guest';
    setIsUploadingBanner(true);
    try {
      const imageUrl = await uploadImageToStorage(uid, bannerPreviewImage, 'banners');

      const newBanner: Banner = {
        id: `banner-${Date.now()}`,
        userId: uid,
        title: bannerTitle.trim() || 'Banner Usaha',
        subtitle: bannerSubtitle.trim() || 'Kelola keuangan lebih rapi & berkah',
        imageUrl,
        linkUrl: bannerLink.trim() || '',
        isActive: true,
        createdAt: Date.now(),
      };

      await saveFirestoreBanner(uid, newBanner);
      toast.success(
        'Banner berhasil disimpan ke Firebase & langsung aktif di kartu Saldo Beranda!',
        'Banner Berhasil Diperbarui'
      );
      setBannerTitle('');
      setBannerSubtitle('');
      setBannerLink('');
      setBannerPreviewImage(null);
    } catch (err: any) {
      console.error(err);
      toast.error('Gagal mengunggah banner: ' + (err.message || 'Terjadi kesalahan'));
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    const uid = currentUser?.uid || 'guest';
    setIsDeletingBannerId(bannerId);
    try {
      await deleteFirestoreBanner(uid, bannerId);
      toast.success('Banner berhasil dihapus dari database.', 'Banner Dihapus');
    } catch (err: any) {
      console.error(err);
      toast.error('Gagal menghapus banner: ' + (err.message || 'Error'));
    } finally {
      setIsDeletingBannerId(null);
    }
  };

  const scrollToBannerSection = () => {
    bannerSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Logo file upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setProfileForm((prev) => ({ ...prev, logo: dataUrl }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    onUpdateProfile(profileForm);
    setTimeout(() => {
      setIsSavingProfile(false);
      setProfileSavedMsg(true);
      toast.success('Profil usaha berhasil disimpan ke Cloud Firestore!');
      setTimeout(() => setProfileSavedMsg(false), 2500);
    }, 300);
  };

  // Backup & Restore
  const handleBackupDownload = () => {
    const { filename, jsonString } = exportBackupJSON(profile, settings, categories, transactions, banners);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onUpdateSettings({
      ...settings,
      lastBackupDate: new Date().toLocaleDateString('id-ID'),
    });
    toast.success('Cadangan data berhasil diunduh (JSON).', 'Backup Berhasil');
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      !window.confirm(
        'PERINGATAN: Memulihkan cadangan akan menimpa data kas yang ada dengan data dari file backup. Lanjutkan?'
      )
    ) {
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const res = restoreBackupJSON(text);
      if (res.success && res.data) {
        onRestoreSuccess(res.data);
        toast.success(res.message, 'Pemulihan Berhasil');
      } else {
        toast.error(res.message, 'Gagal Memulihkan');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportAllExcel = () => {
    exportTransactionsExcel({
      profile,
      transactions,
      periodLabel: 'Semua Transaksi',
    });
    toast.success('Laporan Excel berhasil diunduh.', 'Export Excel');
  };

  const handleLogout = async () => {
    if (window.confirm('Yakin ingin keluar dari akun ini? Data tetap tersimpan aman di cloud.')) {
      try {
        await logout();
        toast.info('Anda telah keluar dari akun.', 'Logout Berhasil');
      } catch (err: any) {
        toast.error('Gagal logout: ' + err.message);
      }
    }
  };

  // Security handlers
  const handleSavePin = () => {
    if (tempPin.length !== 4 || !/^\d+$/.test(tempPin)) {
      setPinError('PIN harus berupa 4 angka numerik!');
      return;
    }
    onUpdateSettings({
      ...settings,
      enablePin: true,
      pinCode: tempPin,
    });
    setShowPinModal(false);
    setTempPin('');
    setPinError('');
    toast.success('Kunci PIN aplikasi berhasil diaktifkan.');
  };

  const handleDisablePin = () => {
    if (window.confirm('Nonaktifkan kunci PIN aplikasi?')) {
      onUpdateSettings({
        ...settings,
        enablePin: false,
        pinCode: '',
        biometricEnabled: false,
      });
      toast.info('Kunci PIN dinonaktifkan.');
    }
  };

  return (
    <div className="space-y-4 pb-28 text-slate-800 dark:text-slate-200 text-xs">
      {/* 0. Akun Online Firebase Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Akun Online Firebase
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {currentUser
                  ? 'Sinkronisasi Cloud Firestore realtime aktif'
                  : 'Masuk untuk sinkronisasi data antar perangkat'}
              </p>
            </div>
          </div>
          {currentUser && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Tersambung
            </span>
          )}
        </div>

        <div className="pt-3">
          {currentUser ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold">
                  {authUser?.email ? authUser.email[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-xs">
                    {authUser?.displayName || authUser?.email || authUser?.phoneNumber || 'Pengguna Terdaftar'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    UID: {currentUser.uid.slice(0, 16)}...
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-400 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar Akun</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-2xl border border-emerald-200/70 dark:border-emerald-800/50">
              <div>
                <p className="font-bold text-emerald-900 dark:text-emerald-200 text-xs">
                  Anda Menggunakan Akun Tamu / Offline
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Masuk atau buat akun agar data tersimpan permanen di cloud dan bisa diakses dari HP lain.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenAuth}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 active:scale-95 transition shadow-xs shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk / Daftar Akun</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 1. Profil Usaha Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Store className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Profil Usaha & Organisasi
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Data resmi ditampilkan pada kop laporan PDF & struk
              </p>
            </div>
          </div>
          {profileSavedMsg && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <Check className="h-3.5 w-3.5" /> Tersimpan
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3">
          {/* Logo Upload Slot */}
          <div className="flex items-center gap-3">
            <div className="relative">
              {profileForm.logo ? (
                <img
                  src={profileForm.logo}
                  alt="Logo Usaha"
                  className="h-16 w-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 font-bold text-slate-400 dark:bg-slate-800 text-sm">
                  LOGO
                </div>
              )}
              <label className="absolute -bottom-1 -right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-emerald-600 text-white shadow hover:bg-emerald-500">
                <Camera className="h-3.5 w-3.5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">
                Logo Usaha
              </label>
              <p className="text-[10px] text-slate-400 leading-normal">
                Digunakan otomatis pada header laporan PDF dan digital receipt.
              </p>
              {profileForm.logo && (
                <button
                  type="button"
                  onClick={() => setProfileForm((prev) => ({ ...prev, logo: null }))}
                  className="text-[10px] text-rose-500 hover:underline mt-1 block"
                >
                  Hapus Logo
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Nama Usaha / Toko / Komunitas *
              </label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Nama Pemilik / Penanggung Jawab
              </label>
              <input
                type="text"
                value={profileForm.owner}
                onChange={(e) => setProfileForm({ ...profileForm, owner: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Alamat Lengkap
            </label>
            <input
              type="text"
              value={profileForm.address}
              onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                WhatsApp Usaha
              </label>
              <input
                type="text"
                value={profileForm.whatsapp}
                onChange={(e) => setProfileForm({ ...profileForm, whatsapp: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="pt-1 flex justify-end">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 active:scale-95 transition dark:bg-slate-700"
            >
              Simpan Profil Usaha
            </button>
          </div>
        </form>
      </div>

      {/* 2. Shortcuts Grid: Kategori, Banner, WhatsApp */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div
          onClick={onOpenCategoriesModal}
          className="flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 cursor-pointer hover:border-purple-400 transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <Tags className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-xs">Kategori Kas</p>
              <p className="text-[10px] text-slate-400">{categories.length} pos aktif</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        <div
          onClick={scrollToBannerSection}
          className="flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 cursor-pointer hover:border-purple-400 transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-xs">Banner Usaha</p>
              <p className="text-[10px] text-slate-400">{banners.length} banner aktif</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        <div
          onClick={onOpenWhatsAppModal}
          className="flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 cursor-pointer hover:border-emerald-400 transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-xs">Kirim WhatsApp</p>
              <p className="text-[10px] text-slate-400">Kirim laporan & nota</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* 2.5 Banner Usaha & Tampilan Beranda (Sesuai Permintaan: update banner dari menu setting) */}
      <div
        ref={bannerSectionRef}
        id="banner-section"
        className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <Layers className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Banner Usaha & Tampilan Beranda</span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  Online Sync
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Banner otomatis tampil langsung sebagai latar utama kartu Saldo di Beranda
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
            {banners.length} Banner
          </span>
        </div>

        {/* Upload & Form Section */}
        <form onSubmit={handleSaveNewBanner} className="space-y-3.5">
          {/* File Picker & Image Preview Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              Pilih Foto / Banner Usaha (JPG, JPEG, PNG, WEBP) *
            </label>

            <div className="relative">
              {bannerPreviewImage ? (
                <div className="relative h-44 w-full overflow-hidden rounded-2xl border-2 border-emerald-500/40 bg-slate-950 shadow-inner group">
                  <img
                    src={bannerPreviewImage}
                    alt="Preview Banner"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent p-3.5 flex flex-col justify-end text-white">
                    <p className="text-xs font-bold text-emerald-300">
                      Preview: {bannerTitle || 'Judul Banner Usaha'}
                    </p>
                    <p className="text-[11px] text-slate-200 line-clamp-1">
                      {bannerSubtitle || 'Subjudul / promo usaha Anda'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBannerPreviewImage(null)}
                    className="absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-rose-600/90 text-white shadow hover:bg-rose-500 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-36 w-full cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-4 text-center hover:border-purple-500 hover:bg-purple-50/20 dark:border-slate-700 dark:bg-slate-800/40 transition">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400 mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Klik untuk Pilih Foto dari Galeri / Kamera
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Mendukung format JPG, JPEG, PNG, dan WEBP (Maks 10MB)
                  </p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleBannerImageSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Judul Banner / Nama Promo
              </label>
              <input
                type="text"
                placeholder="Contoh: Toko Berkah Makmur"
                value={bannerTitle}
                onChange={(e) => setBannerTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Subjudul / Tagline / Pesan
              </label>
              <input
                type="text"
                placeholder="Contoh: Diskon 10% Setiap Belanja"
                value={bannerSubtitle}
                onChange={(e) => setBannerSubtitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isUploadingBanner || !bannerPreviewImage}
              className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 px-4 py-2 text-xs font-bold text-white shadow-sm active:scale-95 transition"
            >
              {isUploadingBanner ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Mengunggah Banner ke Firebase...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload & Pasang Banner ke Beranda</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* List of currently saved banners */}
        {banners.length > 0 && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Banner Aktif ({banners.length})
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                ● Tampil Langsung di Kartu Saldo Beranda
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {banners.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-800/60"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-12 w-16 rounded-xl object-cover border border-slate-300 dark:border-slate-700 shadow-2xs shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {item.subtitle || 'Tanpa subjudul'}
                      </p>
                      <span className="inline-block mt-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded">
                        Aktif di Beranda
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteBanner(item.id)}
                    disabled={isDeletingBannerId === item.id}
                    title="Hapus Banner"
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 active:scale-90 transition shrink-0"
                  >
                    {isDeletingBannerId === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Tampilan & Sistem */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors space-y-3">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Palette className="h-4.5 w-4.5 text-blue-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Tampilan & Preferensi
          </h3>
        </div>

        {/* Theme mode buttons */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            Tema Aplikasi
          </label>
          <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            {(['light', 'dark', 'system'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => onUpdateSettings({ ...settings, theme: mode })}
                className={`rounded-lg py-1.5 text-xs font-semibold capitalize transition ${
                  settings.theme === mode
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                {mode === 'light' ? 'Terang' : mode === 'dark' ? 'Gelap' : 'Sistem'}
              </button>
            ))}
          </div>
        </div>

        {/* Peringatan Saldo Minus */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Peringatan Saldo Kas Minus
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Beri peringatan jika kas keluar melebihi saldo kas
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.warnNegativeBalance}
            onChange={(e) =>
              onUpdateSettings({ ...settings, warnNegativeBalance: e.target.checked })
            }
            className="h-4.5 w-4.5 rounded text-emerald-600 focus:ring-emerald-500"
          />
        </div>

        {/* Konfirmasi Hapus */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Konfirmasi Sebelum Hapus Transaksi
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Cegah data terhapus secara tidak sengaja
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.confirmDelete}
            onChange={(e) =>
              onUpdateSettings({ ...settings, confirmDelete: e.target.checked })
            }
            className="h-4.5 w-4.5 rounded text-emerald-600 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* 4. Backup & Pemulihan Data */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors space-y-3">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Database className="h-4.5 w-4.5 text-purple-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Backup & Pemulihan Data (JSON / Excel)
          </h3>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Semua data tersinkronisasi otomatis ke cloud. Anda juga dapat mengunduh arsip JSON offline atau file Excel kapan saja.
        </p>

        {settings.lastBackupDate && (
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            Cadangan terakhir: {settings.lastBackupDate}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          {/* Backup Button */}
          <button
            onClick={handleBackupDownload}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 py-2.5 px-3 font-bold text-white hover:bg-purple-700 active:scale-98 transition shadow-xs"
          >
            <Download className="h-4 w-4" />
            <span>Backup Data (JSON)</span>
          </button>

          {/* Restore Button */}
          <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white py-2.5 px-3 font-semibold text-slate-700 hover:bg-slate-50 active:scale-98 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <Upload className="h-4 w-4" />
            <span>Restore Data (JSON)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleRestoreFile}
              className="hidden"
            />
          </label>

          {/* Export Excel Button */}
          <button
            onClick={handleExportAllExcel}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 px-3 font-bold text-white hover:bg-emerald-500 active:scale-98 transition shadow-xs"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* 5. Keamanan Aplikasi (PIN & Kunci) */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors space-y-3">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Shield className="h-4.5 w-4.5 text-rose-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Keamanan Aplikasi (PIN 4-Digit)
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Kunci Aplikasi dengan PIN
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {settings.enablePin
                ? 'PIN 4 digit aktif saat aplikasi dibuka'
                : 'Belum diaktifkan (bebas dibuka)'}
            </p>
          </div>
          {settings.enablePin ? (
            <button
              onClick={handleDisablePin}
              className="rounded-lg bg-rose-50 px-3 py-1.5 font-bold text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40"
            >
              Nonaktifkan
            </button>
          ) : (
            <button
              onClick={() => setShowPinModal(true)}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 font-bold text-white hover:bg-emerald-500"
            >
              Aktifkan PIN
            </button>
          )}
        </div>

        {settings.enablePin && (
          <div className="pt-2 flex gap-2">
            <button
              onClick={() => setShowPinModal(true)}
              className="flex items-center gap-1 text-[11px] text-blue-600 hover:underline dark:text-blue-400 font-semibold"
            >
              Ubah Kode PIN
            </button>
            <span>·</span>
            <button
              onClick={onLockApp}
              className="flex items-center gap-1 text-[11px] text-slate-600 hover:underline dark:text-slate-400 font-semibold"
            >
              <Lock className="h-3 w-3" />
              Kunci Layar Sekarang
            </button>
          </div>
        )}
      </div>

      {/* 6. Paket Penjualan / Commercial Licensing Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Package className="h-4.5 w-4.5 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Pilihan Paket Aplikasi (Siap Pakai)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* BASIC */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-800/40">
            <span className="font-extrabold text-slate-900 dark:text-white text-xs">
              BASIC
            </span>
            <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              Rp99.000
            </p>
            <ul className="mt-2 space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
              <li>✓ Kas Masuk & Kas Keluar</li>
              <li>✓ Saldo Otomatis Real-time</li>
              <li>✓ Riwayat Transaksi Lengkap</li>
              <li>✓ Export Laporan PDF</li>
              <li>✓ Profil Usaha & Logo</li>
            </ul>
          </div>

          {/* PRO */}
          <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50/40 p-3 dark:border-emerald-500 dark:bg-emerald-950/20 relative">
            <span className="absolute top-2 right-2 rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase">
              Terlaris
            </span>
            <span className="font-extrabold text-slate-900 dark:text-white text-xs">
              PRO
            </span>
            <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              Rp199.000
            </p>
            <ul className="mt-2 space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
              <li>✓ Semua Fitur Basic</li>
              <li>✓ Cloud Firestore & Multi-Device</li>
              <li>✓ PWA Siap Install Android / iOS</li>
              <li>✓ Export Excel & Backup Cloud</li>
              <li>✓ Upload Banner Usaha</li>
              <li>✓ Integrasi Pesan WhatsApp</li>
            </ul>
          </div>

          {/* CUSTOM */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-800/40">
            <span className="font-extrabold text-slate-900 dark:text-white text-xs">
              CUSTOM
            </span>
            <p className="text-sm font-black text-purple-600 dark:text-purple-400 mt-0.5">
              Mulai Rp500.000
            </p>
            <ul className="mt-2 space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
              <li>✓ Nama & Branding Khusus</li>
              <li>✓ Format Laporan Khusus</li>
              <li>✓ Modul Multi-Cabang / Tim</li>
              <li>✓ Setup APK Android Studio</li>
            </ul>
          </div>
        </div>

        <button
          onClick={() => {
            const text = encodeURIComponent('Halo Jamhur, saya ingin konsultasi / upgrade paket Buku Kas Pro.');
            window.open(`https://wa.me/628179015181?text=${text}`, '_blank');
          }}
          className="mt-3.5 w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 font-bold text-white hover:bg-emerald-500 transition active:scale-98 shadow-xs text-xs"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Pesan / Upgrade Paket via WhatsApp</span>
        </button>
      </div>

      {/* 7. Panduan & Android Studio Shortcuts */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onOpenGuide}
          className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200/90 bg-white p-3.5 font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <HelpCircle className="h-4 w-4 text-emerald-500" />
          <span>Panduan Penggunaan</span>
        </button>

        <button
          onClick={onOpenApkGuide}
          className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200/90 bg-white p-3.5 font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <Smartphone className="h-4 w-4 text-blue-500" />
          <span>Panduan Build APK</span>
        </button>
      </div>

      {/* 8. Tentang Aplikasi & Developer Footer */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-center space-y-2">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 font-bold text-white shadow-sm">
          BK
        </div>
        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
          BUKU KAS PRO
        </h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Versi 2.0.0 (Cloud Firestore & PWA Edition)
        </p>

        <div className="py-1 border-y border-slate-100 dark:border-slate-800 my-2">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            Created By Jamhur
          </p>
          <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
            WhatsApp: 08179015181
          </p>
        </div>

        <button
          onClick={() => {
            const text = encodeURIComponent('Halo Jamhur, saya ingin bertanya tentang aplikasi Buku Kas Pro.');
            window.open(`https://wa.me/628179015181?text=${text}`, '_blank');
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-2.5 px-4 font-bold text-emerald-700 hover:bg-emerald-100 active:scale-98 transition w-full dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          <MessageSquare className="h-4 w-4" />
          <span>💬 HUBUNGI DEVELOPER</span>
        </button>
      </div>

      {/* PIN Setup Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xs rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 mb-3">
              <Lock className="h-6 w-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Atur PIN 4 Angka
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Masukkan 4 digit angka untuk mengunci aplikasi saat dibuka.
            </p>

            <input
              type="password"
              maxLength={4}
              inputMode="numeric"
              placeholder="••••"
              value={tempPin}
              onChange={(e) => {
                setTempPin(e.target.value.replace(/[^0-9]/g, ''));
                setPinError('');
              }}
              className="w-full tracking-widest text-center text-2xl font-mono py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-2"
              autoFocus
            />

            {pinError && <p className="text-xs text-rose-500 mb-3">{pinError}</p>}

            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={() => {
                  setShowPinModal(false);
                  setTempPin('');
                  setPinError('');
                }}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSavePin}
                className="flex-1 rounded-xl bg-emerald-600 py-2.5 font-bold text-white shadow hover:bg-emerald-500"
              >
                Simpan PIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
