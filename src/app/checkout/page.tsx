'use client';

import { useCartStore } from '@/store/useCartStore';
import { ShieldCheck, ChevronRight, CheckCircle2, AlertCircle, Loader2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { createCatalogPaymentLinkAgent } from '@/lib/paymentLinkAgent';
import { getFirebaseErrorMessage } from '@/lib/firebaseErrors';
import { lookupPincode } from '@/lib/pincode';
import { AuthModal } from '@/components/AuthModal';

export default function Checkout() {
  const { items, getTotal, clearCart } = useCartStore();
  const { user, isAuthenticated, isInitialized, loginWithGoogle } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState('');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Prefill from user profile when authenticated
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: (user as any).phone || '',
        address: (user as any).address || '',
        city: (user as any).city || '',
        state: (user as any).state || '',
        pincode: (user as any).pincode || '',
      });
    }
  }, [user]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-brand-cream/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
          <span className="text-xs text-stone-500 font-bold uppercase tracking-widest animate-pulse">Loading secure checkout...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_10%_20%,rgba(223,168,103,0.06)_0%,transparent_40%),var(--color-brand-cream)] pt-36 pb-20 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-[32px] border border-stone-200/50 shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-brand-primary/5 rounded-full flex items-center justify-center mx-auto text-brand-primary">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-serif font-bold text-brand-secondary">Secure Checkout</h1>
            <p className="text-stone-600 text-sm font-medium leading-relaxed">
              Please sign in or register to complete your order details, track your delivery, and view purchase history.
            </p>
          </div>
          
          <div className="space-y-3 pt-4">
            <button
              onClick={loginWithGoogle}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 border border-stone-200 hover:bg-stone-50 rounded-xl font-bold text-xs uppercase tracking-widest text-stone-700 transition-all cursor-pointer shadow-sm hover:shadow active:scale-98"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.579-7.859-8s3.529-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.245-3.125C18.365 1.701 15.567 1 12.24 1A11.005 11.005 0 0 0 1.25 12a11.005 11.005 0 0 0 10.99 11c5.73 0 9.54-4.006 9.54-9.699 0-.651-.07-1.146-.15-1.615H12.24z"/>
              </svg>
              Continue with Google
            </button>
            
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-stone-200"></div>
              <span className="flex-shrink mx-4 text-stone-400 text-[10px] font-bold uppercase tracking-wider">or</span>
              <div className="flex-grow border-t border-stone-200"></div>
            </div>

            <button
              onClick={() => setIsAuthOpen(true)}
              className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-98"
            >
              Sign In with Email
            </button>
          </div>

          <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        </div>
      </div>
    );
  }

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

  const subtotal = getTotal();
  const shipping = subtotal > 1000 ? 0 : 50;
  const total = subtotal + shipping;

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');
    setIsProcessing(true);

    try {
      const callbackUrl = `${window.location.origin}/profile`;
      const linkData = await createCatalogPaymentLinkAgent({
        cartItems: items,
        shippingAddress: formData,
        userId: user?.id || 'guest',
        callbackUrl,
      });

      setOrderId(linkData.orderId);
      setOrderPlaced(true);
      clearCart();
      window.location.href = linkData.paymentLinkUrl;
    } catch (error: unknown) {
      setPaymentError(getFirebaseErrorMessage(error));
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-brand-cream/50 pt-32 pb-24 flex items-center justify-center paper-texture">
        <div className="text-center space-y-6 max-w-md mx-auto px-4 bg-white p-8 rounded-[32px] border border-stone-200/50 shadow-md">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 animate-pulse" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-brand-secondary">Payment Processing</h1>
          <p className="text-stone-650 text-sm leading-relaxed">
            Thank you, <strong>{formData.name}</strong>. Redirecting you to Razorpay secure payment gateway to complete your transaction.
          </p>
          {orderId && (
            <p className="text-[10px] font-mono bg-stone-50 px-3 py-2 rounded-lg text-stone-400 border border-stone-100 truncate">
              Order Ref: {orderId}
            </p>
          )}
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] text-stone-400 font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-primary" />
              Do not reload this page...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-brand-cream/50 pt-32 pb-24 flex items-center justify-center">
        <div className="text-center bg-white p-10 rounded-[32px] border border-stone-200/50 max-w-sm shadow-sm">
          <div className="text-5xl mb-4 select-none">🌾</div>
          <h1 className="text-xl font-bold text-brand-secondary mb-2">Your cart is empty</h1>
          <p className="text-xs text-stone-450 leading-relaxed mb-6">Select organic grains or cold-pressed oils from the store to proceed.</p>
          <Link href="/shop" className="btn-primary inline-flex text-xs uppercase tracking-widest px-6 py-3 border-none">
            Browse Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream/40 pt-28 pb-24">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-8 mt-2 uppercase tracking-wider font-semibold">
          <Link href="/">Home</Link>
          <ChevronRight className="w-3 h-3 text-stone-300" />
          <Link href="/shop">Shop</Link>
          <ChevronRight className="w-3 h-3 text-stone-300" />
          <span className="text-brand-primary font-bold">Secure Checkout</span>
        </div>

        <div className="grid md:grid-cols-5 gap-8 items-start">
          
          {/* Left Panel: Delivery Details */}
          <div className="bg-white p-6 md:p-8 rounded-[32px] border border-stone-200/50 shadow-sm md:col-span-3">
            <h2 className="text-xl font-serif text-brand-secondary mb-6 font-bold flex items-center gap-2 border-b border-stone-100 pb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" /> Delivery Information
            </h2>
            
            <form onSubmit={handlePayNow} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input required type="text" className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-stone-50 transition-all font-medium"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input required type="email" className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-stone-50 transition-all font-medium"
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Phone Number (+91)</label>
                  <input required type="tel" className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-stone-50 transition-all font-medium"
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="9876543210" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Street Address</label>
                  <textarea required rows={2} className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-stone-50 transition-all resize-none font-medium"
                    value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="123 Village Lane, Block C" />
                </div>
                <div className="col-span-2">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">PIN Code (Indian only)</label>
                    {pincodeLoading && <span className="text-[10px] text-brand-primary font-bold animate-pulse flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Fetching details...</span>}
                    {pincodeError && <span className="text-[10px] text-red-500 font-bold">{pincodeError}</span>}
                  </div>
                  <input required type="text" className={`w-full px-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 bg-stone-50 transition-all font-medium ${pincodeError ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-stone-200 focus:ring-brand-primary/20 focus:border-brand-primary'}`}
                    value={formData.pincode} onChange={e => handlePincodeChange(e.target.value)} placeholder="400001" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">City</label>
                  <input required type="text" className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-stone-50 transition-all font-medium"
                    value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="Mumbai" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">State</label>
                  <input required type="text" className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-stone-50 transition-all font-medium"
                    value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} placeholder="Maharashtra" />
                </div>
              </div>

              {/* Secure payment status badge */}
              <div className="flex items-start gap-3 p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-xs text-emerald-800">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-bold">Secured by Razorpay Encryption</p>
                  <p className="text-emerald-700/80 mt-0.5 leading-relaxed">Pay safely via UPI, NetBanking, or Debit/Credit card. Your order will be milled fresh upon payment verification.</p>
                </div>
              </div>

              {/* Payment Error */}
              {paymentError && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{paymentError}</p>
                </div>
              )}

              {/* Razorpay branding */}
              <div className="flex items-center justify-center gap-1.5 text-[9px] text-stone-400 font-bold uppercase tracking-wider">
                <span>Powered by</span>
                <img src="https://razorpay.com/favicon.ico" alt="Razorpay" className="w-3.5 h-3.5 opacity-60" />
                <span>Razorpay Checkout</span>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold py-3.5 rounded-full shadow hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed text-xs uppercase tracking-widest cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Generating Payment Link...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-brand-accent-light" />
                    Pay Now · ₹{total}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Panel: Order Summary */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-[32px] border border-stone-200/50 shadow-sm sticky top-24">
              <h2 className="text-xl font-serif text-brand-secondary mb-6 font-bold flex items-center gap-2 border-b border-stone-100 pb-3">
                <ShoppingBag className="w-4 h-4 text-brand-primary" /> Order Summary
              </h2>

              {/* Items List */}
              <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={`${item.id}-${item.weight}`} className="flex justify-between items-center text-xs pb-3 border-b border-stone-100 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-brand-cream rounded-lg flex items-center justify-center text-lg shadow-inner border border-stone-200/30">
                        🌾
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-850">{item.name}</h4>
                        <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mt-0.5">
                          {item.weight} Pack · Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-stone-800">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>

              {/* Price Details */}
              <div className="border-t border-stone-100 pt-5 mt-5 space-y-3 text-xs text-stone-500">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-stone-800">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Hub Fee</span>
                  <span className="font-bold text-stone-800">
                    {shipping === 0 ? (
                      <span className="text-emerald-700 font-bold uppercase tracking-wider">Free Shipping</span>
                    ) : (
                      `₹${shipping}`
                    )}
                  </span>
                </div>
                
                {shipping > 0 && (
                  <div className="text-[10px] bg-brand-cream border border-stone-200/30 p-2.5 rounded-xl text-brand-primary font-bold leading-relaxed">
                    Add ₹{1000 - subtotal} more for free delivery from Ayodhya hubs!
                  </div>
                )}
                
                <div className="border-t border-stone-100 pt-4 mt-4 flex justify-between items-center text-sm font-bold text-stone-900">
                  <span>Grand Total</span>
                  <span className="text-xl text-brand-secondary font-bold">₹{total}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
