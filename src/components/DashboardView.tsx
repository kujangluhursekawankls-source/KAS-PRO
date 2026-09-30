import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, BusinessProfile, Banner } from '../types';
import { calculateTotals, calculateDatePeriodStats } from '../utils/storage';
import { formatRupiah, formatIndonesianDate } from '../utils/formatters';
import { FinanceCharts } from './FinanceCharts';
import { NetworkAndPwaBar } from './NetworkAndPwaBar';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Calendar,
  ChevronRight,
  PlusCircle,
  MinusCircle,
  FileSpreadsheet,
  Database,
  Camera,
  MessageSquare,
  Layers,
  Sparkles,
  ExternalLink,
  Plus,
} from 'lucide-react';

interface DashboardViewProps {
  transactions: Transaction[];
  profile: BusinessProfile;
  banners: Banner[];
  onOpenAddModal: (type: TransactionType) => void;
  onOpenDetailModal: (transaction: Transaction) => void;
  onNavigateTab: (tab: 'transactions' | 'reports' | 'settings') => void;
  onOpenBannerModal: () => void;
  onOpenWhatsAppModal: () => void;
  onOpenApkGuide: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  profile,
  banners,
  onOpenAddModal,
  onOpenDetailModal,
  onNavigateTab,
  onOpenBannerModal,
  onOpenWhatsAppModal,
  onOpenApkGuide,
}) => {
  const { totalIn, totalOut, balance, count } = calculateTotals(transactions);
  const periodStats = calculateDatePeriodStats(transactions);

  // Active banner index for auto-rotation if multiple banners exist
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIdx((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const activeBanner = banners.length > 0 ? banners[activeBannerIdx] || banners[0] : null;

  // Recent 5 transactions (sorted newest first)
  const recentTransactions = [...transactions]
    .sort((a, b) => {
      const da = `${a.date} ${a.time || '00:00'}`;
      const db = `${b.date} ${b.time || '00:00'}`;
      return db.localeCompare(da);
    })
    .slice(0, 5);

  return (
    <div className="space-y-3.5 pb-24">
      {/* Network and PWA Status Prompt */}
      <NetworkAndPwaBar onOpenApkGuide={onOpenApkGuide} />

      {/* 1. Main Balance Hero Card (Banner disimpan langsung di sini sesuai permintaan) */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-5 text-white shadow-xl transition-all duration-500 min-h-[220px] flex flex-col justify-between border border-slate-800/80">
        {/* Banner Background Image (bila ada banner aktif) */}
        {activeBanner ? (
          <>
            <img
              src={activeBanner.imageUrl}
              alt={activeBanner.title}
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 opacity-60 scale-100 hover:scale-105"
            />
            {/* Dark gradient overlay for text readability & professional appearance */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/70" />
            <div className="absolute inset-0 bg-emerald-950/30 mix-blend-overlay" />
          </>
        ) : (
          <>
            {/* Default gradient when no banner uploaded yet */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950" />
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />
            <div className="absolute -left-8 -bottom-8 h-40 w-40 rounded-full bg-teal-500/15 blur-2xl pointer-events-none" />
          </>
        )}

        {/* Content of the Hero Card */}
        <div className="relative z-10 flex flex-col justify-between h-full">
          {/* Top Bar: Title, profile badge, and button to update banner in Settings */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md shadow-xs">
                <Wallet className="h-4.5 w-4.5 text-emerald-400" />
              </div>
              <div>
                <span className="text-xs font-semibold tracking-wider uppercase text-emerald-300">
                  SALDO SAAT INI
                </span>
                {activeBanner && (
                  <span className="block text-[10px] text-amber-300 font-bold truncate max-w-[150px] sm:max-w-[220px]">
                    ★ {activeBanner.title}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Tombol Update Banner dari Menu Setting */}
              <button
                onClick={() => onNavigateTab('settings')}
                title="Update Banner dari Menu Setting"
                className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-200 bg-black/50 hover:bg-black/70 border border-white/20 px-2.5 py-1 rounded-full backdrop-blur-md transition active:scale-95 shadow-xs"
              >
                <Camera className="w-3 h-3 text-emerald-300" />
                <span>{activeBanner ? 'Update Banner' : 'Pasang Banner'}</span>
              </button>

              <span className="hidden sm:inline-block text-[11px] text-slate-300 font-medium bg-white/10 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                {profile.name || 'Buku Kas Pro'}
              </span>
            </div>
          </div>

          {/* Banner Subtitle / Promo Tagline */}
          {activeBanner?.subtitle && (
            <div className="my-1">
              <span className="inline-block text-[11px] text-emerald-200 font-medium bg-black/40 backdrop-blur-xs px-2.5 py-0.5 rounded-lg border border-white/10 shadow-xs line-clamp-1">
                ✨ {activeBanner.subtitle}
              </span>
            </div>
          )}

          {/* Big Balance Number */}
          <div className="my-2">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight tabular-nums text-white drop-shadow-sm">
              {formatRupiah(balance)}
            </h2>

            <div className="flex items-center justify-between mt-1">
              <p className="text-[11px] text-slate-300 flex items-center gap-1.5 drop-shadow-xs">
                <span>Status Saldo:</span>
                <span
                  className={`font-semibold ${
                    balance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {balance >= 0 ? 'Surplus / Positif' : 'Defisit / Minus'}
                </span>
              </p>

              {/* Multiple Banners Indicator Dots */}
              {banners.length > 1 && (
                <div className="flex items-center gap-1">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveBannerIdx(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === activeBannerIdx ? 'w-4 bg-emerald-400' : 'w-1.5 bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Action CTA inside Hero */}
          <div className="mt-3.5 grid grid-cols-2 gap-2.5 pt-3 border-t border-white/15">
            <button
              onClick={() => onOpenAddModal('IN')}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 py-2.5 px-3 text-xs font-bold text-white shadow-sm active:scale-98 transition backdrop-blur-xs"
            >
              <ArrowDownLeft className="h-4 w-4" />
              <span>Kas Masuk</span>
            </button>
            <button
              onClick={() => onOpenAddModal('OUT')}
              className="flex items-center justify-center gap-2 rounded-xl bg-rose-600/90 hover:bg-rose-500 py-2.5 px-3 text-xs font-bold text-white shadow-sm active:scale-98 transition backdrop-blur-xs"
            >
              <ArrowUpRight className="h-4 w-4" />
              <span>Kas Keluar</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metric Stat Cards Grid */}
      <div className="grid grid-cols-3 gap-2">
        {/* Kas Masuk */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 mb-1">
            <ArrowDownLeft className="h-3.5 w-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-tight">KAS MASUK</span>
          </div>
          <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white tabular-nums truncate">
            {formatRupiah(totalIn)}
          </p>
          <p className="text-[9px] text-slate-400 mt-0.5 truncate">Total penerimaan</p>
        </div>

        {/* Kas Keluar */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
          <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 mb-1">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-tight">KAS KELUAR</span>
          </div>
          <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white tabular-nums truncate">
            {formatRupiah(totalOut)}
          </p>
          <p className="text-[9px] text-slate-400 mt-0.5 truncate">Total pengeluaran</p>
        </div>

        {/* Total Transaksi */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
          <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 mb-1">
            <Receipt className="h-3.5 w-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-tight">TRANSAKSI</span>
          </div>
          <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white tabular-nums">
            {count}
          </p>
          <p className="text-[9px] text-slate-400 mt-0.5 truncate">Data tercatat</p>
        </div>
      </div>

      {/* 3. Sub-Stats: Hari Ini & Bulan Ini */}
      <div className="grid grid-cols-2 gap-2">
        {/* Hari Ini */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-slate-400" /> Hari Ini
            </span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">Masuk</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                +{formatRupiah(periodStats.inToday, false)}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">Keluar</span>
              <span className="font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                -{formatRupiah(periodStats.outToday, false)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Net</span>
              <span
                className={`font-extrabold tabular-nums ${
                  periodStats.balanceToday >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {formatRupiah(periodStats.balanceToday)}
              </span>
            </div>
          </div>
        </div>

        {/* Bulan Ini */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-slate-400" /> Bulan Ini
            </span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">Masuk</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                +{formatRupiah(periodStats.inThisMonth, false)}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">Keluar</span>
              <span className="font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                -{formatRupiah(periodStats.outThisMonth, false)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Net</span>
              <span
                className={`font-extrabold tabular-nums ${
                  periodStats.balanceThisMonth >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {formatRupiah(periodStats.balanceThisMonth)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Interactive Finance Charts */}
      <FinanceCharts transactions={transactions} />

      {/* 5. Quick Shortcut Actions Grid */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => onOpenAddModal('IN')}
          className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-slate-200/80 bg-white p-2.5 text-center shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 transition"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <PlusCircle className="h-5 w-5" />
          </div>
          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
            Kas Masuk
          </span>
        </button>

        <button
          onClick={() => onOpenAddModal('OUT')}
          className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-slate-200/80 bg-white p-2.5 text-center shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 transition"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
            <MinusCircle className="h-5 w-5" />
          </div>
          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
            Kas Keluar
          </span>
        </button>

        <button
          onClick={onOpenWhatsAppModal}
          className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-slate-200/80 bg-white p-2.5 text-center shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 transition"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
            <MessageSquare className="h-5 w-5" />
          </div>
          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
            Kirim WA
          </span>
        </button>

        <button
          onClick={onOpenBannerModal}
          className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-slate-200/80 bg-white p-2.5 text-center shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 transition"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
            <Layers className="h-5 w-5" />
          </div>
          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
            Banner
          </span>
        </button>
      </div>

      {/* 6. Recent Transactions List */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Transaksi Terkini
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {recentTransactions.length > 0
                ? `${recentTransactions.length} catatan kas terakhir`
                : 'Belum ada transaksi'}
            </p>
          </div>
          {transactions.length > 0 && (
            <button
              onClick={() => onNavigateTab('transactions')}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-8 text-center text-slate-400 dark:text-slate-600">
            <Receipt className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Belum ada transaksi di buku kas Anda
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Mulai catat pemasukan atau pengeluaran pertama dengan menekan tombol di bawah.
            </p>
            <button
              onClick={() => onOpenAddModal('IN')}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Transaksi Pertama</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentTransactions.map((tx) => {
              const isMasuk = tx.type === 'IN';
              return (
                <div
                  key={tx.id}
                  onClick={() => onOpenDetailModal(tx)}
                  className="flex items-center justify-between py-3 cursor-pointer hover:bg-slate-50/80 -mx-2 px-2 rounded-xl transition dark:hover:bg-slate-800/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold ${
                        isMasuk
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                      }`}
                    >
                      {isMasuk ? (
                        <ArrowDownLeft className="h-5 w-5" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {tx.category}
                        </span>
                        {tx.receiptImage && (
                          <span title="Ada Foto Nota">
                            <Camera className="h-3 w-3 text-slate-400 shrink-0" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {tx.sourceOrTarget}
                        {tx.description && ` · ${tx.description}`}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <p
                      className={`text-xs font-bold tabular-nums ${
                        isMasuk
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isMasuk ? '+' : '-'} {formatRupiah(tx.amount, false)}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {formatIndonesianDate(tx.date, { short: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
