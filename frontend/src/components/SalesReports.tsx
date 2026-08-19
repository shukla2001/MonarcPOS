import React, { useState, useEffect } from 'react';
import { SalesReportData, Order } from '../types';
import api from '../services/api';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Layers,
  Calendar,
  CreditCard,
  Banknote,
  QrCode,
  Download,
  Printer,
  Sparkles,
  Users,
  RefreshCw,
} from 'lucide-react';

interface SalesReportsProps {
  onViewOrderReceipt: (order: Order) => void;
}

export const SalesReports: React.FC<SalesReportsProps> = ({ onViewOrderReceipt }) => {
  const [period, setPeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string>(now.toISOString().split('T')[0]);

  const [reportData, setReportData] = useState<SalesReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params: any = { period };
      if (period === 'daily') {
        params.date = selectedDate;
      } else if (period === 'monthly') {
        params.year = selectedYear;
        params.month = selectedMonth;
      } else if (period === 'yearly') {
        params.year = selectedYear;
      }

      const res = await api.get('/reports/sales', { params });
      if (res.data.success) {
        setReportData(res.data);
      }
    } catch (error: any) {
      console.error('Failed to load sales report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [period, selectedYear, selectedMonth, selectedDate]);

  const exportCSV = () => {
    if (!reportData) return;

    const headers = ['Order Number', 'Date & Time', 'Cashier', 'Payment Mode', 'Subtotal', 'Tax (5%)', 'Total'];
    const rows = reportData.recentOrders.map((o) => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleString(),
      o.cashier?.name || 'Staff',
      o.paymentMode,
      Number(o.subtotal).toFixed(2),
      Number(o.tax).toFixed(2),
      Number(o.total).toFixed(2),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Monarc_Sales_Report_${period}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const summary = reportData?.summary;
  const maxChartRev = reportData?.chartData
    ? Math.max(...reportData.chartData.map((d) => d.revenue), 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* Top Filter & Period Switcher Header */}
      <div className="bg-[#FFFDF9] p-5 rounded-3xl border border-[#F5E6CC] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Period Pills */}
        <div className="flex items-center gap-2 bg-[#FAF3E7] p-1.5 rounded-2xl border border-[#F5E6CC]">
          <button
            onClick={() => setPeriod('daily')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              period === 'daily'
                ? 'bg-gradient-to-r from-[#DFB870] to-[#C68A4C] text-white shadow-md'
                : 'text-[#78350F] hover:bg-[#F5E6CC]'
            }`}
          >
            Daily Breakdown
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              period === 'monthly'
                ? 'bg-gradient-to-r from-[#DFB870] to-[#C68A4C] text-white shadow-md'
                : 'text-[#78350F] hover:bg-[#F5E6CC]'
            }`}
          >
            Monthly Overview
          </button>
          <button
            onClick={() => setPeriod('yearly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              period === 'yearly'
                ? 'bg-gradient-to-r from-[#DFB870] to-[#C68A4C] text-white shadow-md'
                : 'text-[#78350F] hover:bg-[#F5E6CC]'
            }`}
          >
            Yearly Annual
          </button>
        </div>

        {/* Date / Month / Year Pickers */}
        <div className="flex items-center gap-3 flex-wrap">
          {period === 'daily' && (
            <div className="flex items-center gap-2 bg-[#FAF3E7] px-3 py-1.5 rounded-xl border border-[#F5E6CC]">
              <Calendar className="w-4 h-4 text-[#B45309]" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[#1E1B18] focus:outline-none"
              />
            </div>
          )}

          {period === 'monthly' && (
            <div className="flex items-center gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-[#FAF3E7] border border-[#F5E6CC] text-[#1E1B18] px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none"
              >
                {[
                  'January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'
                ].map((m, idx) => (
                  <option key={idx} value={idx + 1}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-[#FAF3E7] border border-[#F5E6CC] text-[#1E1B18] px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none"
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}

          {period === 'yearly' && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-[#FAF3E7] border border-[#F5E6CC] text-[#1E1B18] px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          )}

          {/* Export CSV & Refresh Buttons */}
          <button
            onClick={exportCSV}
            title="Download CSV Spreadsheet"
            className="px-3.5 py-2 rounded-xl bg-[#FAF3E7] hover:bg-[#F5E6CC] text-[#78350F] font-bold text-xs border border-[#F5E6CC] flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#B45309]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={fetchReport}
            title="Refresh"
            className="p-2 rounded-xl bg-[#FAF3E7] hover:bg-[#F5E6CC] text-[#78350F] border border-[#F5E6CC] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-[#FFFDF9] p-5 rounded-3xl border border-[#F5E6CC] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#78350F]/70">
              Total Revenue
            </span>
            <div className="p-2.5 bg-[#FAF0CF] text-[#92400E] rounded-2xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="font-serif font-extrabold text-3xl text-[#92400E]">
            ₹{summary ? summary.totalRevenue.toFixed(2) : '0.00'}
          </div>
          <p className="text-[11px] text-[#78350F]/70 mt-1">
            Incl. ₹{summary ? summary.totalTax.toFixed(2) : '0.00'} GST
          </p>
        </div>

        {/* Orders Placed */}
        <div className="bg-[#FFFDF9] p-5 rounded-3xl border border-[#F5E6CC] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#78350F]/70">
              Total Orders
            </span>
            <div className="p-2.5 bg-[#FAF3E7] text-[#92400E] rounded-2xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="font-serif font-extrabold text-3xl text-[#1E1B18]">
            {summary ? summary.totalOrders : 0}
          </div>
          <p className="text-[11px] text-[#78350F]/70 mt-1">Bills processed</p>
        </div>

        {/* Items Sold */}
        <div className="bg-[#FFFDF9] p-5 rounded-3xl border border-[#F5E6CC] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#78350F]/70">
              Desserts Served
            </span>
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-2xl">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="font-serif font-extrabold text-3xl text-amber-900">
            {summary ? summary.totalItemsSold : 0}
          </div>
          <p className="text-[11px] text-[#78350F]/70 mt-1">Scoops, sundaes, shakes</p>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-[#FFFDF9] p-5 rounded-3xl border border-[#F5E6CC] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#78350F]/70">
              Avg Order Value
            </span>
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="font-serif font-extrabold text-3xl text-emerald-900">
            ₹{summary ? summary.averageOrderValue.toFixed(2) : '0.00'}
          </div>
          <p className="text-[11px] text-[#78350F]/70 mt-1">Per transaction ticket</p>
        </div>
      </div>

      {/* Main Charts & Breakdown Section (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Trend Visual Bar Chart (8 Columns) */}
        <div className="lg:col-span-8 bg-[#FFFDF9] p-6 rounded-3xl border border-[#F5E6CC] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[#1E1B18]">Revenue Timeline</h3>
              <p className="text-xs text-stone-400 capitalize">{period} financial trajectory</p>
            </div>
            <span className="text-xs font-bold text-[#92400E] bg-[#FAF0CF] px-2.5 py-1 rounded-xl">
              {reportData?.chartData.length || 0} intervals
            </span>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center text-stone-400">
              <div className="w-6 h-6 border-2 border-[#C68A4C] border-t-transparent rounded-full animate-spin mr-2" />
              <span>Compiling analytics...</span>
            </div>
          ) : (
            <div className="pt-4 h-64 flex items-end gap-1.5 sm:gap-2 overflow-x-auto pb-4">
              {reportData?.chartData.map((dp, idx) => {
                const heightPercent = maxChartRev > 0 ? (dp.revenue / maxChartRev) * 100 : 0;
                return (
                  <div
                    key={idx}
                    className="flex-1 min-w-[28px] flex flex-col items-center gap-1 group relative h-full justify-end"
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-12 bg-stone-900 text-white text-[10px] font-mono py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap shadow-lg">
                      <p className="font-bold">{dp.label}</p>
                      <p>₹{dp.revenue.toFixed(2)} ({dp.orders} orders)</p>
                    </div>

                    {/* Bar */}
                    <div
                      style={{ height: `${Math.max(heightPercent, 4)}%` }}
                      className={`w-full rounded-t-lg transition-all duration-300 ${
                        dp.revenue > 0
                          ? 'bg-gradient-to-t from-[#B45309] to-[#DFB870] group-hover:brightness-110 shadow-sm'
                          : 'bg-stone-100'
                      }`}
                    />

                    {/* Label */}
                    <span className="text-[9px] font-semibold text-stone-500 truncate w-full text-center">
                      {dp.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment Modes Split & Cashier Leaderboard (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Payment Modes */}
          <div className="bg-[#FFFDF9] p-6 rounded-3xl border border-[#F5E6CC] shadow-sm space-y-4">
            <h3 className="font-bold text-base text-[#1E1B18]">Payment Distribution</h3>

            <div className="space-y-3">
              {/* UPI */}
              <div className="p-3 bg-[#FAF3E7]/50 rounded-2xl border border-[#F5E6CC] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-purple-700">
                    <QrCode className="w-3.5 h-3.5" />
                    <span>UPI / QR Scan</span>
                  </span>
                  <span className="font-serif font-bold text-[#92400E]">
                    ₹{reportData?.paymentModes.UPI.total.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-stone-500">
                  <span>{reportData?.paymentModes.UPI.count || 0} transactions</span>
                  <span>
                    {summary?.totalRevenue
                      ? `${(((reportData?.paymentModes.UPI.total || 0) / summary.totalRevenue) * 100).toFixed(1)}%`
                      : '0%'}
                  </span>
                </div>
              </div>

              {/* CARD */}
              <div className="p-3 bg-[#FAF3E7]/50 rounded-2xl border border-[#F5E6CC] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-blue-700">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Card / POS Machine</span>
                  </span>
                  <span className="font-serif font-bold text-[#92400E]">
                    ₹{reportData?.paymentModes.CARD.total.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-stone-500">
                  <span>{reportData?.paymentModes.CARD.count || 0} transactions</span>
                  <span>
                    {summary?.totalRevenue
                      ? `${(((reportData?.paymentModes.CARD.total || 0) / summary.totalRevenue) * 100).toFixed(1)}%`
                      : '0%'}
                  </span>
                </div>
              </div>

              {/* CASH */}
              <div className="p-3 bg-[#FAF3E7]/50 rounded-2xl border border-[#F5E6CC] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-emerald-700">
                    <Banknote className="w-3.5 h-3.5" />
                    <span>Cash Register</span>
                  </span>
                  <span className="font-serif font-bold text-[#92400E]">
                    ₹{reportData?.paymentModes.CASH.total.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-stone-500">
                  <span>{reportData?.paymentModes.CASH.count || 0} transactions</span>
                  <span>
                    {summary?.totalRevenue
                      ? `${(((reportData?.paymentModes.CASH.total || 0) / summary.totalRevenue) * 100).toFixed(1)}%`
                      : '0%'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cashier Performance */}
          <div className="bg-[#FFFDF9] p-6 rounded-3xl border border-[#F5E6CC] shadow-sm space-y-3">
            <h3 className="font-bold text-base text-[#1E1B18] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#B45309]" />
              <span>Staff Activity</span>
            </h3>

            <div className="space-y-2">
              {reportData?.cashierPerformance.length === 0 ? (
                <p className="text-xs text-stone-400 py-2">No orders recorded yet.</p>
              ) : (
                reportData?.cashierPerformance.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#FAF3E7]/40 border border-[#F5E6CC]"
                  >
                    <div>
                      <p className="font-bold text-[#1E1B18]">{c.name}</p>
                      <p className="text-[10px] text-stone-500">{c.ordersCount} bills issued</p>
                    </div>
                    <div className="text-right font-serif font-bold text-[#92400E]">
                      ₹{c.totalRevenue.toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top 10 Best Selling Items Table */}
      <div className="bg-[#FFFDF9] rounded-3xl border border-[#F5E6CC] shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-[#1E1B18] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B45309]" />
              <span>Top Best-Selling Flavours & Desserts</span>
            </h3>
            <p className="text-xs text-stone-400">Ranked by volume ordered</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#1E1B18]">
            <thead className="bg-[#FAF3E7] text-xs uppercase font-bold text-[#78350F] border-b border-[#F5E6CC]">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Dessert Item</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Volume Sold</th>
                <th className="py-3 px-4 text-right">Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5E6CC]">
              {reportData?.topSellingItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-stone-400 text-xs">
                    No sales recorded for this timeframe.
                  </td>
                </tr>
              ) : (
                reportData?.topSellingItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-[#FAF3E7]/40 text-xs">
                    <td className="py-3 px-4">
                      <span
                        className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-bold text-[11px] ${
                          idx === 0
                            ? 'bg-amber-400 text-amber-950 shadow-sm'
                            : idx === 1
                            ? 'bg-stone-300 text-stone-800'
                            : idx === 2
                            ? 'bg-amber-700 text-white'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#1E1B18]">{item.name}</td>
                    <td className="py-3 px-4">
                      <span className="bg-[#FAF0CF] text-[#92400E] px-2 py-0.5 rounded-md text-[10px] font-semibold">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#1E1B18]">
                      {item.quantity} {item.unit}s
                    </td>
                    <td className="py-3 px-4 text-right font-serif font-bold text-[#92400E]">
                      ₹{item.revenue.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Transactions List with Thermal Bill Reprint trigger */}
      <div className="bg-[#FFFDF9] rounded-3xl border border-[#F5E6CC] shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-[#1E1B18]">Recent Transactions</h3>
            <p className="text-xs text-stone-400">Past customer orders in this interval</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#1E1B18]">
            <thead className="bg-[#FAF3E7] text-xs uppercase font-bold text-[#78350F] border-b border-[#F5E6CC]">
              <tr>
                <th className="py-3 px-4">Bill Number</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Cashier</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5E6CC]">
              {reportData?.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-400 text-xs">
                    No orders placed in this period.
                  </td>
                </tr>
              ) : (
                reportData?.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FAF3E7]/40 text-xs">
                    <td className="py-3 px-4 font-mono font-bold text-[#92400E]">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-4 text-stone-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold">{order.cashier?.name || 'Staff'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          order.paymentMode === 'UPI'
                            ? 'bg-purple-100 text-purple-800'
                            : order.paymentMode === 'CARD'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {order.paymentMode}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-serif font-bold text-[#1E1B18]">
                      ₹{Number(order.total).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onViewOrderReceipt(order)}
                        className="px-2.5 py-1.5 rounded-xl bg-[#FAF3E7] hover:bg-[#F5E6CC] text-[#78350F] font-bold text-xs inline-flex items-center gap-1 border border-[#F5E6CC] transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#B45309]" />
                        <span>Bill Slip</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
