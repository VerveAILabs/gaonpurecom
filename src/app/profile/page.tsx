'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { getOrders } from '@/store/useOrderStore';
import { User, Mail, Phone, MapPin, Home, Hash, Save, CheckCircle2, ChevronRight, Package, LayoutDashboard, Loader2, Globe } from 'lucide-react';
import Link from 'next/link';
import { lookupPincode } from '@/lib/pincode';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized, updateUserProfile } = useAuthStore();

  const [formData, setFormData] = useState({ name: '', phone: '', address: '', city: '', state: '', pincode: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState('');

  // Redirect to home if not authenticated
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace('/');
    }
  }, [isInitialized, isAuthenticated, router]);

  // Populate form from user store
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: (user as any).state || '',
        pincode: user.pincode || '',
      });
    }
  }, [user]);

  const handlePincodeChange = async (pin: string) => {
    // Only accept digits and max 6 characters (Indian PIN code structure)
    const cleanPin = pin.replace(/\D/g, '').slice(0, 6);
    setFormData(prev => ({ ...prev, pincode: cleanPin }));
    setPincodeError('');

    if (cleanPin.length === 6) {
      if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
        setPincodeError('Please enter a valid 6-digit Indian PIN code.');
        return;
      }
      setPincodeLoading(true);
      const data = await lookupPincode(cleanPin);
      setPincodeLoading(false);
      if (data) {
        setFormData(prev => ({
          ...prev,
          city: data.city,
          state: data.state
        }));
      } else {
        setPincodeError('PIN code not found. Please fill manually.');
      }
    }
  };

  // Load recent orders
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      getOrders().then(setOrders).catch(() => setOrders([])).finally(() => setLoadingOrders(false));
    } else if (!isAuthenticated) {
      setLoadingOrders(false);
    }
  }, [isAuthenticated, user?.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!isInitialized || !user) {
    return <div className="min-h-screen bg-brand-cream/50 pt-32 flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  const userOrders = orders;

  return (
    <div className="min-h-screen bg-stone-50 pt-24 pb-24">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-stone-500 mb-8 mt-4">
          <Link href="/">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-stone-900 font-medium">My Profile</span>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left: Avatar card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8 flex flex-col items-center text-center gap-4">
              <div className="relative">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.name} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-lg">
                    <span className="text-white text-3xl font-bold">{user.name?.charAt(0)?.toUpperCase()}</span>
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white" title="Online" />
              </div>
              <div className="flex flex-col items-center">
                <h2 className="text-lg font-bold text-stone-900">{user.name}</h2>
                <p className="text-sm text-stone-500">{user.email}</p>
                <span className={`mt-2 inline-block text-xs font-semibold px-3 py-1 rounded-full ${user.role === 'Admin' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                  {user.role}
                </span>
                {user.role === 'Admin' && (
                  <Link 
                    href="/admin" 
                    className="mt-4 flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-full transition-all shadow-sm"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" /> Admin Console
                  </Link>
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 mt-6">
              <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2"><Package className="w-4 h-4 text-brand-primary" /> Recent Orders</h3>
              {loadingOrders ? (
                <div className="flex items-center justify-center py-4"><div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" /></div>
              ) : userOrders.length === 0 ? (
                <p className="text-sm text-stone-400 text-center py-2">No orders yet.</p>
              ) : (
                <ul className="space-y-3 divide-y divide-stone-100">
                  {userOrders.slice(0, 4).map((order) => (
                    <li key={order.id} className="flex justify-between items-center text-sm pt-2.5 first:pt-0">
                      <Link 
                        href={`/orders/${order.id}`}
                        className="hover:text-brand-primary transition-colors flex-1"
                      >
                        <p className="font-semibold text-stone-800 hover:underline">#{order.id?.slice(0, 8)}</p>
                        <p className="text-stone-400 text-xs mt-0.5">
                          {new Date(order.date || (order.createdAt?.seconds ? order.createdAt.seconds * 1000 : order.createdAt)).toLocaleDateString('en-IN')}
                        </p>
                      </Link>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        order.status === 'Delivered' ? 'bg-green-50 text-green-700 border border-green-200' :
                        order.status === 'Cancelled' ? 'bg-red-50 text-red-700 border border-red-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>{order.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Right: Edit form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8">
              <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2">Edit Profile</h2>
              <p className="text-stone-500 text-sm mb-8">Your details are used to prefill checkout for a faster experience.</p>

              {saved && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700 text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5 shrink-0" /> Profile saved successfully!
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
                    <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all" placeholder="Your name" />
                  </div>
                </div>

                {/* Email (readonly) */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Email <span className="text-stone-400 font-normal">(cannot change)</span></label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
                    <input type="email" readOnly value={user.email}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-100 text-stone-400 cursor-not-allowed" />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Phone Number (+91)</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
                    <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all" placeholder="9876543210" />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Street Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
                    <textarea rows={2} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all resize-none" placeholder="123 Village Lane, Block C" />
                  </div>
                </div>

                <div className="space-y-4">
                  {/* PIN Code */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-stone-700">PIN Code (Indian only)</label>
                      {pincodeLoading && <span className="text-[10px] text-brand-primary font-bold animate-pulse flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Verifying...</span>}
                      {pincodeError && <span className="text-[10px] text-red-500 font-bold">{pincodeError}</span>}
                    </div>
                    <div className="relative">
                      <Hash className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
                      <input type="text" value={formData.pincode} onChange={e => handlePincodeChange(e.target.value)}
                        className={`w-full pl-11 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 bg-stone-50 transition-all ${pincodeError ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-stone-200 focus:ring-brand-primary/20 focus:border-brand-primary'}`} placeholder="400001" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* City */}
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">City</label>
                      <div className="relative">
                        <Home className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
                        <input type="text" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })}
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all" placeholder="Mumbai" />
                      </div>
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">State</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
                        <input type="text" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })}
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all" placeholder="Maharashtra" />
                      </div>
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={saving}
                  className="w-full bg-brand-secondary text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-2">
                  {saving ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
