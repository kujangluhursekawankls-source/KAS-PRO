import React, { useState, useEffect } from 'react';
import { Transaction, BusinessProfile } from '../types';
import { formatIndonesianDate, formatRupiah, getTodayDateString } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import {
  X,
  MessageSquare,
  Send,
  FileSpreadsheet,
  Receipt,
  Store,
  Check,
  Copy,
} from 'lucide-react';

interface WhatsAppSenderModalProps {
  isOpen: boolean;
  profile: BusinessProfile;
  transactions: Transaction[];
  selectedTransaction?: Transaction | null;
  onClose: () => void;
}

type MessageTemplateType = 'report' | 'invoice' | 'store_info' | 'custom';

export const WhatsAppSenderModal: React.FC<WhatsAppSenderModalProps> = ({
  isOpen,
  profile,
  transactions,
  selectedTransaction,
  onClose,
}) => {
  const toast = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [templateType, setTemplateType] = useState<MessageTemplateType>(
    selectedTransaction ? 'invoice' : 'report'
  );
  const [message, setMessage] = useState('');

  // Calculate totals for report
  const totalIn = transactions.filter((t) => t.type === 'IN').reduce((acc, t) => acc + t.amount, 0);
  const totalOut = transactions.filter((t) => t.type === 'OUT').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIn - totalOut;

  // Generate template message
  useEffect(() => {
    if (templateType === 'report') {
      const today = getTodayDateString();
      const text =
        `*LAPORAN KAS BUKU KAS PRO*\n` +
        `*${profile.name || 'Buku Kas Usaha'}*\n` +
        `Tanggal: ${formatIndonesianDate(today, { withDay: true })}\n` +
        `--------------------------------\n` +
        `📥 Total Kas Masuk : *${formatRupiah(totalIn)}*\n` +
        `📤 Total Kas Keluar: *${formatRupiah(totalOut)}*\n` +
        `💰 Saldo Kas Akhir : *${formatRupiah(balance)}*\n` +
        `📊 Jumlah Transaksi: ${transactions.length}\n` +
        `--------------------------------\n` +
        `Alamat: ${profile.address || '-'}\n` +
        `Kontak: ${profile.whatsapp || '08179015181'}\n` +
        `_Laporan dikirim otomatis melalui Buku Kas Pro_`;
      setMessage(text);
    } else if (templateType === 'invoice') {
      if (selectedTransaction) {
        const isMasuk = selectedTransaction.type === 'IN';
        const text =
          `*BUKTI TRANSAKSI KAS ${isMasuk ? 'MASUK' : 'KELUAR'}*\n` +
          `*${profile.name || 'Buku Kas Pro'}*\n` +
          `--------------------------------\n` +
          `No. Bukti : *${selectedTransaction.transactionNumber}*\n` +
          `Tanggal   : ${formatIndonesianDate(selectedTransaction.date)} ${selectedTransaction.time ? '· ' + selectedTransaction.time : ''}\n` +
          `Kategori  : ${selectedTransaction.category}\n` +
          `${isMasuk ? 'Diterima Dari' : 'Dibayarkan Ke'} : ${selectedTransaction.sourceOrTarget}\n` +
          `Nominal   : *${formatRupiah(selectedTransaction.amount)}*\n` +
          `Keterangan: ${selectedTransaction.description || '-'}\n` +
          `--------------------------------\n` +
          `Status: *LUNAS / BERHASIL TERCATAT*\n` +
          `Terima kasih telah bertransaksi dengan kami.\n` +
          `_${profile.name || 'Buku Kas Pro'} · ${profile.whatsapp || '08179015181'}_`;
        setMessage(text);
      } else {
        const text =
          `*TAGIHAN / INVOICE USAHA*\n` +
          `*${profile.name || 'Buku Kas Pro'}*\n` +
          `--------------------------------\n` +
          `Kepada Yth: Pelanggan Setia\n` +
          `Jumlah Tagihan: *Rp 0*\n` +
          `Mohon melakukan pembayaran sesuai kesepakatan.\n` +
          `Terima kasih.\n` +
          `_Kontak: ${profile.whatsapp || '08179015181'}_`;
        setMessage(text);
      }
    } else if (templateType === 'store_info') {
      const text =
        `*INFORMASI RESMI USAHA*\n` +
        `*${profile.name || 'Buku Kas Pro'}*\n` +
        `--------------------------------\n` +
        `Pemilik : ${profile.owner || '-'}\n` +
        `Alamat  : ${profile.address || '-'}\n` +
        `WhatsApp: ${profile.whatsapp || '08179015181'}\n` +
        `Email   : ${profile.email || '-'}\n` +
        `Catatan : ${profile.notes || 'Catat Keuangan Lebih Mudah'}\n` +
        `--------------------------------\n` +
        `_Didukung oleh Buku Kas Pro - Created By Jamhur_`;
      setMessage(text);
    }
  }, [templateType, selectedTransaction, profile, totalIn, totalOut, balance, transactions.length]);

  if (!isOpen) return null;

  const handleSendWhatsApp = () => {
    let target = phoneNumber.trim().replace(/[^0-9]/g, '');
    if (target.startsWith('0')) {
      target = '62' + target.slice(1);
    } else if (target.startsWith('+')) {
      target = target.slice(1);
    }

    const encoded = encodeURIComponent(message);
    const url = target ? `https://wa.me/${target}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
    toast.success('Membuka WhatsApp...', 'Terkirim');
    onClose();
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message);
    toast.info('Teks pesan berhasil disalin ke clipboard!');
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Kirim Pesan WhatsApp
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kirim laporan, bukti kas, tagihan, atau info usaha
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3.5 text-xs">
          {/* Template Selector */}
          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Pilih Jenis Pesan
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setTemplateType('report')}
                className={`flex items-center justify-center gap-1 rounded-xl py-2 px-2 text-center font-medium transition ${
                  templateType === 'report'
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Laporan Kas</span>
              </button>
              <button
                type="button"
                onClick={() => setTemplateType('invoice')}
                className={`flex items-center justify-center gap-1 rounded-xl py-2 px-2 text-center font-medium transition ${
                  templateType === 'invoice'
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Bukti / Tagihan</span>
              </button>
              <button
                type="button"
                onClick={() => setTemplateType('store_info')}
                className={`flex items-center justify-center gap-1 rounded-xl py-2 px-2 text-center font-medium transition ${
                  templateType === 'store_info'
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Info Usaha</span>
              </button>
            </div>
          </div>

          {/* Target Phone Number */}
          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Nomor WhatsApp Tujuan (Opsional)
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Contoh: 08123456789 atau 62812..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Kosongkan jika ingin memilih kontak langsung di daftar obrolan WhatsApp.
            </p>
          </div>

          {/* Message Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-600 dark:text-slate-300">
                Isi Pesan WhatsApp
              </label>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="flex items-center gap-1 text-[11px] text-emerald-600 hover:underline dark:text-emerald-400"
              >
                <Copy className="w-3 h-3" />
                <span>Salin Teks</span>
              </button>
            </div>
            <textarea
              rows={7}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 font-mono text-[11px] text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-3 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-bold text-white shadow-md hover:bg-emerald-500 active:scale-98 transition"
          >
            <Send className="w-4 h-4" />
            <span>Kirim via WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
