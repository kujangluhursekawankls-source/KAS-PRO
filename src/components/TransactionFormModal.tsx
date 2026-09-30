import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, Category } from '../types';
import {
  formatRupiah,
  parseRupiahInput,
  getTodayDateString,
  getCurrentTimeString,
  generateTransactionNumber,
} from '../utils/formatters';
import {
  X,
  Camera,
  Image as ImageIcon,
  AlertTriangle,
  Check,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
} from 'lucide-react';

interface TransactionFormModalProps {
  isOpen: boolean;
  type: TransactionType;
  editingTransaction?: Transaction | null;
  categories: Category[];
  currentBalance: number;
  existingCount: number;
  warnNegativeBalance: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>, editId?: string) => void;
  onAddCategory: (category: Omit<Category, 'id'>) => void;
}

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  type: initialType,
  editingTransaction,
  categories,
  currentBalance,
  existingCount,
  warnNegativeBalance,
  onClose,
  onSave,
  onAddCategory,
}) => {
  const [txType, setTxType] = useState<TransactionType>(initialType);
  const [date, setDate] = useState(getTodayDateString());
  const [time, setTime] = useState(getCurrentTimeString());
  const [category, setCategory] = useState('');
  const [sourceOrTarget, setSourceOrTarget] = useState('');
  const [amountRaw, setAmountRaw] = useState('');
  const [description, setDescription] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [txNumber, setTxNumber] = useState('');

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNegativeWarning, setShowNegativeWarning] = useState(false);
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Filter categories matching current transaction type
  const activeCategories = categories.filter((c) => c.type === txType);

  useEffect(() => {
    if (editingTransaction) {
      setTxType(editingTransaction.type);
      setDate(editingTransaction.date);
      setTime(editingTransaction.time || getCurrentTimeString());
      setCategory(editingTransaction.category);
      setSourceOrTarget(editingTransaction.sourceOrTarget);
      setAmountRaw(String(editingTransaction.amount));
      setDescription(editingTransaction.description || '');
      setReceiptImage(editingTransaction.receiptImage || null);
      setTxNumber(editingTransaction.transactionNumber);
    } else {
      setTxType(initialType);
      const today = getTodayDateString();
      setDate(today);
      setTime(getCurrentTimeString());
      const firstCat = categories.find((c) => c.type === initialType);
      setCategory(firstCat ? firstCat.name : '');
      setSourceOrTarget('');
      setAmountRaw('');
      setDescription('');
      setReceiptImage(null);
      setTxNumber(generateTransactionNumber(initialType, today, existingCount + 1));
    }
    setShowNegativeWarning(false);
  }, [isOpen, editingTransaction, initialType, existingCount, categories]);

  // Update tx number if type or date changes when creating new
  const handleTypeChange = (newType: TransactionType) => {
    setTxType(newType);
    const cat = categories.find((c) => c.type === newType);
    setCategory(cat ? cat.name : '');
    if (!editingTransaction) {
      setTxNumber(generateTransactionNumber(newType, date, existingCount + 1));
    }
  };

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    if (!editingTransaction) {
      setTxNumber(generateTransactionNumber(txType, newDate, existingCount + 1));
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    setAmountRaw(rawVal);
  };

  const handleQuickAddAmount = (addValue: number) => {
    const current = parseRupiahInput(amountRaw);
    setAmountRaw(String(current + addValue));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read and compress image
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 900;
        const MAX_HEIGHT = 900;
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
          const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
          setReceiptImage(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAddNewCategory = () => {
    if (!newCatName.trim()) return;
    onAddCategory({
      name: newCatName.trim(),
      type: txType,
      color: txType === 'IN' ? '#10b981' : '#ef4444',
      isDefault: false,
    });
    setCategory(newCatName.trim());
    setNewCatName('');
    setShowNewCatInput(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const amount = parseRupiahInput(amountRaw) || 0;

    // Otomatis tentukan kategori bila pengguna tidak memilih
    const finalCategory =
      category ||
      (txType === 'IN'
        ? categories.find((c) => c.type === 'IN')?.name || 'Pemasukan Kas'
        : categories.find((c) => c.type === 'OUT')?.name || 'Pengeluaran Kas');

    const finalDate = date || getTodayDateString();
    const finalTime = time || getCurrentTimeString();
    const finalSource =
      sourceOrTarget.trim() ||
      (txType === 'IN' ? 'Kas Tunai Toko' : 'Pengeluaran Toko');
    const finalDescription =
      description.trim() ||
      (txType === 'IN' ? 'Catatan Kas Masuk' : 'Catatan Kas Keluar');

    setIsSubmitting(true);

    onSave(
      {
        transactionNumber: txNumber,
        type: txType,
        date: finalDate,
        time: finalTime,
        category: finalCategory,
        sourceOrTarget: finalSource,
        amount,
        description: finalDescription,
        receiptImage: receiptImage || null,
      },
      editingTransaction?.id
    );

    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 150);
  };

  if (!isOpen) return null;

  const currentAmountNum = parseRupiahInput(amountRaw);
  const isMasuk = txType === 'IN';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 p-0 sm:p-4 backdrop-blur-xs transition-opacity overflow-y-auto">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white shadow-sm ${
                isMasuk ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            >
              {isMasuk ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editingTransaction
                  ? 'Edit Transaksi'
                  : isMasuk
                  ? 'Catat Kas Masuk'
                  : 'Catat Kas Keluar'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {txNumber}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Segmented Type Switcher (only for new transactions) */}
          {!editingTransaction && (
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => handleTypeChange('IN')}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition active:scale-98 ${
                  isMasuk
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <ArrowDownLeft className="h-4 w-4" />
                <span>Kas Masuk (+)</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('OUT')}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition active:scale-98 ${
                  !isMasuk
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <ArrowUpRight className="h-4 w-4" />
                <span>Kas Keluar (-)</span>
              </button>
            </div>
          )}

          {/* Amount Input with Live Rupiah Display */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/50">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Nominal Transaksi (Rp) *
            </label>
            <div className="relative flex items-center">
              <span className="text-xl font-bold text-slate-400 pl-2">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={amountRaw ? new Intl.NumberFormat('id-ID').format(parseRupiahInput(amountRaw)) : ''}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full bg-transparent pl-3 pr-2 py-1 text-2xl font-extrabold text-slate-900 placeholder:text-slate-300 focus:outline-none dark:text-white tabular-nums"
                autoFocus={!editingTransaction}
              />
            </div>

            {/* Quick Amount Suggestion Chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-200/70 dark:border-slate-700/60">
              {[50000, 100000, 250000, 500000, 1000000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickAddAmount(amt)}
                  className="rounded-lg bg-white px-2 py-1 text-[11px] font-medium text-slate-700 shadow-2xs hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition"
                >
                  +{formatRupiah(amt, false)}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Tanggal
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Waktu
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Kategori Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Kategori *
              </label>
              <button
                type="button"
                onClick={() => setShowNewCatInput((prev) => !prev)}
                className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
              >
                <Plus className="h-3 w-3" />
                <span>Kategori Baru</span>
              </button>
            </div>

            {/* Inline add new category */}
            {showNewCatInput && (
              <div className="flex items-center gap-2 mb-2 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <input
                  type="text"
                  placeholder="Nama kategori baru..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 bg-transparent text-xs text-slate-800 dark:text-white focus:outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNewCategory())}
                />
                <button
                  type="button"
                  onClick={handleAddNewCategory}
                  className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Tambah
                </button>
              </div>
            )}

            {/* Category pills list */}
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 border border-slate-200 rounded-xl dark:border-slate-700">
              {activeCategories.map((c) => {
                const isSelected = category === c.name;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.name)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      isSelected
                        ? isMasuk
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sumber Dana / Tujuan Pengeluaran */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              {isMasuk ? 'Sumber Dana (Diterima Dari)' : 'Tujuan Pengeluaran (Dibayarkan Ke)'}
            </label>
            <input
              type="text"
              value={sourceOrTarget}
              onChange={(e) => setSourceOrTarget(e.target.value)}
              placeholder={
                isMasuk
                  ? 'Contoh: Pelanggan Warung, Transfer BCA, QRIS'
                  : 'Contoh: Supplier Grosir, Token Listrik PLN, Gaji'
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Keterangan / Catatan (Opsional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Rincian barang atau keperluan transaksi..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* Foto Bukti Transaksi */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Foto Bukti Transaksi / Nota (Opsional)
            </label>
            {receiptImage ? (
              <div className="relative inline-block">
                <img
                  src={receiptImage}
                  alt="Bukti Transaksi"
                  className="h-28 w-28 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setReceiptImage(null)}
                  className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white shadow hover:bg-rose-700"
                  title="Hapus Foto"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 p-3 text-xs text-slate-500 hover:border-emerald-500 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-emerald-400">
                <Camera className="h-4 w-4" />
                <span>Ambil / Unggah Foto Struk</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Negative Balance Warning Box */}
          {showNegativeWarning && (
            <div className="rounded-xl bg-amber-50 p-3.5 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Peringatan: Saldo Kas Tidak Mencukupi</p>
                  <p className="mt-0.5">
                    Pengeluaran sebesar <strong>{formatRupiah(currentAmountNum)}</strong> melebihi
                    sisa saldo kas saat ini (<strong>{formatRupiah(currentBalance)}</strong>). Saldo
                    kas akan menjadi negatif (minus).
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowNegativeWarning(false)}
                  className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 font-medium text-amber-800 dark:bg-amber-900/60 dark:text-amber-200"
                >
                  Ubah Nominal
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 font-bold text-white shadow-xs"
                >
                  Tetap Simpan
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Modal Footer */}
        <div className="border-t border-slate-100 p-4 dark:border-slate-800 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isSubmitting || currentAmountNum <= 0}
            onClick={() => handleSubmit()}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold text-white shadow-md active:scale-98 transition disabled:opacity-50 disabled:pointer-events-none ${
              isMasuk ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
            }`}
          >
            <Check className="h-4 w-4" />
            <span>{editingTransaction ? 'Simpan Perubahan' : 'Simpan Transaksi'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
