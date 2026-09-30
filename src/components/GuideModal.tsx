import React from 'react';
import {
  X,
  BookOpen,
  PlusCircle,
  MinusCircle,
  Wallet,
  FileText,
  Database,
  CheckCircle2,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const openWhatsApp = () => {
    const text = encodeURIComponent(
      'Halo Jamhur, saya ingin bertanya tentang aplikasi Buku Kas Pro.'
    );
    window.open(`https://wa.me/628179015181?text=${text}`, '_blank');
  };

  const sections = [
    {
      title: '1. Cara Memulai',
      icon: Sparkles,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/50',
      steps: [
        'Buka aplikasi Buku Kas Pro.',
        'Atur identitas di menu Pengaturan > Profil Usaha (nama toko/masjid/organisasi, alamat, dan logo).',
        'Sesuaikan kategori kas masuk dan kas keluar sesuai kebutuhan usaha Anda.',
        'Mulai catat transaksi pertama Anda dengan menekan tombol (+) di tengah bawah.',
      ],
    },
    {
      title: '2. Cara Menambah Kas Masuk',
      icon: PlusCircle,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50',
      steps: [
        'Tekan tombol (+) lalu pilih "Kas Masuk (+)".',
        'Pilih tanggal transaksi dan jam.',
        'Pilih Kategori (misal: Penjualan, Modal, Iuran, Donasi).',
        'Isi Sumber Dana (misal: Pelanggan Warung, QRIS, Bank).',
        'Masukkan nominal rupiah yang diterima.',
        'Lampirkan foto nota/struk jika ada (opsional).',
        'Tekan "Simpan Transaksi". Saldo otomatis bertambah.',
      ],
    },
    {
      title: '3. Cara Menambah Kas Keluar',
      icon: MinusCircle,
      color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/50',
      steps: [
        'Tekan tombol (+) lalu pilih "Kas Keluar (-)".',
        'Pilih kategori pengeluaran (misal: Belanja Stok, Listrik, Gaji).',
        'Isi Tujuan Pengeluaran (kepada siapa uang dibayarkan).',
        'Masukkan nominal rupiah pengeluaran.',
        'Jika pengeluaran melebihi sisa kas, sistem akan memberi peringatan cerdas.',
        'Tekan "Simpan Transaksi". Saldo otomatis berkurang.',
      ],
    },
    {
      title: '4. Cara Melihat & Memantau Saldo',
      icon: Wallet,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/50',
      steps: [
        'Buka tab Dashboard utama.',
        'Kartu Saldo Saat Ini menampilkan perhitungan otomatis: Total Kas Masuk - Total Kas Keluar.',
        'Lihat ringkasan pemasukan & pengeluaran hari ini dan bulan ini.',
        'Gunakan grafik kas & saldo untuk melihat tren mingguan, bulanan, atau tahunan.',
      ],
    },
    {
      title: '5. Cara Membuat Laporan PDF & Excel',
      icon: FileText,
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/50',
      steps: [
        'Buka tab "Laporan".',
        'Pilih periode: Harian, Mingguan, Bulanan, Tahunan, atau Tanggal Custom.',
        'Tekan tombol "Export PDF" untuk membuat dokumen siap cetak lengkap dengan Logo Usaha dan footer resmi Created By Jamhur.',
        'Atau tekan "Export Excel" untuk mengunduh berkas spreadsheet .xlsx yang rapi.',
      ],
    },
    {
      title: '6. Cara Backup & Restore Data',
      icon: Database,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/50',
      steps: [
        'Buka tab "Pengaturan" lalu pilih "Backup & Restore".',
        'Tekan "Backup Data (JSON)" untuk mengunduh arsip seluruh data keuangan Anda.',
        'Simpan file cadangan tersebut di tempat yang aman (Google Drive / WA / Flashdisk).',
        'Jika ingin memindahkan data ke perangkat baru, tekan "Restore Data" dan pilih file JSON backup.',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs transition-opacity overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-2xl dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Panduan Penggunaan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Langkah mudah mengelola buku kas usaha
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
          {sections.map((sec, idx) => {
            const Icon = sec.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-lg ${sec.color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {sec.title}
                  </h4>
                </div>
                <ul className="space-y-1.5 pl-2 text-xs text-slate-600 dark:text-slate-300">
                  {sec.steps.map((st, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{st}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {/* Developer Contact CTA */}
          <div className="rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-4 text-white">
            <h4 className="text-sm font-bold">Butuh Bantuan atau Kustomisasi?</h4>
            <p className="text-xs text-emerald-100 mt-1 mb-3">
              Developer siap membantu konsultasi, pembuatan fitur khusus, atau setup APK Android Studio.
            </p>
            <button
              onClick={openWhatsApp}
              className="flex items-center justify-center gap-2 rounded-xl bg-white py-2.5 px-4 text-xs font-bold text-emerald-700 shadow hover:bg-emerald-50 active:scale-98 transition w-full"
            >
              <MessageSquare className="h-4 w-4" />
              <span>💬 HUBUNGI DEVELOPER (08179015181)</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
