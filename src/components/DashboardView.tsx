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

      {/* 1. DEDICATED PROMINENT BANNER SECTION (Jelas, Tajam, 100% Terlihat & Responsif di Android) */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all">
        {activeBanner ? (
          <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full overflow-hidden bg-slate-950 group">
            {/* 100% Clear, full-color, sharp banner image */}
            <img
              src={activeBanner.imageUrl}
              alt={activeBanner.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Subtle bottom gradient only for title readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-between p-3.5 sm:p-4 text-white">
              {/* Top Banner Control: Title tag & edit button */}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md border border-white/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Banner Toko
                </span>

                <button
                  type="button"
                  onClick={onOpenBannerModal}
                  className="flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-black/80 backdrop-blur-md border border-white/20 transition active:scale-95 shadow-sm"
                  title="Ganti atau Tambah Banner"
                >
                  <Camera className="w-3 h-3 text-emerald-300" />
                  <span>Ganti Foto</span>
                </button>
              </div>

              {/* Bottom Info: Title & Subtitle */}
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-white drop-shadow-md truncate">
                  {activeBanner.title || profile.name || 'Banner Usaha'}
                </h3>
                {activeBanner.subtitle && (
                  <p className="text-[10px] sm:text-xs text-slate-200 drop-shadow line-clamp-1 mt-0.5">
                    {activeBanner.subtitle}
                  </p>
                )}

                {/* Multiple Banners Indicator Dots */}
                {banners.length > 1 && (
                  <div className="flex items-center gap-1.5 mt-2">
                    {banners.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveBannerIdx(idx);
                        }}
                        className={`h-1.5 rounded-full transition-all ${
                          idx === activeBannerIdx ? 'w-5 bg-emerald-400' : 'w-1.5 bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Empty Banner Placeholder: Attractive & 1-Click Setup */
          <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full overflow-hidden bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-4 flex flex-col justify-between text-white">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 backdrop-blur-md">
                <Layers className="w-3 h-3" />
                Banner Toko Belum Ada
              </span>
              <span className="text-[10px] font-medium text-slate-300">
                {profile.name || 'Toko Anda'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5">
              <div>
                <p className="text-xs sm:text-sm font-extrabold text-white">
                  Perbagus Beranda dengan Banner Usaha Anda
                </p>
                <p className="text-[10px] text-emerald-200 mt-0.5">
                  Unggah foto produk, etalase toko, atau promo spesial di sini
                </p>
              </div>

              <button
                type="button"
                onClick={onOpenBannerModal}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-3.5 py-1.5 text-xs font-bold text-white shadow-md active:scale-95 transition shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Pasang Banner Sekarang</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. MAIN BALANCE HERO CARD (Desain Bersih, Elegan & Nyaman di Android) */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 p-5 text-white shadow-lg border border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
              <Wallet className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-emerald-400">
                SALDO KAS SAAT INI
              </span>
              <p className="text-[11px] text-slate-300 font-medium">
                {profile.name || 'Buku Kas Pro'}
              </p>
            </div>
          </div>

          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
              balance >= 0
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            {balance >= 0 ? 'Surplus / Aman' : 'Defisit / Minus'}
          </span>
        </div>

        {/* Big Balance Digits */}
        <div className="my-3">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight tabular-nums text-white">
            {formatRupiah(balance)}
          </h2>
          <p className="text-[10px] text-slate-400 mt-1">
            Total penerimaan dikurangi seluruh pengeluaran tercatat
          </p>
        </div>

        {/* 2 Big Action Buttons on Android (Thumb-friendly) */}
        <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-white/10">
          <button
            onClick={() => onOpenAddModal('IN')}
            className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 py-3 px-3 text-xs sm:text-sm font-bold text-white shadow-md active:scale-95 transition"
          >
            <ArrowDownLeft className="h-4 w-4" />
            <span>+ Kas Masuk</span>
          </button>
          <button
            onClick={() => onOpenAddModal('OUT')}
            className="flex items-center justify-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-500 py-3 px-3 text-xs sm:text-sm font-bold text-white shadow-md active:scale-95 transition"
          >
            <ArrowUpRight className="h-4 w-4" />
            <span>- Kas Keluar</span>
          </button>
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
