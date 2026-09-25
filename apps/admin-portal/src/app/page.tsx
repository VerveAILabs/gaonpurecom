'use client';

import { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Package, 
  AlertTriangle, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  Loader2,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

interface DashboardData {
  stats: {
    totalRevenue: number;
    totalOrdersCount: number;
    averageOrderValue: number;
    pendingOrdersCount: number;
    totalProductsCount: number;
    totalCustomersCount: number;
  };
  lowStockVariants: {
    id: string;
    productName: string;
    weight: string;
    stock: number;
    sku?: string;
  }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    totalAmount: number;
    paymentStatus: string;
    orderStatus: string;
    createdAt: string;
    itemCount: number;
  }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard');
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-sm text-stone-500 font-medium">Loading live metrics from Neon PostgreSQL...</p>
      </div>
    );
  }

  const { stats, lowStockVariants, recentOrders } = data;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Title & Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-xs text-stone-500 mt-1">Real-time performance metrics for Gaon Pure</p>
        </div>
        <button
          onClick={fetchDashboard}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
          Refresh Data
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Gross Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-stone-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900">
            ₹{stats.totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-stone-500 mt-2 flex items-center gap-1 font-medium">
            <span className="text-emerald-600 font-bold">Paid</span> verified orders
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-stone-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900">
            {stats.totalOrdersCount}
          </div>
          <div className="text-[11px] text-stone-500 mt-2">
            Average Order Value: <strong className="text-stone-800">₹{stats.averageOrderValue}</strong>
          </div>
        </div>

        {/* Pending Action Orders */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-stone-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Orders to Dispatch</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">
            {stats.pendingOrdersCount}
          </div>
          <Link href="/orders?status=Ordered" className="text-[11px] text-amber-700 mt-2 flex items-center gap-1 font-semibold hover:underline">
            View pending orders <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Catalog & Customers */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-stone-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Catalog</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900">
            {stats.totalProductsCount} <span className="text-xs font-normal text-stone-400">products</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-2">
            Registered Customers: <strong className="text-stone-800">{stats.totalCustomersCount}</strong>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Orders & Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders List (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
            <h2 className="font-bold text-stone-900 text-sm tracking-wide flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              Recent Orders
            </h2>
            <Link href="/orders" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              View All Orders <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-10 text-stone-400 text-xs">
              No orders recorded in PostgreSQL yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-stone-400 uppercase tracking-wider text-[10px] border-b border-stone-100 pb-2">
                    <th className="pb-3 font-semibold">Order</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Total</th>
                    <th className="pb-3 font-semibold">Payment</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3.5 font-mono font-bold text-stone-800">
                        {o.orderNumber}
                      </td>
                      <td className="py-3.5">
                        <div className="font-medium text-stone-900">{o.customerName}</div>
                        <div className="text-[10px] text-stone-400">{o.customerEmail}</div>
                      </td>
                      <td className="py-3.5 font-bold text-stone-900">
                        ₹{o.totalAmount}
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          o.paymentStatus === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700">
                          {o.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alerts (1 Col) */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
            <h2 className="font-bold text-stone-900 text-sm tracking-wide flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Low Stock Alerts
            </h2>
            <Link href="/inventory" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              Inventory <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {lowStockVariants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-stone-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
              <p className="text-xs font-medium text-stone-700">Stock Levels Healthy</p>
              <p className="text-[11px] text-stone-400 mt-0.5">All product variants have sufficient inventory.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockVariants.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                  <div>
                    <div className="font-semibold text-stone-900 text-xs">{v.productName}</div>
                    <div className="text-[10px] text-stone-500">Variant: {v.weight}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-black ${
                    v.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {v.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
