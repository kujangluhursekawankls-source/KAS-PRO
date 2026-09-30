import * as XLSX from 'xlsx';
import { Transaction, BusinessProfile } from '../types';
import { formatIndonesianDate, formatRupiah } from './formatters';

export interface ExcelExportOptions {
  profile: BusinessProfile;
  transactions: Transaction[];
  periodLabel: string;
}

export function exportTransactionsExcel({
  profile,
  transactions,
  periodLabel,
}: ExcelExportOptions): void {
  // Sort chronologically for running balance
  const sorted = [...transactions].sort((a, b) => {
    const da = `${a.date} ${a.time || '00:00'}`;
    const db = `${b.date} ${b.time || '00:00'}`;
    return da.localeCompare(db);
  });

  let runningBalance = 0;
  let totalIn = 0;
  let totalOut = 0;

  const headerRows = [
    ['BUKU KAS PRO - LAPORAN KEUANGAN'],
    ['Nama Usaha / Organisasi', profile.name || 'Buku Kas Pro'],
    ['Pemilik', profile.owner || '-'],
    ['Alamat', profile.address || '-'],
    ['Kontak / WhatsApp', profile.whatsapp || '08179015181'],
    ['Periode Laporan', periodLabel],
    ['Tanggal Export', new Date().toLocaleString('id-ID')],
    ['Developer', 'Created By Jamhur (WA: 08179015181)'],
    [], // Blank row
    [
      'No',
      'No Transaksi',
      'Tanggal',
      'Waktu',
      'Tipe Kas',
      'Kategori',
      'Sumber / Tujuan Dana',
      'Keterangan',
      'Kas Masuk (Rp)',
      'Kas Keluar (Rp)',
      'Saldo (Rp)',
    ],
  ];

  const dataRows = sorted.map((tx, idx) => {
    const isMasuk = tx.type === 'IN';
    if (isMasuk) {
      totalIn += tx.amount;
      runningBalance += tx.amount;
    } else {
      totalOut += tx.amount;
      runningBalance -= tx.amount;
    }

    return [
      idx + 1,
      tx.transactionNumber,
      formatIndonesianDate(tx.date, { short: true }),
      tx.time || '-',
      isMasuk ? 'Kas Masuk' : 'Kas Keluar',
      tx.category,
      tx.sourceOrTarget || '-',
      tx.description || '-',
      isMasuk ? tx.amount : 0,
      !isMasuk ? tx.amount : 0,
      runningBalance,
    ];
  });

  const totalRow = [
    '',
    '',
    '',
    '',
    'TOTAL KESELURUHAN',
    `${transactions.length} Transaksi`,
    '',
    '',
    totalIn,
    totalOut,
    totalIn - totalOut,
  ];

  const fullSheetData = [...headerRows, ...dataRows, [], totalRow];

  const ws = XLSX.utils.aoa_to_sheet(fullSheetData);

  // Column widths
  ws['!cols'] = [
    { wch: 6 },  // No
    { wch: 18 }, // No Transaksi
    { wch: 14 }, // Tanggal
    { wch: 8 },  // Waktu
    { wch: 14 }, // Tipe
    { wch: 16 }, // Kategori
    { wch: 26 }, // Sumber / Tujuan
    { wch: 32 }, // Keterangan
    { wch: 16 }, // Masuk
    { wch: 16 }, // Keluar
    { wch: 18 }, // Saldo
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data Kas');

  const safeTitle = (profile.name || 'BukuKasPro').replace(/[^a-zA-Z0-9]/g, '_');
  const safePeriod = periodLabel.replace(/[^a-zA-Z0-9]/g, '_');
  XLSX.writeFile(wb, `Laporan_${safeTitle}_${safePeriod}.xlsx`);
}
