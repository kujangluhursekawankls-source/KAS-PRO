import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Download, Bell, BellOff, X, Smartphone } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface NetworkAndPwaBarProps {
  onOpenApkGuide?: () => void;
}

export const NetworkAndPwaBar: React.FC<NetworkAndPwaBarProps> = ({ onOpenApkGuide }) => {
  const toast = useToast();
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [dismissedInstall, setDismissedInstall] = useState(false);

  // Monitor online / offline network state
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Koneksi internet terhubung kembali. Sinkronisasi realtime aktif.', 'Online');
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Koneksi terputus. Mode offline aktif, data tersimpan di HP.', 'Offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [toast]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        toast.success('Buku Kas Pro sedang diinstal ke perangkat Anda!', 'PWA Installed');
      }
      setDeferredPrompt(null);
      setCanInstall(false);
    } else if (onOpenApkGuide) {
      onOpenApkGuide();
    }
  };

  const handleRequestNotification = async () => {
    if (typeof Notification === 'undefined') {
      toast.warning('Perangkat Anda tidak mendukung Web Push Notification.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        toast.success('Notifikasi pengingat kas aktif di HP Anda!', 'Notifikasi Diaktifkan');
        // Show test welcome notification
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'NOTIFICATION',
            title: 'Buku Kas Pro',
            body: 'Notifikasi kas aktif! Anda akan menerima update dan pengingat keuangan.',
          });
        } else {
          new Notification('Buku Kas Pro', {
            body: 'Notifikasi kas aktif! Anda akan menerima update dan pengingat keuangan.',
            icon: '/icon.svg',
          });
        }
      } else {
        toast.info('Izin notifikasi ditolak.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-2 mb-2">
      {/* 1. Offline Warning Banner */}
      {!isOnline && (
        <div className="flex items-center justify-between rounded-2xl bg-amber-500/15 border border-amber-500/30 p-2.5 px-3.5 text-xs text-amber-600 dark:text-amber-400 backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span className="font-semibold">Mode Offline</span>
            <span className="text-[11px] text-amber-700/80 dark:text-amber-300/80">
              · Data tetap tersimpan aman di perangkat
            </span>
          </div>
          <span className="text-[10px] font-mono bg-amber-500/20 px-2 py-0.5 rounded-full">
            Lokal
          </span>
        </div>
      )}

      {/* 2. Install App Banner (PWA) */}
      {canInstall && !dismissedInstall && (
        <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-2.5 px-3 text-xs text-white shadow-sm">
          <div className="flex items-center gap-2 min-w-0">
            <Smartphone className="w-4 h-4 shrink-0" />
            <div className="min-w-0 truncate">
              <span className="font-bold">Pasang Buku Kas Pro</span>
              <p className="text-[10px] text-emerald-100 truncate">
                Akses cepat dari layar utama HP / Desktop
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 pl-2">
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1 rounded-xl bg-white px-2.5 py-1 text-[11px] font-bold text-emerald-700 shadow hover:bg-emerald-50 active:scale-95 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
            <button
              onClick={() => setDismissedInstall(true)}
              className="p-1 text-emerald-200 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Notification Prompt if default */}
      {notificationPermission === 'default' && (
        <div className="flex items-center justify-between rounded-2xl bg-slate-100 dark:bg-slate-800/60 p-2 px-3 text-[11px] text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-blue-500" />
            <span>Aktifkan notifikasi pengingat kas di HP</span>
          </div>
          <button
            onClick={handleRequestNotification}
            className="rounded-lg bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-blue-500"
          >
            Aktifkan
          </button>
        </div>
      )}
    </div>
  );
};
