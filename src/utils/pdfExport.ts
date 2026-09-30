import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, BusinessProfile } from '../types';
import { formatIndonesianDate, formatRupiah } from './formatters';

export interface PDFExportOptions {
  profile: BusinessProfile;
  transactions: Transaction[];
  periodLabel: string;
  startDate?: string;
  endDate?: string;
}

export function exportTransactionsPDF({
  profile,
  transactions,
  periodLabel,
}: PDFExportOptions): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let currentY = 15;

  // Header background banner (clean slate tone)
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(margin, currentY, pageWidth - margin * 2, 28, 'F');

  // Business Logo or Icon initial
  if (profile.logo) {
    try {
      doc.addImage(profile.logo, 'JPEG', margin + 3, currentY + 3, 22, 22);
    } catch {
      // Fallback if logo fails
      doc.setFillColor(16, 185, 129); // emerald
      doc.circle(margin + 12, currentY + 14, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('BK', margin + 9, currentY + 17);
    }
  } else {
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.roundedRect(margin + 4, currentY + 4, 20, 20, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('BKP', margin + 8, currentY + 16);
  }

  // Company Information
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(profile.name || 'BUKU KAS PRO', margin + 28, currentY + 9);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // slate-300
  const addressText = profile.address ? profile.address : 'Laporan Keuangan Resmi';
  doc.text(addressText, margin + 28, currentY + 15, { maxWidth: 110 });

  const contactText = `WhatsApp: ${profile.whatsapp || '08179015181'} | Pemilik: ${profile.owner || '-'}`;
  doc.text(contactText, margin + 28, currentY + 21);

  // Document Title & Period tag on the right
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN KAS', pageWidth - margin - 4, currentY + 10, { align: 'right' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(52, 211, 153); // emerald-400
  doc.text(periodLabel, pageWidth - margin - 4, currentY + 16, { align: 'right' });

  currentY += 34;

  // Calculate totals and running balances
  // Sort chronologically for proper running balance calculation
  const sorted = [...transactions].sort((a, b) => {
    const da = `${a.date} ${a.time || '00:00'}`;
    const db = `${b.date} ${b.time || '00:00'}`;
    return da.localeCompare(db);
  });

  let totalIn = 0;
  let totalOut = 0;
  let runningBalance = 0;

  const tableRows = sorted.map((tx, idx) => {
    if (tx.type === 'IN') {
      totalIn += tx.amount;
      runningBalance += tx.amount;
    } else {
      totalOut += tx.amount;
      runningBalance -= tx.amount;
    }

    const inStr = tx.type === 'IN' ? formatRupiah(tx.amount, false) : '-';
    const outStr = tx.type === 'OUT' ? formatRupiah(tx.amount, false) : '-';
    const balanceStr = formatRupiah(runningBalance, false);

    const desc = tx.description
      ? `${tx.description} (${tx.sourceOrTarget})`
      : tx.sourceOrTarget;

    return [
      String(idx + 1),
      formatIndonesianDate(tx.date, { short: true }),
      tx.category,
      desc,
      inStr,
      outStr,
      balanceStr,
    ];
  });

  // Summary Cards above table
  const finalBalance = totalIn - totalOut;
  const colW = (pageWidth - margin * 2 - 8) / 3;

  // Kas Masuk box
  doc.setFillColor(236, 253, 245); // emerald-50
  doc.setDrawColor(167, 243, 208); // emerald-200
  doc.roundedRect(margin, currentY, colW, 14, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text('TOTAL KAS MASUK', margin + 4, currentY + 5);
  doc.setFontSize(10);
  doc.text(formatRupiah(totalIn), margin + 4, currentY + 11);

  // Kas Keluar box
  doc.setFillColor(254, 242, 242); // red-50
  doc.setDrawColor(254, 202, 202); // red-200
  doc.roundedRect(margin + colW + 4, currentY, colW, 14, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38);
  doc.text('TOTAL KAS KELUAR', margin + colW + 8, currentY + 5);
  doc.setFontSize(10);
  doc.text(formatRupiah(totalOut), margin + colW + 8, currentY + 11);

  // Saldo Bersih box
  doc.setFillColor(239, 246, 255); // blue-50
  doc.setDrawColor(191, 219, 254); // blue-200
  doc.roundedRect(margin + (colW + 4) * 2, currentY, colW, 14, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text('SALDO AKHIR', margin + (colW + 4) * 2 + 4, currentY + 5);
  doc.setFontSize(10);
  doc.text(formatRupiah(finalBalance), margin + (colW + 4) * 2 + 4, currentY + 11);

  currentY += 18;

  // Render Table
  autoTable(doc, {
    startY: currentY,
    head: [['No', 'Tanggal', 'Kategori', 'Keterangan', 'Masuk (Rp)', 'Keluar (Rp)', 'Saldo (Rp)']],
    body: tableRows.length > 0 ? tableRows : [['-', '-', '-', 'Tidak ada data transaksi pada periode ini', '-', '-', '-']],
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      lineColor: [226, 232, 240], // slate-200
      lineWidth: 0.2,
      textColor: [30, 41, 59],
    },
    headStyles: {
      fillColor: [30, 41, 59], // slate-800
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'center', cellWidth: 22 },
      2: { halign: 'left', cellWidth: 24 },
      3: { halign: 'left', cellWidth: 'auto' },
      4: { halign: 'right', cellWidth: 25, textColor: [5, 150, 105] }, // emerald
      5: { halign: 'right', cellWidth: 25, textColor: [220, 38, 38] }, // red
      6: { halign: 'right', cellWidth: 28, fontStyle: 'bold' },
    },
    foot: [
      [
        '',
        '',
        'TOTAL',
        `${transactions.length} Transaksi`,
        formatRupiah(totalIn, false),
        formatRupiah(totalOut, false),
        formatRupiah(finalBalance, false),
      ],
    ],
    footStyles: {
      fillColor: [241, 245, 249], // slate-100
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      lineColor: [203, 213, 225],
      lineWidth: 0.3,
    },
    margin: { left: margin, right: margin, bottom: 20 },
    didDrawPage: (data) => {
      // Footer on every page
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageNumber = data.pageNumber;
      
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text('BUKU KAS PRO — Created By Jamhur (08179015181)', margin, pageHeight - 7);

      doc.text(
        `Halaman ${pageNumber} | Dicetak: ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')}`,
        pageWidth - margin,
        pageHeight - 7,
        { align: 'right' }
      );
    },
  });

  // Save the PDF
  const safeTitle = (profile.name || 'BukuKasPro').replace(/[^a-zA-Z0-9]/g, '_');
  const safePeriod = periodLabel.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Laporan_${safeTitle}_${safePeriod}.pdf`);
}
