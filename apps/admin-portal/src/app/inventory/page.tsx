'use client';

import { useEffect, useState } from 'react';
import { 
  Boxes, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  Minus, 
  Loader2, 
  Search,
  RefreshCw
} from 'lucide-react';

interface VariantInventory {
  id: string;
  weight: string;
  price: number;
  stock: number;
  sku?: string;
  product: {
    name: string;
    imageUrl: string;
    category?: { name: string };
  };
}

export default function InventoryPage() {
  const [variants, setVariants] = useState<VariantInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inventory');
      const json = await res.json();
      if (json.success) {
        setVariants(json.variants);
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const adjustStock = async (variantId: string, delta: number) => {
    setUpdatingId(variantId);
    try {
      const res = await fetch('/api/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, stockDelta: delta }),
      });
      const json = await res.json();
      if (json.success) {
        setVariants((prev) =>
          prev.map((v) =>
            v.id === variantId ? { ...v, stock: json.variant.stock } : v
          )
        );
      }
    } catch (err) {
      console.error('Error adjusting stock:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = variants.filter(
    (v) =>
      v.product.name.toLowerCase().includes(search.toLowerCase()) ||
      (v.sku && v.sku.toLowerCase().includes(search.toLowerCase())) ||
      v.weight.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Inventory & Stock Control</h1>
          <p className="text-xs text-stone-500 mt-1">Real-time stock level tracker with quick adjustments</p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search product or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          </div>
          <button
            onClick={fetchInventory}
            className="p-2 text-stone-600 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors shadow-sm"
            title="Refresh Inventory"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-xs text-stone-500">Checking warehouse stock...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500 text-xs">
          No inventory items match your search.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4 font-semibold">Product</th>
                <th className="p-4 font-semibold">Variant / SKU</th>
                <th className="p-4 font-semibold">Current Stock</th>
                <th className="p-4 font-semibold">Health Status</th>
                <th className="p-4 font-semibold text-right">Quick Restock / Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((v) => {
                const isUpdating = updatingId === v.id;
                return (
                  <tr key={v.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={v.product.imageUrl}
                          alt={v.product.name}
                          className="w-10 h-10 rounded-lg object-cover border border-stone-200 flex-shrink-0"
                        />
                        <div>
                          <div className="font-bold text-stone-900">{v.product.name}</div>
                          <div className="text-[10px] text-stone-400">{v.product.category?.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-stone-800 text-xs">{v.weight}</div>
                      <div className="text-[10px] text-stone-400 font-mono">{v.sku || 'No SKU'}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-base font-black text-stone-900">
                        {v.stock} <span className="text-xs font-normal text-stone-400">units</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {v.stock === 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                          <AlertTriangle className="w-3 h-3" /> Out of Stock
                        </span>
                      ) : v.stock <= 15 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle className="w-3 h-3" /> Low Stock Warning
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3" /> In Stock
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
                        <button
                          disabled={isUpdating || v.stock <= 0}
                          onClick={() => adjustStock(v.id, -1)}
                          className="px-2 py-1 bg-white hover:bg-stone-50 rounded-lg text-stone-700 font-bold disabled:opacity-40 transition-colors shadow-xs"
                          title="Decrease 1"
                        >
                          -1
                        </button>
                        <button
                          disabled={isUpdating || v.stock < 10}
                          onClick={() => adjustStock(v.id, -10)}
                          className="px-2 py-1 bg-white hover:bg-stone-50 rounded-lg text-stone-700 font-bold disabled:opacity-40 transition-colors shadow-xs"
                          title="Decrease 10"
                        >
                          -10
                        </button>
                        <span className="w-px h-4 bg-stone-300 mx-1"></span>
                        <button
                          disabled={isUpdating}
                          onClick={() => adjustStock(v.id, 10)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white font-bold transition-colors shadow-xs"
                          title="Add 10"
                        >
                          +10
                        </button>
                        <button
                          disabled={isUpdating}
                          onClick={() => adjustStock(v.id, 50)}
                          className="px-2.5 py-1 bg-stone-800 hover:bg-stone-900 rounded-lg text-white font-bold transition-colors shadow-xs"
                          title="Add 50"
                        >
                          +50
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
