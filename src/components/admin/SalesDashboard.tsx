'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalRevenue: number;
  ordersCount: number;
  usersCount: number;
  productsCount: number;
  statusBreakdown: Record<string, number>;
  recentOrders: any[];
}

export const SalesDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    ordersCount: 0,
    usersCount: 0,
    productsCount: 0,
    statusBreakdown: {},
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Orders
      const ordersSnap = await getDocs(collection(db, 'orders'));
      const orders: any[] = [];
      let revenue = 0;
      const statusCounts: Record<string, number> = {};

      ordersSnap.forEach((docSnap) => {
        const data = docSnap.data();
        const order = { id: docSnap.id, ...data };
        orders.push(order);

        // Calculate Revenue: include Confirmed, Shipped, Delivered, etc. (all Paid or non-cancelled/non-pending)
        // Usually, if paymentStatus is Paid, it counts.
        if (data.paymentStatus === 'Paid') {
          revenue += (data.totalAmount || 0);
        }

        // Count status distributions
        const status = data.status || 'Ordered';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      // Sort orders by date descending
      orders.sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      });

      // 2. Fetch Users
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersCount = usersSnap.size;

      // 3. Fetch Products
      const productsSnap = await getDocs(collection(db, 'products'));
      const productsCount = productsSnap.size;

      setStats({
        totalRevenue: revenue,
        ordersCount: orders.length,
        usersCount,
        productsCount,
        statusBreakdown: statusCounts,
        recentOrders: orders.slice(0, 5) // Top 5 recent
      });
    } catch (error) {
      console.error("Error fetching dashboard statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-primary border-t-transparent mb-4"></div>
        <p className="text-stone-500 font-medium">Calculating store performance metrics...</p>
      </div>
    );
  }

  const activeOrdersCount = (stats.statusBreakdown['Ordered'] || 0) + 
                            (stats.statusBreakdown['Confirmed'] || 0) + 
                            (stats.statusBreakdown['Shipped'] || 0) + 
                            (stats.statusBreakdown['Out for Delivery'] || 0);

  const cancelledCount = stats.statusBreakdown['Cancelled'] || 0;

  return (
    <div className="space-y-8">
      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1: Total Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Sales</p>
            <h3 className="text-2xl font-bold text-stone-900 mt-1 font-serif">₹{stats.totalRevenue.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        {/* Metric 2: Orders */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Orders</p>
            <h3 className="text-2xl font-bold text-stone-900 mt-1 font-serif">{stats.ordersCount}</h3>
          </div>
        </div>

        {/* Metric 3: Users */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Users</p>
            <h3 className="text-2xl font-bold text-stone-900 mt-1 font-serif">{stats.usersCount}</h3>
          </div>
        </div>

        {/* Metric 4: Products */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Catalog Products</p>
            <h3 className="text-2xl font-bold text-stone-900 mt-1 font-serif">{stats.productsCount}</h3>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Recent Transactions Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-stone-200 shadow-sm p-6 lg:p-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-serif text-brand-secondary">Recent Transactions</h3>
            <Link 
              href="/admin/orders" 
              className="text-xs font-bold text-brand-primary flex items-center gap-1 hover:underline"
            >
              All Orders <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 border-b border-stone-100 text-stone-700">
                <tr>
                  <th className="px-4 py-3 font-semibold rounded-l-xl">Order ID</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold rounded-r-xl">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50/50">
                    <td className="px-4 py-3 font-mono text-[10px] text-stone-500 font-semibold">#{order.id.slice(0, 8)}...</td>
                    <td className="px-4 py-3 font-medium text-stone-900">{order.customerName}</td>
                    <td className="px-4 py-3 font-bold text-stone-900">₹{order.totalAmount}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        order.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                        'bg-blue-50 text-blue-700 border border-blue-100'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-400">
                      {new Date(order.date).toLocaleDateString('en-IN', {day: 'numeric', month: 'short'})}
                    </td>
                  </tr>
                ))}
                {stats.recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-stone-400">No orders placed yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Order Status Distributions */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 lg:p-8 flex flex-col gap-6">
          <h3 className="text-xl font-bold font-serif text-brand-secondary border-b border-stone-100 pb-4">
            Orders Breakdown
          </h3>
          
          <div className="space-y-4 flex-1">
            
            {/* Active Orders */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50/50 border border-blue-100">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-stone-700">Active Shipments</span>
              </div>
              <span className="text-lg font-bold text-blue-700">{activeOrdersCount}</span>
            </div>

            {/* Completed Orders */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-semibold text-stone-700">Delivered Orders</span>
              </div>
              <span className="text-lg font-bold text-emerald-700">{stats.statusBreakdown['Delivered'] || 0}</span>
            </div>

            {/* Cancelled/Failed */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-50/50 border border-rose-100">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-rose-600" />
                <span className="text-sm font-semibold text-stone-700">Cancelled / Failed</span>
              </div>
              <span className="text-lg font-bold text-rose-700">{cancelledCount}</span>
            </div>

          </div>

          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex justify-between items-center text-xs text-stone-500">
            <span>Overall fulfillment rate:</span>
            <span className="font-bold text-stone-800">
              {stats.ordersCount > 0 
                ? `${Math.round(((stats.statusBreakdown['Delivered'] || 0) / stats.ordersCount) * 100)}%`
                : '100%'
              }
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
