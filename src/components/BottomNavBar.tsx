import React, { useState } from 'react';
import { NavigationTab, TransactionType } from '../types';
import { LayoutDashboard, ArrowLeftRight, FileText, Settings, Plus, ArrowDownLeft, ArrowUpRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BottomNavBarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenAddModal: (type: TransactionType) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddModal,
}) => {
  const [speedDialOpen, setSpeedDialOpen] = useState(false);

  const handleAction = (type: TransactionType) => {
    setSpeedDialOpen(false);
    onOpenAddModal(type);
  };

  return (
    <>
      {/* Speed Dial Backdrop */}
      <AnimatePresence>
        {speedDialOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSpeedDialOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs"
          />
        )}
      </AnimatePresence>

      {/* Floating Action Button (FAB) Speed Dial Options */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col items-center gap-3">
        <AnimatePresence>
          {speedDialOpen && (
            <>
              {/* Kas Keluar button */}
              <motion.button
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ duration: 0.18 }}
                onClick={() => handleAction('OUT')}
                className="pointer-events-auto flex items-center gap-2.5 rounded-full bg-rose-600 py-2.5 px-5 text-sm font-semibold text-white shadow-xl shadow-rose-600/30 hover:bg-rose-700 active:scale-95 transition"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
                <span>Kas Keluar</span>
              </motion.button>

              {/* Kas Masuk button */}
              <motion.button
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 0, scale: 0.8 }}
                transition={{ duration: 0.22 }}
                onClick={() => handleAction('IN')}
                className="pointer-events-auto flex items-center gap-2.5 rounded-full bg-emerald-600 py-2.5 px-5 text-sm font-semibold text-white shadow-xl shadow-emerald-600/30 hover:bg-emerald-700 active:scale-95 transition"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                  <ArrowDownLeft className="h-4 w-4" />
                </div>
                <span>Kas Masuk</span>
              </motion.button>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Main Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/90 bg-white/95 px-2 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-colors">
        <div className="mx-auto flex h-16 max-w-md items-center justify-around relative">
          {/* Tab 1: Dashboard */}
          <button
            type="button"
            onClick={() => onSelectTab('dashboard')}
            className={`flex min-h-[48px] min-w-[56px] flex-col items-center justify-center py-1 transition-colors ${
              currentTab === 'dashboard'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="h-5 w-5" strokeWidth={currentTab === 'dashboard' ? 2.4 : 1.8} />
            <span className="mt-1 text-[11px] tracking-tight">Dashboard</span>
          </button>

          {/* Tab 2: Transaksi */}
          <button
            type="button"
            onClick={() => onSelectTab('transactions')}
            className={`flex min-h-[48px] min-w-[56px] flex-col items-center justify-center py-1 transition-colors ${
              currentTab === 'transactions'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <ArrowLeftRight className="h-5 w-5" strokeWidth={currentTab === 'transactions' ? 2.4 : 1.8} />
            <span className="mt-1 text-[11px] tracking-tight">Transaksi</span>
          </button>

          {/* Center Floating Action Button (+) */}
          <div className="relative -top-5 flex flex-col items-center">
            <button
              type="button"
              onClick={() => setSpeedDialOpen((prev) => !prev)}
              className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-xl transition-all active:scale-90 ${
                speedDialOpen
                  ? 'bg-slate-800 text-white shadow-slate-900/30 rotate-45'
                  : 'bg-emerald-600 text-white shadow-emerald-600/35 hover:bg-emerald-500'
              }`}
              title="Tambah Transaksi"
            >
              {speedDialOpen ? (
                <X className="h-6 w-6" strokeWidth={2.5} />
              ) : (
                <Plus className="h-7 w-7" strokeWidth={2.5} />
              )}
            </button>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              Catat
            </span>
          </div>

          {/* Tab 3: Laporan */}
          <button
            type="button"
            onClick={() => onSelectTab('reports')}
            className={`flex min-h-[48px] min-w-[56px] flex-col items-center justify-center py-1 transition-colors ${
              currentTab === 'reports'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="h-5 w-5" strokeWidth={currentTab === 'reports' ? 2.4 : 1.8} />
            <span className="mt-1 text-[11px] tracking-tight">Laporan</span>
          </button>

          {/* Tab 4: Pengaturan */}
          <button
            type="button"
            onClick={() => onSelectTab('settings')}
            className={`flex min-h-[48px] min-w-[56px] flex-col items-center justify-center py-1 transition-colors ${
              currentTab === 'settings'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Settings className="h-5 w-5" strokeWidth={currentTab === 'settings' ? 2.4 : 1.8} />
            <span className="mt-1 text-[11px] tracking-tight">Pengaturan</span>
          </button>
        </div>
      </nav>
    </>
  );
};
