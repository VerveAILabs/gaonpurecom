'use client';

import { useEffect, useState } from 'react';
import { 
  Settings, 
  Truck, 
  Megaphone, 
  Save, 
  Loader2, 
  CheckCircle2,
  Store
} from 'lucide-react';

interface StoreConfig {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  freeShippingThreshold: number;
  standardDeliveryFee: number;
  currency: string;
  announcement: {
    enabled: boolean;
    text: string;
    link?: string;
  };
}

export default function SettingsPage() {
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      const json = await res.json();
      if (json.success) {
        setConfig(json.settings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setSaving(true);
    setSuccess(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const json = await res.json();
      if (json.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-xs text-stone-500">Loading store settings from PostgreSQL...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Store Settings & Operations</h1>
          <p className="text-xs text-stone-500 mt-1">Configure global delivery fees, contact info, and announcement banners</p>
        </div>
        {success && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Settings Saved!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* General Store Info */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-stone-900 text-sm flex items-center gap-2 border-b border-stone-100 pb-3">
            <Store className="w-4 h-4 text-emerald-600" />
            General Brand Profile
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Store Brand Name</label>
              <input
                type="text"
                value={config.storeName}
                onChange={(e) => setConfig({ ...config, storeName: e.target.value })}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Support Email</label>
              <input
                type="email"
                value={config.supportEmail}
                onChange={(e) => setConfig({ ...config, supportEmail: e.target.value })}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Support Phone</label>
              <input
                type="text"
                value={config.supportPhone}
                onChange={(e) => setConfig({ ...config, supportPhone: e.target.value })}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Delivery Rules */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-stone-900 text-sm flex items-center gap-2 border-b border-stone-100 pb-3">
            <Truck className="w-4 h-4 text-emerald-600" />
            Shipping & Delivery Thresholds
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Free Delivery Minimum Cart Value (₹)</label>
              <input
                type="number"
                value={config.freeShippingThreshold}
                onChange={(e) => setConfig({ ...config, freeShippingThreshold: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold"
              />
              <p className="text-[10px] text-stone-400 mt-1">Orders above this amount get free delivery automatically.</p>
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Standard Delivery Fee (₹)</label>
              <input
                type="number"
                value={config.standardDeliveryFee}
                onChange={(e) => setConfig({ ...config, standardDeliveryFee: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold"
              />
              <p className="text-[10px] text-stone-400 mt-1">Charged when the cart is below the free delivery threshold.</p>
            </div>
          </div>
        </div>

        {/* Storefront Announcement Bar */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h2 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-500" />
              Storefront Announcement Banner
            </h2>
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-stone-700">
              <input
                type="checkbox"
                checked={config.announcement?.enabled}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    announcement: { ...config.announcement, enabled: e.target.checked },
                  })
                }
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              Banner Enabled
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Banner Announcement Text</label>
              <input
                type="text"
                value={config.announcement?.text || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    announcement: { ...config.announcement, text: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. Free shipping on all orders this weekend!"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Banner Click Link (Optional)</label>
              <input
                type="text"
                value={config.announcement?.link || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    announcement: { ...config.announcement, link: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                placeholder="/shop"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/20 transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save All Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
