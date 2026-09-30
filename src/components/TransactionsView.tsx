import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, Category } from '../types';
import { formatIndonesianDate, formatRupiah } from '../utils/formatters';
import {
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Camera,
  Calendar,
  SlidersHorizontal,
  X,
  Plus,
  Receipt,
} from 'lucide-react';

interface TransactionsViewProps {
  transactions: Transaction[];
  categories: Category[];
  onOpenAddModal: (type: TransactionType) => void;
  onOpenDetailModal: (transaction: Transaction) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  categories,
  onOpenAddModal,
  onOpenDetailModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);

  // Filter & Sort Pipeline
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Type filter
        if (typeFilter !== 'ALL' && tx.type !== typeFilter) return false;

        // Category filter
        if (selectedCategory !== 'ALL' && tx.category !== selectedCategory) return false;

        // Date filter
        if (dateFilter && tx.date !== dateFilter) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchNumber = tx.transactionNumber.toLowerCase().includes(q);
          const matchCategory = tx.category.toLowerCase().includes(q);
          const matchSource = (tx.sourceOrTarget || '').toLowerCase().includes(q);
          const matchDesc = (tx.description || '').toLowerCase().includes(q);
          const matchAmount = String(tx.amount).includes(q);
          if (!matchNumber && !matchCategory && !matchSource && !matchDesc && !matchAmount) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          const da = `${a.date} ${a.time || '00:00'}`;
          const db = `${b.date} ${b.time || '00:00'}`;
          return db.localeCompare(da);
        } else if (sortBy === 'oldest') {
          const da = `${a.date} ${a.time || '00:00'}`;
          const db = `${b.date} ${b.time || '00:00'}`;
          return da.localeCompare(db);
        } else if (sortBy === 'highest') {
          return b.amount - a.amount;
        } else {
          return a.amount - b.amount;
        }
      });
  }, [transactions, typeFilter, selectedCategory, dateFilter, searchQuery, sortBy]);

  // Aggregate stats for filtered list
  const filteredTotalIn = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'IN')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const filteredTotalOut = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'OUT')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const resetFilters = () => {
    setSearchQuery('');
    setTypeFilter('ALL');
    setSelectedCategory('ALL');
    setDateFilter('');
    setSortBy('newest');
  };

  const hasActiveFilters =
    searchQuery || typeFilter !== 'ALL' || selectedCategory !== 'ALL' || dateFilter;

  return (
    <div className="space-y-3.5 pb-24">
      {/* Top Search & Filter Bar */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari transaksi, kategori, atau no..."
              className="w-full rounded-xl bg-slate-100 py-2.5 pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-700/80 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowAdvancedFilter((prev) => !prev)}
            className={`flex h-10 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition active:scale-95 ${
              showAdvancedFilter || hasActiveFilters
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
            title="Filter & Urutkan"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </div>

        {/* Primary Type Tabs */}
        <div className="grid grid-cols-3 gap-1.5 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setTypeFilter('ALL')}
            className={`rounded-lg py-2 text-xs font-semibold transition ${
              typeFilter === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-slate-700'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            Semua ({transactions.length})
          </button>
          <button
            onClick={() => setTypeFilter('IN')}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
              typeFilter === 'IN'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400'
            }`}
          >
            <ArrowDownLeft className="h-3.5 w-3.5" />
            <span>Kas Masuk</span>
          </button>
          <button
            onClick={() => setTypeFilter('OUT')}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
              typeFilter === 'OUT'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400'
            }`}
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>Kas Keluar</span>
          </button>
        </div>

        {/* Collapsible Advanced Filters (Category, Date, Sort) */}
        {showAdvancedFilter && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            {/* Category Select */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Kategori
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="ALL">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.type === 'IN' ? '🟢' : '🔴'} {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Pilih Tanggal
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Sort by */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Urutkan
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="newest">Terbaru (Default)</option>
                <option value="oldest">Terlama</option>
                <option value="highest">Nominal Terbesar</option>
                <option value="lowest">Nominal Terkecil</option>
              </select>
            </div>

            {hasActiveFilters && (
              <div className="sm:col-span-3 flex justify-end pt-1">
                <button
                  onClick={resetFilters}
                  className="text-xs text-rose-600 hover:underline dark:text-rose-400 font-medium"
                >
                  Reset Semua Filter
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filtered Sub-Total Summary Bar */}
      <div className="flex items-center justify-between rounded-xl bg-slate-200/60 px-3.5 py-2 text-xs dark:bg-slate-800/60">
        <span className="text-slate-600 dark:text-slate-400 font-medium">
          Ditemukan <strong>{filteredTransactions.length}</strong> transaksi
        </span>
        <div className="flex items-center gap-3 tabular-nums font-semibold">
          {typeFilter !== 'OUT' && (
            <span className="text-emerald-600 dark:text-emerald-400">
              +{formatRupiah(filteredTotalIn, false)}
            </span>
          )}
          {typeFilter !== 'IN' && (
            <span className="text-rose-600 dark:text-rose-400">
              -{formatRupiah(filteredTotalOut, false)}
            </span>
          )}
        </div>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-8 text-center shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <Receipt className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-2" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            Tidak ada transaksi
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            {hasActiveFilters
              ? 'Tidak ada transaksi yang cocok dengan kata kunci atau filter yang Anda pilih.'
              : 'Belum ada transaksi di buku kas Anda. Mulai catat sekarang!'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            {hasActiveFilters ? (
              <button
                onClick={resetFilters}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
              >
                Hapus Filter
              </button>
            ) : (
              <button
                onClick={() => onOpenAddModal('IN')}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500"
              >
                <Plus className="h-4 w-4" />
                <span>Catat Transaksi</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTransactions.map((tx) => {
            const isMasuk = tx.type === 'IN';
            return (
              <div
                key={tx.id}
                onClick={() => onOpenDetailModal(tx)}
                className="group flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs active:scale-99 cursor-pointer dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Indicator Icon */}
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold transition-transform group-hover:scale-105 ${
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

                  {/* Title & Metadata */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {tx.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 truncate">
                        {tx.transactionNumber}
                      </span>
                      {tx.receiptImage && (
                        <div
                          className="flex items-center text-[10px] text-emerald-600 dark:text-emerald-400"
                          title="Lampiran Nota Tersedia"
                        >
                          <Camera className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {tx.sourceOrTarget}
                      {tx.description && ` · ${tx.description}`}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {formatIndonesianDate(tx.date, { short: true })}{' '}
                      {tx.time && `· ${tx.time}`}
                    </p>
                  </div>
                </div>

                {/* Amount in Tabular Numbers */}
                <div className="text-right shrink-0 pl-2">
                  <p
                    className={`text-sm font-black tabular-nums ${
                      isMasuk
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isMasuk ? '+' : '-'} {formatRupiah(tx.amount, false)}
                  </p>
                  <span
                    className={`text-[10px] font-medium ${
                      isMasuk
                        ? 'text-emerald-600/80 dark:text-emerald-400/80'
                        : 'text-rose-600/80 dark:text-rose-400/80'
                    }`}
                  >
                    {isMasuk ? 'Kas Masuk' : 'Kas Keluar'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
