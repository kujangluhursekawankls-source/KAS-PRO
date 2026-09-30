import { TransactionType } from '../types';

/**
 * Format number to Indonesian Rupiah string (e.g. Rp 1.500.000)
 */
export function formatRupiah(amount: number, withSymbol: boolean = true): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(absAmount);

  const prefix = withSymbol ? 'Rp ' : '';
  return isNegative ? `-${prefix}${formatted}` : `${prefix}${formatted}`;
}

/**
 * Parse raw input string into valid number
 */
export function parseRupiahInput(value: string): number {
  const clean = value.replace(/[^0-9]/g, '');
  return clean ? parseInt(clean, 10) : 0;
}

/**
 * Format ISO date string (YYYY-MM-DD) to friendly Indonesian date
 */
export function formatIndonesianDate(
  dateString: string,
  options: { short?: boolean; withDay?: boolean } = {}
): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  const monthNamesShort = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des',
  ];
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const mName = options.short ? monthNamesShort[month - 1] : monthNames[month - 1];
  const base = `${day} ${mName} ${year}`;

  if (options.withDay) {
    const dayOfWeek = dayNames[date.getDay()];
    return `${dayOfWeek}, ${base}`;
  }
  return base;
}

/**
 * Get today's date in YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get current time in HH:mm
 */
export function getCurrentTimeString(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Generate formatted transaction number like KM-20260925-001 or KK-20260925-001
 */
export function generateTransactionNumber(
  type: TransactionType,
  dateString: string,
  sequence: number
): string {
  const prefix = type === 'IN' ? 'KM' : 'KK';
  const cleanDate = dateString.replace(/-/g, '');
  const seqStr = String(sequence).padStart(3, '0');
  return `${prefix}-${cleanDate}-${seqStr}`;
}
