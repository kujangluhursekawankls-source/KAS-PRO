import React, { useState } from 'react';
import { Transaction, BusinessProfile } from '../types';
import { formatIndonesianDate, formatRupiah } from '../utils/formatters';
import {
  X,
  Printer,
  Share2,
  Edit2,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  profile: BusinessProfile;
  confirmDeleteEnabled: boolean;
  onClose: () => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  profile,
  confirmDeleteEnabled,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState(false);

  if (!transaction) return null;

  const isMasuk = transaction.type === 'IN';

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `*BUKTI KAS ${isMasuk ? 'MASUK' : 'KELUAR'}*\n` +
      `*${profile.name || 'Buku Kas Pro'}*\n` +
      `--------------------------------\n` +
      `No: ${transaction.transactionNumber}\n` +
      `Tanggal: ${formatIndonesianDate(transaction.date)} (${transaction.time || '-'})\n` +
      `Kategori: ${transaction.category}\n` +
      `${isMasuk ? 'Dari' : 'Kepada'}: ${transaction.sourceOrTarget}\n` +
      `Jumlah: *${formatRupiah(transaction.amount)}*\n` +
      `Keterangan: ${transaction.description || '-'}\n` +
      `--------------------------------\n` +
      `_Dibuat dengan Buku Kas Pro - Jamhur_`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleDeleteClick = () => {
    if (confirmDeleteEnabled) {
      setShowDeleteConfirm(true);
    } else {
      onDelete(transaction.id);
      onClose();
    }
  };

  const handleConfirmDelete = () => {
    onDelete(transaction.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs transition-opacity overflow-y-auto">
        <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col">
          {/* Top Bar inside modal */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Struk Digital
            </span>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Receipt Body (printable area) */}
          <div className="my-3 space-y-4">
            {/* Business Header */}
            <div className="text-center pt-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {profile.name || 'BUKU KAS PRO'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {profile.address || 'Laporan Bukti Pembayaran'}
              </p>
              {profile.whatsapp && (
                <p className="text-[10px] text-slate-400">WA: {profile.whatsapp}</p>
              )}
              <div className="my-2 border-b border-dashed border-slate-300 dark:border-slate-700" />
            </div>

            {/* Type & Amount badge */}
            <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 py-3 px-4 dark:bg-slate-800/60">
              <div className="flex items-center gap-1.5 mb-1">
                {isMasuk ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <ArrowDownLeft className="h-4 w-4" /> KAS MASUK
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                    <ArrowUpRight className="h-4 w-4" /> KAS KELUAR
                  </span>
                )}
              </div>
              <p
                className={`text-2xl font-black tabular-nums tracking-tight ${
                  isMasuk ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {formatRupiah(transaction.amount)}
              </p>
            </div>

            {/* Key-Value Details */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">No. Transaksi</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {transaction.transactionNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Tanggal & Waktu</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {formatIndonesianDate(transaction.date, { withDay: true })}{' '}
                  {transaction.time && `· ${transaction.time}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Kategori</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {transaction.category}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  {isMasuk ? 'Sumber Dana' : 'Tujuan Dana'}
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {transaction.sourceOrTarget}
                </span>
              </div>
              {transaction.description && (
                <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Keterangan:</span>
                  <p className="text-slate-800 dark:text-slate-200 font-normal leading-relaxed">
                    {transaction.description}
                  </p>
                </div>
              )}
            </div>

            {/* Proof of Transaction Image Thumbnail */}
            {transaction.receiptImage && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1.5">
                  Foto Bukti Nota:
                </span>
                <button
                  type="button"
                  onClick={() => setEnlargedImage(true)}
                  className="group relative w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 active:scale-98 transition"
                >
                  <img
                    src={transaction.receiptImage}
                    alt="Bukti Struk"
                    className="h-32 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium">
                    Ketuk untuk memperbesar
                  </div>
                </button>
              </div>
            )}

            <div className="text-center pt-2">
              <div className="border-b border-dashed border-slate-300 dark:border-slate-700 mb-2" />
              <p className="text-[10px] text-slate-400">
                Buku Kas Pro · Created By Jamhur (08179015181)
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handlePrint}
              className="flex flex-col items-center justify-center gap-1 rounded-xl bg-slate-100 py-2.5 text-[11px] font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
              title="Cetak Struk"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak</span>
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="flex flex-col items-center justify-center gap-1 rounded-xl bg-emerald-50 py-2.5 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 transition"
              title="Bagikan ke WhatsApp"
            >
              <MessageSquare className="h-4 w-4" />
              <span>WA</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(transaction);
              }}
              className="flex flex-col items-center justify-center gap-1 rounded-xl bg-blue-50 py-2.5 text-[11px] font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300 transition"
              title="Edit Transaksi"
            >
              <Edit2 className="h-4 w-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={handleDeleteClick}
              className="flex flex-col items-center justify-center gap-1 rounded-xl bg-rose-50 py-2.5 text-[11px] font-medium text-rose-700 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-300 transition"
              title="Hapus Transaksi"
            >
              <Trash2 className="h-4 w-4" />
              <span>Hapus</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enlarged Image Viewer */}
      {enlargedImage && transaction.receiptImage && (
        <div
          onClick={() => setEnlargedImage(false)}
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md cursor-pointer"
        >
          <div className="relative max-w-xl max-h-[90vh]">
            <img
              src={transaction.receiptImage}
              alt="Bukti Nota Besar"
              className="max-h-[85vh] w-auto rounded-2xl object-contain shadow-2xl"
            />
            <p className="text-center text-xs text-white/70 mt-2">
              Ketuk di mana saja untuk menutup
            </p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xs rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 mb-3">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Hapus Transaksi?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Transaksi <strong>{transaction.transactionNumber}</strong> sebesar{' '}
              <strong>{formatRupiah(transaction.amount)}</strong> akan dihapus permanen dari buku kas.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow hover:bg-rose-700 active:scale-95"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
