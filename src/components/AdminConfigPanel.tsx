'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface StoreSettings {
  freeShippingThreshold: number;
  maintenanceMode: boolean;
  storeName: string;
  orderPrefix: string;
}

const defaultSettings: StoreSettings = {
  freeShippingThreshold: 1000,
  maintenanceMode: false,
  storeName: 'Gaon Pure',
  orderPrefix: 'GP'
};

export default function AdminConfigPanel() {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, 'settings', 'store'));
      if (snap.exists()) {
        setSettings(snap.data() as StoreSettings);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await setDoc(doc(db, 'settings', 'store'), settings);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage('Error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading settings...</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 max-w-2xl">
      <h2 className="text-xl font-bold font-serif text-brand-secondary mb-6">General Store Settings</h2>
      
      {message && (
        <div className={`p-4 mb-6 rounded-lg text-sm ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Store Name</label>
          <input 
            type="text" 
            value={settings.storeName}
            onChange={(e) => setSettings({...settings, storeName: e.target.value})}
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Order Prefix</label>
          <input 
            type="text" 
            value={settings.orderPrefix}
            onChange={(e) => setSettings({...settings, orderPrefix: e.target.value})}
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none"
          />
          <p className="text-xs text-stone-500 mt-1">E.g., if prefix is 'GP', orders will be GP-12345</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Free Shipping Threshold (₹)</label>
          <input 
            type="number" 
            value={settings.freeShippingThreshold}
            onChange={(e) => setSettings({...settings, freeShippingThreshold: Number(e.target.value)})}
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-lg border border-stone-200">
          <input 
            type="checkbox" 
            id="maintenance"
            checked={settings.maintenanceMode}
            onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
            className="w-5 h-5 rounded text-brand-primary focus:ring-brand-primary"
          />
          <div>
            <label htmlFor="maintenance" className="font-medium text-stone-900 block">Maintenance Mode</label>
            <p className="text-sm text-stone-500">Enable this to prevent customers from placing new orders while you update the store.</p>
          </div>
        </div>

        <div className="pt-4 border-t border-stone-100 flex justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="px-6 py-2.5 bg-brand-primary text-white rounded-lg font-medium hover:bg-brand-primary-dark transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
