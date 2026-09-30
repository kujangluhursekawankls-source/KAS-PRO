import React, { useState, useMemo } from 'react';
import { Transaction, BusinessProfile, ReportPeriod } from '../types';
import { exportTransactionsPDF } from '../utils/pdfExport';
import { exportTransactionsExcel } from '../utils/excelExport';
import { formatIndonesianDate, formatRupiah, getTodayDateString } from '../utils/formatters';
import {
  FileText,
  FileSpreadsheet,
  Printer,
  Calendar,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Receipt,
  Download,
} from 'lucide-react';

interface ReportsViewProps {
  transactions: Transaction[];
  profile: BusinessProfile;
  onOpenDetailModal: (transaction: Transaction) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  transactions,
  profile,
  onOpenDetailModal,
}) => {
  const [period, setPeriod] = useState<ReportPeriod>('monthly');
  const today = getTodayDateString();

  // Custom date range state
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // 1st of current month
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${yyyy}-${mm}-01`;
  });
  const [endDate, setEndDate] = useState(today);

  // Compute date filter boundary and label
  const { filteredTransactions, periodLabel } = useMemo(() => {
    const now = new Date();
    const todayStr = getTodayDateString();
    let label = '';
    let start = '';
    let end = '';

    if (period === 'today') {
      label = `Hari Ini (${formatIndonesianDate(todayStr, { withDay: true })})`;
      start = todayStr;
      end = todayStr;
    } else if (period === 'weekly') {
      const d = new Date(now);
      const day = d.getDay() || 7; // Get Monday
      d.setDate(d.getDate() - day + 1);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      start = `${yyyy}-${mm}-${dd}`;
      end = todayStr;
      label = `Minggu Ini (${formatIndonesianDate(start, { short: true })} - ${formatIndonesianDate(end, { short: true })})`;
    } else if (period === 'monthly') {
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      start = `${yyyy}-${mm}-01`;
      end = todayStr;
      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
      ];
      label = `Bulan ${monthNames[now.getMonth()]} ${yyyy}`;
    } else if (period === 'yearly') {
      const yyyy = now.getFullYear();
      start = `${yyyy}-01-01`;
      end = todayStr;
      label = `Tahun ${yyyy}`;
    } else {
      // Custom
      start = startDate;
      end = endDate;
      label = `Periode ${formatIndonesianDate(startDate, { short: true })} s/d ${formatIndonesianDate(endDate, { short: true })}`;
    }

    const list = transactions.filter((t) => {
      if (start && t.date < start) return false;
      if (end && t.date > end) return false;
      return true;
    });

    // Sort chronologically for running balance calculation
    list.sort((a, b) => {
      const da = `${a.date} ${a.time || '00:00'}`;
      const db = `${b.date} ${b.time || '00:00'}`;
      return da.localeCompare(db);
    });

    return { filteredTransactions: list, periodLabel: label };
  }, [transactions, period, startDate, endDate]);

  // Totals
  const { totalIn, totalOut, balance } = useMemo(() => {
    let tIn = 0;
    let tOut = 0;
    for (const t of filteredTransactions) {
      if (t.type === 'IN') tIn += t.amount;
      else tOut += t.amount;
    }
    return { totalIn: tIn, totalOut: tOut, balance: tIn - tOut };
  }, [filteredTransactions]);

  // Export Handlers
  const handleExportPDF = () => {
    exportTransactionsPDF({
      profile,
      transactions: filteredTransactions,
      periodLabel,
      startDate,
      endDate,
    });
  };

  const handleExportExcel = () => {
    exportTransactionsExcel({
      profile,
      transactions: filteredTransactions,
      periodLabel,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 pb-24">
      {/* 1. Period Selector Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 transition-colors">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Pilih Periode Laporan
          </h3>
        </div>

        {/* Period Buttons */}
        <div className="grid grid-cols-5 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800 text-xs">
          {[
            { id: 'today', label: 'Harian' },
            { id: 'weekly', label: 'Mingguan' },
            { id: 'monthly', label: 'Bulanan' },
            { id: 'yearly', label: 'Tahunan' },
            { id: 'custom', label: 'Custom' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPeriod(item.id as ReportPeriod)}
              className={`rounded-lg py-2 font-medium transition ${
                period === item.id
                  ? 'bg-white text-emerald-600 shadow-xs dark:bg-slate-700 dark:text-emerald-400 font-bold'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Custom Date Pickers */}
        {period === 'custom' && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Tanggal Akhir
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
        )}

        <div className="mt-2.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          Menampilkan: <span className="text-slate-800 dark:text-slate-200">{periodLabel}</span>
        </div>
      </div>

      {/* 2. Report Financial Summary Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 mb-1">
            <ArrowDownLeft className="h-3.5 w-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-tight">KAS MASUK</span>
          </div>
          <p className="text-sm font-extrabold text-slate-900 dark:text-white tabular-nums truncate">
            {formatRupiah(totalIn)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 mb-1">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-tight">KAS KELUAR</span>
          </div>
          <p className="text-sm font-extrabold text-slate-900 dark:text-white tabular-nums truncate">
            {formatRupiah(totalOut)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 mb-1">
            <Wallet className="h-3.5 w-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-tight">SALDO BERSIH</span>
          </div>
          <p
            className={`text-sm font-black tabular-nums truncate ${
              balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatRupiah(balance)}
          </p>
        </div>
      </div>

      {/* 3. Export Action Bar */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleExportPDF}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 px-3 text-xs font-bold text-white shadow-sm hover:bg-slate-800 active:scale-98 transition dark:bg-slate-800 dark:hover:bg-slate-700"
          title="Export PDF Resmi dengan Logo & Footer Created By Jamhur"
        >
          <FileText className="h-4 w-4 text-emerald-400" />
          <span>Export PDF</span>
        </button>

        <button
          onClick={handleExportExcel}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 px-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 active:scale-98 transition"
          title="Export Excel .xlsx"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Export Excel</span>
        </button>

        <button
          onClick={handlePrint}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          title="Cetak Laporan"
        >
          <Printer className="h-4 w-4" />
        </button>
      </div>

      {/* 4. Detailed Report Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Rincian Transaksi Periode Ini
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {filteredTransactions.length} transaksi tercatat
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {profile.name || 'Buku Kas'}
          </span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <Receipt className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-xs">Tidak ada data transaksi pada periode ini</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 uppercase font-semibold">
                  <th className="py-2.5 px-2">No</th>
                  <th className="py-2.5 px-2">Tanggal</th>
                  <th className="py-2.5 px-2">Kategori</th>
                  <th className="py-2.5 px-2">Keterangan</th>
                  <th className="py-2.5 px-2 text-right">Masuk</th>
                  <th className="py-2.5 px-2 text-right">Keluar</th>
                  <th className="py-2.5 px-2 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(() => {
                  let running = 0;
                  return filteredTransactions.map((tx, idx) => {
                    if (tx.type === 'IN') running += tx.amount;
                    else running -= tx.amount;

                    return (
                      <tr
                        key={tx.id}
                        onClick={() => onOpenDetailModal(tx)}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition"
                      >
                        <td className="py-2.5 px-2 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-2 whitespace-nowrap text-slate-600 dark:text-slate-300">
                          {formatIndonesianDate(tx.date, { short: true })}
                        </td>
                        <td className="py-2.5 px-2 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                          {tx.category}
                        </td>
                        <td className="py-2.5 px-2 max-w-[140px] truncate text-slate-500 dark:text-slate-400">
                          {tx.sourceOrTarget}
                          {tx.description && ` (${tx.description})`}
                        </td>
                        <td className="py-2.5 px-2 text-right font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums whitespace-nowrap">
                          {tx.type === 'IN' ? formatRupiah(tx.amount, false) : '-'}
                        </td>
                        <td className="py-2.5 px-2 text-right font-semibold text-rose-600 dark:text-rose-400 tabular-nums whitespace-nowrap">
                          {tx.type === 'OUT' ? formatRupiah(tx.amount, false) : '-'}
                        </td>
                        <td className="py-2.5 px-2 text-right font-bold text-slate-900 dark:text-white tabular-nums whitespace-nowrap">
                          {formatRupiah(running, false)}
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 font-bold text-slate-900 dark:text-white">
                  <td colSpan={4} className="py-2.5 px-2 text-right">
                    TOTAL PERIODE INI:
                  </td>
                  <td className="py-2.5 px-2 text-right text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {formatRupiah(totalIn, false)}
                  </td>
                  <td className="py-2.5 px-2 text-right text-rose-600 dark:text-rose-400 tabular-nums">
                    {formatRupiah(totalOut, false)}
                  </td>
                  <td className="py-2.5 px-2 text-right text-blue-600 dark:text-blue-400 tabular-nums">
                    {formatRupiah(balance, false)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[10px] text-slate-400">
            Laporan Keuangan Buku Kas Pro · Created By Jamhur (08179015181)
          </p>
        </div>
      </div>
    </div>
  );
};
