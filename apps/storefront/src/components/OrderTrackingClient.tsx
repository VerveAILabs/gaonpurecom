'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getOrderById, Order, OrderStatus } from '@/store/useOrderStore';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  Package, 
  MapPin, 
  CreditCard, 
  Calendar, 
  Clock, 
  ChevronRight, 
  ShoppingBag,
  ArrowLeft,
  Check,
  AlertCircle,
  ShieldCheck,
  Truck
} from 'lucide-react';
import Link from 'next/link';

interface OrderTrackingClientProps {
  id: string;
}

export default function OrderTrackingClient({ id }: OrderTrackingClientProps) {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated) {
        router.replace('/');
      } else if (id) {
        fetchOrder();
      }
    }
  }, [id, isAuthenticated, isInitialized, router]);

  const fetchOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getOrderById(id);
      if (!data) {
        setError('Order not found.');
      } else {
        // Security check: Only the order owner or an Admin can view the details
        if (data.userId !== user?.id && user?.role !== 'Admin') {
          setError('You do not have permission to view this order.');
        } else {
          setOrder(data);
        }
      }
    } catch (err) {
      console.error("Error loading order:", err);
      setError('Failed to retrieve order details.');
    } finally {
      setLoading(false);
    }
  };

  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen bg-brand-cream/30 pt-32 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-[32px] border border-stone-200/50 shadow-sm">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-550 font-bold text-xs uppercase tracking-wider">Retrieving tracking records...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-brand-cream/30 pt-32 pb-24 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-4 bg-white p-8 rounded-[32px] border border-stone-200/50 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto border border-red-100">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h1 className="text-xl font-serif font-bold text-stone-850">Error Loading Order</h1>
          <p className="text-stone-600 text-xs leading-relaxed">{error || 'Unable to retrieve order details.'}</p>
          <div className="pt-2 flex gap-3 justify-center">
            <Link
              href="/profile"
              className="px-5 py-2.5 bg-brand-secondary text-white rounded-full font-bold hover:bg-brand-secondary-dark transition-colors text-xs uppercase tracking-widest flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 text-brand-accent-light" /> Profile
            </Link>
            <Link
              href="/shop"
              className="px-5 py-2.5 border border-stone-200 text-stone-600 bg-white rounded-full font-bold hover:bg-stone-50 transition-colors text-xs uppercase tracking-widest"
            >
              Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Stepper phases configuration - Village path mapping
  const steps: { status: OrderStatus; label: string; desc: string }[] = [
    { status: 'Ordered', label: 'Harvest Sourced', desc: 'Order received. Grains allocated from village farms.' },
    { status: 'Confirmed', label: 'Stone Milled', desc: 'Payment verified. Flour cold-pressed at slow RPM.' },
    { status: 'Shipped', label: 'Dispatched', desc: 'Packed and dispatched from the local packaging hub.' },
    { status: 'Out for Delivery', label: 'Out for Delivery', desc: 'Out with courier for delivery to your doorstep.' },
    { status: 'Delivered', label: 'Arrived', desc: 'Delivered fresh and ready for your kitchen!' }
  ];

  const isCancelled = order.status === 'Cancelled';
  const isReturned = order.status === 'Return';

  // Get index of current status
  const currentStepIndex = steps.findIndex(step => step.status === order.status);

  // Status colors
  const badgeColors: Record<string, string> = {
    'Ordered': 'bg-stone-100 text-stone-700 border border-stone-200',
    'Payment Pending': 'bg-amber-50 text-amber-700 border border-amber-200',
    'Confirmed': 'bg-emerald-50 text-emerald-800 border border-emerald-100',
    'Shipped': 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    'Out for Delivery': 'bg-orange-50 text-orange-700 border border-orange-200',
    'Delivered': 'bg-emerald-50 text-emerald-850 border border-emerald-250',
    'Cancelled': 'bg-red-50 text-red-700 border border-red-200',
    'Return': 'bg-pink-50 text-pink-700 border border-pink-200',
  };

  return (
    <div className="min-h-screen bg-brand-cream/30 pt-28 pb-24">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-8 mt-2 uppercase tracking-wider font-semibold">
          <Link href="/">Home</Link>
          <ChevronRight className="w-3 h-3 text-stone-300" />
          <Link href="/profile">Profile</Link>
          <ChevronRight className="w-3 h-3 text-stone-300" />
          <span className="text-brand-primary font-bold">Track Order #{order.id.slice(0, 8)}</span>
        </div>

        {/* Header Block */}
        <div className="bg-white rounded-[32px] border border-stone-200/50 shadow-sm p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 paper-texture">
          <div className="space-y-2.5">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-serif font-bold text-brand-secondary">
                Order Tracking
              </h1>
              <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeColors[order.status] || 'bg-stone-100 text-stone-800'}`}>
                {order.status}
              </span>
            </div>
            <p className="text-[10px] text-stone-400 font-mono">Reference: {order.id}</p>
            <div className="flex items-center gap-4 text-xs text-stone-500 flex-wrap pt-1 font-semibold">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-stone-400" /> {new Date(order.date).toLocaleDateString('en-IN', {dateStyle: 'medium'})}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-stone-400" /> {new Date(order.date).toLocaleTimeString('en-IN', {timeStyle: 'short'})}</span>
            </div>
          </div>
          <div className="flex items-center">
            <Link 
              href="/profile" 
              className="px-5 py-2.5 border border-stone-200 text-stone-600 bg-stone-50 hover:bg-stone-100 rounded-full text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-stone-450" /> Back to Profile
            </Link>
          </div>
        </div>

        {/* Stepper Status tracker */}
        <div className="bg-white rounded-[32px] border border-stone-200/50 shadow-sm p-6 lg:p-8 mb-8">
          <h3 className="font-bold text-brand-secondary mb-8 font-serif text-lg flex items-center gap-2">
            <Truck className="w-4 h-4 text-brand-primary" /> Shipment Path
          </h3>

          {isCancelled ? (
            <div className="p-5 bg-red-50/50 rounded-2xl border border-red-100 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 border border-red-200">
                <AlertCircle className="w-5 h-5 text-red-650" />
              </div>
              <div>
                <h4 className="font-bold text-red-900 text-sm">Order Cancelled</h4>
                <p className="text-xs text-red-700/80 mt-1 leading-relaxed">This order has been cancelled and refunded. If you have questions, please reach out via WhatsApp.</p>
              </div>
            </div>
          ) : isReturned ? (
            <div className="p-5 bg-rose-50/50 rounded-2xl border border-rose-100 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0 border border-rose-200">
                <AlertCircle className="w-5 h-5 text-rose-650" />
              </div>
              <div>
                <h4 className="font-bold text-rose-900 text-sm">Returned Status</h4>
                <p className="text-xs text-rose-700/80 mt-1 leading-relaxed">This shipment was returned to our village warehouse hubs.</p>
              </div>
            </div>
          ) : (
            <div className="relative py-4">
              {/* Desktop Connecting Stepper Line */}
              <div className="absolute top-4 left-4 right-4 h-1 bg-stone-100 -translate-y-1/2 hidden md:block z-0">
                <div 
                  className="h-full bg-brand-primary transition-all duration-500 ease-out"
                  style={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}
                />
              </div>

              {/* Stepper Steps grid */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4 relative z-10">
                {steps.map((step, idx) => {
                  const isCompleted = idx <= currentStepIndex;
                  const isActive = idx === currentStepIndex;
                  
                  // Find timestamp for this status from updates
                  const matchingUpdate = order.trackingUpdates?.find(u => u.status === step.status);
                  const timestamp = matchingUpdate?.timestamp;

                  return (
                    <div key={idx} className="flex md:flex-col items-start md:items-center text-left md:text-center gap-4 md:gap-3">
                      
                      {/* Step Ball */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all border-2 ${
                        isCompleted 
                          ? 'bg-brand-primary border-brand-primary text-white shadow-sm' 
                          : 'bg-white border-stone-200 text-stone-400'
                      }`}>
                        {isCompleted ? (
                          <Check className="w-4 h-4 text-brand-accent-light" />
                        ) : (
                          <span className="text-[10px] font-bold">{idx + 1}</span>
                        )}
                      </div>

                      {/* Step Labels */}
                      <div className="space-y-0.5 flex-1">
                        <h4 className={`text-xs font-bold ${isActive ? 'text-brand-primary' : isCompleted ? 'text-brand-secondary' : 'text-stone-400'}`}>
                          {step.label}
                        </h4>
                        {timestamp && (
                          <p className="text-[9px] text-stone-400 font-semibold">
                            {new Date(timestamp).toLocaleDateString('en-IN', {day: 'numeric', month: 'short'})} at {new Date(timestamp).toLocaleTimeString('en-IN', {hour: 'numeric', minute: '2-digit'})}
                          </p>
                        )}
                        {!timestamp && isActive && (
                          <p className="text-[9px] text-brand-primary animate-pulse font-bold uppercase tracking-wider">In Mill Process</p>
                        )}
                        <p className="text-[9px] text-stone-400 font-medium leading-relaxed max-w-[130px] hidden md:block mx-auto pt-1">
                          {step.desc}
                        </p>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Details Column 1 & 2 */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Items list card */}
            <div className="bg-white rounded-[32px] border border-stone-200/50 shadow-sm p-6 lg:p-8">
              <h3 className="font-bold text-brand-secondary mb-6 font-serif text-lg flex items-center gap-2 border-b border-stone-100 pb-3">
                <ShoppingBag className="w-4 h-4 text-brand-primary" /> Items Dispatched
              </h3>
              
              <div className="divide-y divide-stone-100 space-y-4">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between pt-4 first:pt-0">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-brand-cream rounded-xl flex items-center justify-center text-lg shadow-inner border border-stone-200/40 shrink-0">
                        🌾
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-850 text-xs leading-tight">{item.name}</h4>
                        <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider mt-1">
                          {item.weight} Pack · Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="font-bold text-stone-800 text-sm">
                      ₹{(item.price || item.unitPrice || 0) * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Calculations */}
              <div className="border-t border-stone-100 pt-6 mt-6 space-y-3.5 text-xs text-stone-500">
                <div className="flex justify-between">
                  <span>Cart Items Subtotal</span>
                  <span className="font-bold text-stone-800">₹{order.totalAmount > 1000 ? order.totalAmount : order.totalAmount - 50}</span>
                </div>
                <div className="flex justify-between">
                  <span>Village Delivery Fee</span>
                  <span className="font-bold text-stone-800">{order.totalAmount > 1000 ? 'Free Shipping' : '₹50'}</span>
                </div>
                <div className="border-t border-stone-100 pt-4 flex justify-between items-center text-sm font-bold text-stone-900">
                  <span>Total Amount Paid</span>
                  <span className="text-brand-secondary text-lg font-bold">₹{order.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Tracking logs updates */}
            <div className="bg-white rounded-[32px] border border-stone-200/50 shadow-sm p-6 lg:p-8">
              <h3 className="font-bold text-brand-secondary mb-6 font-serif text-lg flex items-center gap-2 border-b border-stone-100 pb-3">
                <Clock className="w-4 h-4 text-brand-primary" /> Delivery Log Book
              </h3>
              <div className="space-y-4">
                {order.trackingUpdates && order.trackingUpdates.map((update, idx) => (
                  <div key={idx} className="flex gap-4 relative pl-5 last:pb-0 pb-4 border-l border-stone-200/70">
                    <div className="absolute w-2 h-2 rounded-full bg-brand-primary -left-[4.5px] top-1.5" />
                    <div className="space-y-0.5">
                      <div className="font-bold text-stone-800 text-xs">{update.status}</div>
                      <div className="text-[9px] text-stone-400 font-semibold">
                        {new Date(update.timestamp).toLocaleDateString('en-IN', {dateStyle: 'medium'})} at {new Date(update.timestamp).toLocaleTimeString('en-IN', {timeStyle: 'short'})}
                      </div>
                      {update.note && (
                        <p className="text-xs text-stone-500 mt-1.5 bg-stone-50 border border-stone-200/30 p-2.5 rounded-xl italic leading-relaxed">
                          "{update.note}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {(!order.trackingUpdates || order.trackingUpdates.length === 0) && (
                  <p className="text-stone-400 text-xs font-medium">No logistics records logged yet.</p>
                )}
              </div>
            </div>

          </div>
          
          {/* Shipping Coordinates Column 3 */}
          <div className="space-y-8">
            
            {/* Delivery address details */}
            <div className="bg-white rounded-[32px] border border-stone-200/50 shadow-sm p-6 lg:p-8 flex flex-col gap-4">
              <h3 className="font-bold text-brand-secondary font-serif text-base flex items-center gap-2 border-b border-stone-100 pb-2.5">
                <MapPin className="w-4 h-4 text-brand-primary" /> Shipping Address
              </h3>
              {order.shippingAddress ? (
                <div className="text-xs text-stone-600 space-y-3.5 leading-relaxed">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block">Recipient Name</span>
                    <p className="font-bold text-stone-850 text-sm">{order.shippingAddress.name}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block">Phone Number</span>
                    <p className="font-semibold text-stone-800">+91 {order.shippingAddress.phone}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block">Street Address</span>
                    <p className="text-stone-700 font-medium">{order.shippingAddress.address}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block">City</span>
                      <p className="text-stone-700 font-bold">{order.shippingAddress.city}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block">PIN Code</span>
                      <p className="text-stone-700 font-bold">{order.shippingAddress.pincode}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-stone-400 text-xs">No address specified.</p>
              )}
            </div>

            {/* Payment security info */}
            <div className="bg-white rounded-[32px] border border-stone-200/50 shadow-sm p-6 lg:p-8 flex flex-col gap-4">
              <h3 className="font-bold text-brand-secondary font-serif text-base flex items-center gap-2 border-b border-stone-100 pb-2.5">
                <CreditCard className="w-4 h-4 text-brand-primary" /> Payment Method
              </h3>
              <div className="text-xs space-y-3.5">
                <div className="flex justify-between items-center bg-stone-50 p-2.5 rounded-xl border border-stone-200/40">
                  <span className="text-stone-500 font-semibold text-[10px] uppercase tracking-wider">Status</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider ${
                    order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {order.paymentStatus || 'Pending'}
                  </span>
                </div>

                <div className="space-y-2 pt-2 text-[11px] text-stone-500">
                  <div className="flex justify-between">
                    <span>Gateway</span>
                    <span className="font-bold text-stone-850">Razorpay</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing</span>
                    <span className="font-bold text-emerald-700 uppercase tracking-wider text-[9px]">Verified Secure</span>
                  </div>
                  {(order as any).razorpayPaymentLinkId && (
                    <div className="space-y-1 pt-2 text-[9px] border-t border-stone-100">
                      <span className="text-stone-400 block uppercase font-bold tracking-wider">Payment ID</span>
                      <span className="font-mono text-stone-500 block truncate">{(order as any).razorpayPaymentLinkId}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
