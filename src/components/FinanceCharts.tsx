import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { formatRupiah } from '../utils/formatters';
import { TrendingUp, BarChart3, LineChart } from 'lucide-react';

interface FinanceChartsProps {
  transactions: Transaction[];
}

type ChartFilter = 'weekly' | 'monthly' | 'yearly';
type ChartViewType = 'bars' | 'trend';

export const FinanceCharts: React.FC<FinanceChartsProps> = ({ transactions }) => {
  const [filter, setFilter] = useState<ChartFilter>('weekly');
  const [chartType, setChartType] = useState<ChartViewType>('bars');
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);

  // Prepare aggregated data based on filter
  const chartData = useMemo(() => {
    const now = new Date();

    if (filter === 'weekly') {
      // Last 7 days
      const days = [];
      const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        const label = `${dayNames[d.getDay()]} ${dd}`;

        let inAmount = 0;
        let outAmount = 0;

        for (const t of transactions) {
          if (t.date === dateStr) {
            if (t.type === 'IN') inAmount += t.amount;
            else outAmount += t.amount;
          }
        }

        days.push({
          key: dateStr,
          label,
          inAmount,
          outAmount,
          net: inAmount - outAmount,
        });
      }
      return days;
    } else if (filter === 'monthly') {
      // Last 6 months
      const months = [];
      const monthNamesShort = [
        'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
        'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des',
      ];

      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const prefix = `${yyyy}-${mm}`;
        const label = `${monthNamesShort[d.getMonth()]} ${String(yyyy).slice(2)}`;

        let inAmount = 0;
        let outAmount = 0;

        for (const t of transactions) {
          if (t.date.startsWith(prefix)) {
            if (t.type === 'IN') inAmount += t.amount;
            else outAmount += t.amount;
          }
        }

        months.push({
          key: prefix,
          label,
          inAmount,
          outAmount,
          net: inAmount - outAmount,
        });
      }
      return months;
    } else {
      // Yearly: Last 3 years
      const years = [];
      const currentYear = now.getFullYear();

      for (let i = 2; i >= 0; i--) {
        const y = currentYear - i;
        const prefix = `${y}-`;
        let inAmount = 0;
        let outAmount = 0;

        for (const t of transactions) {
          if (t.date.startsWith(prefix)) {
            if (t.type === 'IN') inAmount += t.amount;
            else outAmount += t.amount;
          }
        }

        years.push({
          key: String(y),
          label: `Thn ${y}`,
          inAmount,
          outAmount,
          net: inAmount - outAmount,
        });
      }
      return years;
    }
  }, [transactions, filter]);

  // Compute max amount for scaling
  const maxVal = useMemo(() => {
    let max = 100000;
    for (const item of chartData) {
      if (item.inAmount > max) max = item.inAmount;
      if (item.outAmount > max) max = item.outAmount;
    }
    return max;
  }, [chartData]);

  // Calculate cumulative balances for trend line
  const trendData = useMemo(() => {
    let running = 0;
    return chartData.map((item) => {
      running += item.net;
      return {
        ...item,
        balance: running,
      };
    });
  }, [chartData]);

  const maxBalance = useMemo(() => {
    let max = 100000;
    for (const item of trendData) {
      if (Math.abs(item.balance) > max) max = Math.abs(item.balance);
    }
    return max;
  }, [trendData]);

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
      {/* Header with Title & Filter Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            {chartType === 'bars' ? (
              <BarChart3 className="h-4.5 w-4.5" />
            ) : (
              <LineChart className="h-4.5 w-4.5" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {chartType === 'bars' ? 'Grafik Kas Masuk & Keluar' : 'Grafik Perkembangan Saldo'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Perbandingan berkala dan arus kas
            </p>
          </div>
        </div>

        {/* View Toggle & Period Filter */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          {/* Chart Type Toggle */}
          <div className="flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setChartType('bars')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                chartType === 'bars'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Kas
            </button>
            <button
              type="button"
              onClick={() => setChartType('trend')}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                chartType === 'trend'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Saldo
            </button>
          </div>

          {/* Timeframe Filter Tabs */}
          <div className="flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
            {(['weekly', 'monthly', 'yearly'] as ChartFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition ${
                  filter === f
                    ? 'bg-white text-emerald-600 shadow-xs dark:bg-slate-700 dark:text-emerald-400 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {f === 'weekly' ? 'Minggu' : f === 'monthly' ? 'Bulan' : 'Tahun'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Legend */}
      <div className="flex items-center gap-4 text-xs mb-3 text-slate-600 dark:text-slate-400">
        {chartType === 'bars' ? (
          <>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-xs bg-emerald-500" />
              <span>Kas Masuk</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-xs bg-rose-500" />
              <span>Kas Keluar</span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-full bg-blue-500" />
            <span>Perkembangan Saldo</span>
          </div>
        )}
      </div>

      {/* SVG Canvas Chart */}
      <div className="relative h-48 w-full select-none pt-2">
        {chartType === 'bars' ? (
          /* Dual Bar Chart */
          <div className="flex h-full w-full items-end justify-between gap-1.5 pb-6">
            {chartData.map((item, idx) => {
              const inHeightPct = Math.max(4, Math.round((item.inAmount / maxVal) * 100));
              const outHeightPct = Math.max(4, Math.round((item.outAmount / maxVal) * 100));
              const isActive = activeItemIndex === idx;

              return (
                <div
                  key={item.key}
                  className="group relative flex flex-1 flex-col items-center h-full justify-end cursor-pointer"
                  onClick={() => setActiveItemIndex(isActive ? null : idx)}
                  onMouseEnter={() => setActiveItemIndex(idx)}
                  onMouseLeave={() => setActiveItemIndex(null)}
                >
                  {/* Tooltip on active */}
                  {isActive && (
                    <div className="absolute -top-12 z-20 whitespace-nowrap rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] text-white shadow-lg dark:bg-slate-700 pointer-events-none">
                      <div className="font-semibold text-emerald-400">
                        + {formatRupiah(item.inAmount)}
                      </div>
                      <div className="font-semibold text-rose-400">
                        - {formatRupiah(item.outAmount)}
                      </div>
                    </div>
                  )}

                  {/* Bars container */}
                  <div className="flex w-full items-end justify-center gap-1 h-36">
                    {/* In Bar */}
                    <div
                      style={{ height: `${item.inAmount > 0 ? inHeightPct : 2}%` }}
                      className={`w-1/2 max-w-[14px] rounded-t-sm transition-all duration-300 ${
                        item.inAmount > 0
                          ? 'bg-emerald-500 group-hover:bg-emerald-400'
                          : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                    />
                    {/* Out Bar */}
                    <div
                      style={{ height: `${item.outAmount > 0 ? outHeightPct : 2}%` }}
                      className={`w-1/2 max-w-[14px] rounded-t-sm transition-all duration-300 ${
                        item.outAmount > 0
                          ? 'bg-rose-500 group-hover:bg-rose-400'
                          : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                    />
                  </div>

                  {/* Label */}
                  <span className="absolute bottom-0 text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-full">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          /* Cumulative Saldo Line / Area Chart */
          <div className="relative h-full w-full pb-6">
            <svg className="h-36 w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="balanceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              <line x1="0" y1="20" x2="100" y2="20" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="0.5" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="0.5" />
              <line x1="0" y1="80" x2="100" y2="80" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="0.5" />

              {/* Line & Area Path */}
              {(() => {
                const count = trendData.length;
                if (count < 2) return null;
                const points = trendData.map((d, i) => {
                  const x = (i / (count - 1)) * 100;
                  // Map balance (-maxBalance to +maxBalance) to SVG Y (90 to 10)
                  const normalized = Math.max(0, Math.min(1, (d.balance + maxBalance) / (maxBalance * 2 || 1)));
                  const y = 90 - normalized * 80;
                  return { x, y, data: d };
                });

                const pathD = points.reduce((acc, p, idx) => {
                  return `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
                }, '');

                const areaD = `${pathD} L 100 95 L 0 95 Z`;

                return (
                  <>
                    <path d={areaD} fill="url(#balanceGrad)" />
                    <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    {points.map((p, idx) => (
                      <circle
                        key={idx}
                        cx={p.x}
                        cy={p.y}
                        r="3"
                        fill="#ffffff"
                        stroke="#2563eb"
                        strokeWidth="2"
                        className="cursor-pointer hover:r-4 transition-all"
                        onClick={() => setActiveItemIndex(idx)}
                      />
                    ))}
                  </>
                );
              })()}
            </svg>

            {/* Labels under the trend */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
              {trendData.map((item, idx) => (
                <span
                  key={idx}
                  className="cursor-pointer hover:text-blue-500"
                  onClick={() => setActiveItemIndex(idx)}
                >
                  {item.label}
                </span>
              ))}
            </div>

            {/* Tooltip for trend */}
            {activeItemIndex !== null && trendData[activeItemIndex] && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-white shadow-lg dark:bg-slate-700">
                <span className="text-slate-300 font-medium">
                  {trendData[activeItemIndex].label}:
                </span>{' '}
                <span className="font-bold text-blue-400 tabular-nums">
                  {formatRupiah(trendData[activeItemIndex].balance)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Summary Footnote */}
      <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          <span>Arus Kas Real-time</span>
        </div>
        <span className="font-medium text-slate-700 dark:text-slate-300">
          {transactions.length} Transaksi Tercatat
        </span>
      </div>
    </div>
  );
};
