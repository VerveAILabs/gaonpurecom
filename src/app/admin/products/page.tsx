'use client';

import CatalogManager from '@/components/CatalogManager';

export default function AdminProducts() {
  return (
    <div className="space-y-6 flex flex-col min-h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold text-brand-secondary">Products Management</h1>
      </div>
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-stone-200">
        <CatalogManager />
      </div>
    </div>
  );
}
