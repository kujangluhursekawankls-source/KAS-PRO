import React from 'react';
import { BusinessProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  HelpCircle,
  Smartphone,
  Moon,
  Sun,
  MessageSquare,
  Cloud,
  User as UserIcon,
  LogOut,
} from 'lucide-react';

interface TopAppBarProps {
  profile: BusinessProfile;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenGuide: () => void;
  onOpenApkGuide: () => void;
  onOpenAuth: () => void;
  onOpenWhatsAppModal: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  profile,
  isDark,
  onToggleTheme,
  onOpenGuide,
  onOpenApkGuide,
  onOpenAuth,
  onOpenWhatsAppModal,
}) => {
  const { authUser, currentUser, logout } = useAuth();
  const toast = useToast();

  const handleQuickLogout = async () => {
    const name = authUser?.displayName || authUser?.email || 'akun ini';
    if (window.confirm(`Yakin ingin keluar dari akun "${name}"? Data kas Anda tetap aman tersimpan di cloud.`)) {
      try {
        await logout();
        toast.info('Anda telah keluar dari akun.', 'Logout Berhasil');
      } catch (err: any) {
        toast.error('Gagal keluar akun: ' + err.message);
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/95 px-3.5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-colors">
      {/* Brand & Business identity */}
      <div className="flex items-center gap-2.5 min-w-0">
        {profile.logo ? (
          <img
            src={profile.logo}
            alt={profile.name}
            className="h-9 w-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
          />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 font-black text-white shadow-xs text-xs">
            BK
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
              {profile.name || 'Buku Kas Pro'}
            </h1>
            {authUser && (
              <span className="flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <Cloud className="w-2.5 h-2.5 text-emerald-500" />
                <span className="hidden sm:inline">{currentUser ? 'Online' : 'Aktif'}</span>
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
            {profile.owner ? `Pemilik: ${profile.owner}` : 'Catat Keuangan Lebih Mudah'}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        {/* WhatsApp Modal Sender */}
        <button
          onClick={onOpenWhatsAppModal}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40 active:scale-95 transition"
          title="Kirim Pesan WhatsApp (Laporan / Bukti)"
        >
          <MessageSquare className="h-4 w-4" />
        </button>

        {/* User Account Button */}
        <button
          onClick={onOpenAuth}
          className={`flex h-8 items-center gap-1.5 rounded-xl px-2.5 text-xs font-bold active:scale-95 transition ${
            (authUser || currentUser)
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200'
              : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm'
          }`}
          title={(authUser || currentUser) ? `Akun: ${authUser?.displayName || authUser?.email || 'Aktif'}` : 'Masuk / Daftar Akun'}
        >
          <UserIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-[11px] max-w-[85px] sm:max-w-[120px] truncate">
            {(authUser || currentUser)
              ? (authUser?.displayName || (authUser?.email ? authUser.email.split('@')[0] : 'Akun'))
              : 'Daftar / Masuk'}
          </span>
        </button>

        {/* Explicit Logout Button right on Top App Bar */}
        {(authUser || currentUser) && (
          <button
            onClick={handleQuickLogout}
            className="flex h-8 items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2 text-xs font-bold text-rose-600 hover:bg-rose-100 hover:text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400 active:scale-95 transition"
            title="Keluar dari Akun (Logout)"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="text-[10px] hidden xs:inline">Keluar</span>
          </button>
        )}

        {/* Dark/Light mode */}
        <button
          onClick={onToggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-amber-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-amber-400 active:scale-95 transition"
          title={isDark ? 'Mode Terang' : 'Mode Gelap'}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Panduan */}
        <button
          onClick={onOpenGuide}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white active:scale-95 transition"
          title="Panduan Penggunaan"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
