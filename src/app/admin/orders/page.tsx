'use client';

import OrderManager from '@/components/admin/OrderManager';

export default function AdminOrders() {
  return (
    <div className="space-y-6 flex flex-col min-h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold text-brand-secondary">Orders Management</h1>
      </div>
      <OrderManager />
    </div>
  );
}
