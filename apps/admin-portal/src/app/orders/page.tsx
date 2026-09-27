'use client';

import { useEffect, useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Truck, 
  FileText, 
  ExternalLink, 
  Printer, 
  X, 
  Loader2, 
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Zap,
  Send
} from 'lucide-react';

interface OrderItem {
  id: string;
  productName: string;
  weight: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user?: { name?: string; email?: string; phone?: string };
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  shippingAddress: any;
  adminNotes?: string;
  createdAt: string;
  items: OrderItem[];
}

interface StoreSettings {
  storeName?: string;
  supportEmail?: string;
  supportPhone?: string;
  currency?: string;
}

const statusOptions = ['Ordered', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // Global Alert Message
  const [globalNotification, setGlobalNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Store Settings for invoice
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    storeName: 'Gaon Pure',
    supportEmail: 'contact@gaonpure.com',
    supportPhone: '+91 9876543210',
    currency: 'INR',
  });

  // Dispatch modal state
  const [dispatchModalOrder, setDispatchModalOrder] = useState<Order | null>(null);
  const [courierName, setCourierName] = useState('Delhivery');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [isDispatching, setIsDispatching] = useState(false);

  // Auto Shiprocket loading state per order ID
  const [shiprocketLoadingId, setShiprocketLoadingId] = useState<string | null>(null);

  // WhatsApp modal state
  const [whatsAppModalOrder, setWhatsAppModalOrder] = useState<Order | null>(null);
  const [whatsAppTemplate, setWhatsAppTemplate] = useState<'order_confirmed' | 'order_dispatched' | 'custom'>('order_dispatched');
  const [customWhatsAppText, setCustomWhatsAppText] = useState('');
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [whatsAppStatus, setWhatsAppStatus] = useState<{ success?: string; error?: string } | null>(null);

  // Invoice modal state
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  // Refund modal state
  const [refundModalOrder, setRefundModalOrder] = useState<Order | null>(null);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState('Customer cancellation request');
  const [isRefunding, setIsRefunding] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);
  const [refundSuccess, setRefundSuccess] = useState<string | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setGlobalNotification({ type, message });
    setTimeout(() => {
      setGlobalNotification(null);
    }, 4500);
  };

  const fetchOrders = async (targetPage = page) => {
    setLoading(true);
    try {
      let url = `/api/orders?status=${activeTab}&page=${targetPage}&limit=15`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setOrders(json.orders);
        if (json.pagination) {
          setTotalPages(json.pagination.totalPages);
          setTotalOrders(json.pagination.total);
        }
      }
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const json = await res.json();
      if (json.success && json.settings) {
        setStoreSettings(json.settings);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchOrders(1);
  }, [activeTab]);

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders(1);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, orderStatus: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setOrders(orders.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o)));
        showNotification('success', `Order status updated to ${newStatus}`);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      showNotification('error', 'Failed to update order status');
    }
  };

  // 1-Click Shiprocket Auto Dispatch & AWB Generation
  const handleAutoShiprocket = async (order: Order) => {
    setShiprocketLoadingId(order.id);
    try {
      const res = await fetch('/api/orders/shiprocket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, notifyWhatsApp: true }),
      });

      const json = await res.json();
      if (json.success) {
        setOrders(orders.map((o) => (o.id === order.id ? json.order : o)));
        showNotification(
          'success',
          `Shiprocket AWB ${json.shiprocket?.awbCode || 'Assigned'} & WhatsApp tracking sent to customer!`
        );
      } else {
        showNotification('error', json.error || 'Shiprocket dispatch request failed');
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Error connecting to Shiprocket');
    } finally {
      setShiprocketLoadingId(null);
    }
  };

  const handleDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchModalOrder) return;

    setIsDispatching(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: dispatchModalOrder.id,
          orderStatus: 'Shipped',
          courierName,
          trackingNumber,
          trackingUrl,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setOrders(orders.map((o) => (o.id === dispatchModalOrder.id ? json.order : o)));
        setDispatchModalOrder(null);
        showNotification('success', 'Order marked as Shipped and tracking saved.');
      }
    } catch (err) {
      console.error('Error saving dispatch info:', err);
      showNotification('error', 'Failed to save courier info');
    } finally {
      setIsDispatching(false);
    }
  };

  // WhatsApp Trigger Handler
  const openWhatsAppModal = (order: Order) => {
    setWhatsAppModalOrder(order);
    setWhatsAppTemplate(order.orderStatus === 'Shipped' ? 'order_dispatched' : 'order_confirmed');
    setCustomWhatsAppText('');
    setWhatsAppStatus(null);
  };

  const handleSendWhatsAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsAppModalOrder) return;

    setIsSendingWhatsApp(true);
    setWhatsAppStatus(null);

    try {
      const res = await fetch('/api/orders/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: whatsAppModalOrder.id,
          templateType: whatsAppTemplate,
          customMessage: whatsAppTemplate === 'custom' ? customWhatsAppText : undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setWhatsAppStatus({ success: 'WhatsApp message delivered successfully!' });
        setTimeout(() => {
          setWhatsAppModalOrder(null);
        }, 1500);
      } else {
        setWhatsAppStatus({ error: json.error || 'Failed to send WhatsApp message' });
      }
    } catch (err: any) {
      setWhatsAppStatus({ error: err.message || 'Error communicating with WhatsApp API' });
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  const openRefundModal = (order: Order) => {
    setRefundModalOrder(order);
    setRefundAmount(Number(order.totalAmount));
    setRefundReason('Customer cancelled order');
    setRefundError(null);
    setRefundSuccess(null);
  };

  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundModalOrder) return;

    setIsRefunding(true);
    setRefundError(null);
    setRefundSuccess(null);

    try {
      const res = await fetch('/api/orders/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: refundModalOrder.id,
          amount: refundAmount,
          reason: refundReason,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setRefundSuccess(`Refund of ₹${refundAmount} issued successfully! (ID: ${json.refund?.id || 'OK'})`);
        setOrders(orders.map((o) => (o.id === refundModalOrder.id ? json.order : o)));
        setTimeout(() => {
          setRefundModalOrder(null);
        }, 1800);
      } else {
        setRefundError(json.error || 'Failed to issue refund');
      }
    } catch (err: any) {
      setRefundError(err.message || 'Error communicating with refund gateway');
    } finally {
      setIsRefunding(false);
    }
  };

  const tabs = ['ALL', 'Ordered', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Global Notification Banner */}
      {globalNotification && (
        <div className={`p-4 rounded-2xl flex items-center justify-between shadow-md transition-all ${
          globalNotification.type === 'success' 
            ? 'bg-emerald-600 text-white' 
            : 'bg-red-600 text-white'
        }`}>
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            {globalNotification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{globalNotification.message}</span>
          </div>
          <button onClick={() => setGlobalNotification(null)} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Orders & Dispatch</h1>
          <p className="text-xs text-stone-500 mt-1">
            Automate Shiprocket AWB creation, send Meta WhatsApp tracking alerts & manage Razorpay refunds
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search order #, customer, tracking..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </form>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-stone-200 pb-px overflow-x-auto text-xs">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {tab === 'ALL' ? 'All Orders' : tab}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center items-center py-20 text-stone-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          <span className="text-xs font-medium">Fetching orders...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="font-bold text-stone-800 text-sm">No orders found</h3>
          <p className="text-xs text-stone-500 mt-1">There are no orders matching this filter</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const address = order.shippingAddress;
            const isAutoDispatching = shiprocketLoadingId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4 hover:border-stone-300 transition-colors"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-stone-900 text-sm">{order.orderNumber}</span>
                    <span className="text-xs text-stone-400">
                      {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      order.paymentStatus === 'Paid'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : order.paymentStatus === 'Refunded'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      Payment: {order.paymentStatus}
                    </span>
                  </div>

                  {/* Actions & Status Dropdown */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-stone-300 bg-stone-50 focus:ring-2 focus:ring-emerald-500"
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>

                    {/* 1-Click Shiprocket Auto-Dispatch */}
                    <button
                      onClick={() => handleAutoShiprocket(order)}
                      disabled={isAutoDispatching}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-95 transition-opacity shadow-sm disabled:opacity-50"
                      title="Generate Shiprocket AWB & Trigger WhatsApp Tracking Link"
                    >
                      {isAutoDispatching ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Zap className="w-3.5 h-3.5" />
                      )}
                      {order.trackingNumber ? 'Re-Sync Shiprocket' : 'Auto Shiprocket'}
                    </button>

                    {/* WhatsApp Update */}
                    <button
                      onClick={() => openWhatsAppModal(order)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-sm"
                      title="Send WhatsApp Notification"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      WhatsApp
                    </button>

                    {/* Manual Dispatch Button */}
                    <button
                      onClick={() => {
                        setDispatchModalOrder(order);
                        setCourierName(order.courierName || 'Delhivery');
                        setTrackingNumber(order.trackingNumber || '');
                        setTrackingUrl(order.trackingUrl || '');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-stone-900 text-white hover:bg-stone-800 transition-colors shadow-sm"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      {order.trackingNumber ? 'Edit Courier' : 'Dispatch'}
                    </button>

                    {/* Tax Invoice */}
                    <button
                      onClick={() => setInvoiceOrder(order)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors shadow-sm"
                    >
                      <FileText className="w-3.5 h-3.5 text-stone-500" />
                      Invoice
                    </button>

                    {/* Issue Refund Button */}
                    {order.paymentStatus === 'Paid' && (
                      <button
                        onClick={() => openRefundModal(order)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors shadow-sm"
                        title="Issue Razorpay Refund"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Refund
                      </button>
                    )}
                  </div>
                </div>

                {/* Order Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  {/* Customer & Shipping */}
                  <div className="space-y-1.5 text-stone-600">
                    <div className="font-bold text-stone-800 uppercase tracking-wider text-[10px]">Customer & Destination</div>
                    <div className="font-semibold text-stone-900">{order.user?.name || address?.name || 'Customer'}</div>
                    <div>{order.user?.email || address?.email || 'N/A'}</div>
                    <div>Phone: {order.user?.phone || address?.phone || 'N/A'}</div>
                    <div className="text-stone-500 text-[11px] mt-1">
                      {address?.street}, {address?.city}, {address?.state} - {address?.pincode}
                    </div>
                  </div>

                  {/* Shipment Tracking Info */}
                  <div className="space-y-1.5 text-stone-600">
                    <div className="font-bold text-stone-800 uppercase tracking-wider text-[10px]">Logistics / AWB</div>
                    {order.trackingNumber ? (
                      <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/60 space-y-1">
                        <div className="font-semibold text-stone-800">{order.courierName || 'Shiprocket Hub'}</div>
                        <div className="font-mono text-emerald-700 font-bold">AWB: {order.trackingNumber}</div>
                        {order.trackingUrl && (
                          <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1 mt-1 text-[11px]">
                            Track Package <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="text-stone-400 italic text-[11px]">
                        No courier assigned. Click <span className="font-semibold text-emerald-700">"Auto Shiprocket"</span> for instant AWB generation.
                      </div>
                    )}
                    {order.razorpayPaymentId && (
                      <div className="text-[10px] text-stone-500 font-mono pt-1">
                        Gateway Ref: <span className="font-bold text-stone-700">{order.razorpayPaymentId}</span>
                      </div>
                    )}
                  </div>

                  {/* Items & Total Breakdown */}
                  <div className="space-y-2">
                    <div className="font-bold text-stone-800 uppercase tracking-wider text-[10px]">Items Ordered ({order.items.length})</div>
                    <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                      {order.items.map((it) => (
                        <div key={it.id} className="flex items-center justify-between text-stone-700 bg-stone-50/70 px-2.5 py-1.5 rounded-lg">
                          <div>
                            <span className="font-medium text-stone-900">{it.productName}</span>
                            <span className="text-stone-400 ml-1.5">({it.weight}) × {it.quantity}</span>
                          </div>
                          <span className="font-semibold">₹{it.totalPrice}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-stone-100 flex justify-between font-black text-sm text-stone-900">
                      <span>Total Amount:</span>
                      <span>₹{order.totalAmount}</span>
                    </div>
                  </div>
                </div>

                {order.adminNotes && (
                  <div className="p-2.5 bg-stone-50 rounded-xl text-[11px] text-stone-600 border border-stone-200/60 font-mono whitespace-pre-line">
                    {order.adminNotes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white px-6 py-4 rounded-2xl border border-stone-200 shadow-sm">
          <div className="text-xs text-stone-500 font-medium">
            Page <span className="font-bold text-stone-900">{page}</span> of{' '}
            <span className="font-bold text-stone-900">{totalPages}</span> ({totalOrders} total orders)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-stone-200 hover:bg-stone-50 disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <span className="text-xs font-bold text-stone-700 px-2">{page}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-stone-200 hover:bg-stone-50 disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* WHATSAPP TRIGGER MODAL */}
      {whatsAppModalOrder && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-stone-900 text-sm">
                  Send WhatsApp Alert: {whatsAppModalOrder.orderNumber}
                </h3>
              </div>
              <button onClick={() => setWhatsAppModalOrder(null)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {whatsAppStatus?.success && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{whatsAppStatus.success}</span>
              </div>
            )}

            {whatsAppStatus?.error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{whatsAppStatus.error}</span>
              </div>
            )}

            <form onSubmit={handleSendWhatsAppSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl space-y-1 text-stone-700">
                <div>Recipient: <span className="font-bold">{whatsAppModalOrder.user?.name || whatsAppModalOrder.shippingAddress?.name || 'Customer'}</span></div>
                <div>Phone: <span className="font-mono font-semibold">{whatsAppModalOrder.user?.phone || whatsAppModalOrder.shippingAddress?.phone || 'N/A'}</span></div>
                {whatsAppModalOrder.trackingNumber && (
                  <div>AWB / Tracking: <span className="font-mono font-bold text-emerald-700">{whatsAppModalOrder.trackingNumber}</span></div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Select Message Template</label>
                <select
                  value={whatsAppTemplate}
                  onChange={(e: any) => setWhatsAppTemplate(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="order_dispatched">Order Dispatched (With Live Tracking Link)</option>
                  <option value="order_confirmed">Order Confirmed (Harvest Confirmation)</option>
                  <option value="custom">Custom Text Message</option>
                </select>
              </div>

              {whatsAppTemplate === 'custom' && (
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Custom Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Enter custom message to send directly to customer..."
                    value={customWhatsAppText}
                    onChange={(e) => setCustomWhatsAppText(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-stone-100">
                <a
                  href={(() => {
                    const rawPhone = whatsAppModalOrder.user?.phone || whatsAppModalOrder.shippingAddress?.phone || '';
                    const cleanPhone = rawPhone.replace(/\D/g, '').replace(/^91/, '');
                    const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                    const customerName = whatsAppModalOrder.user?.name || whatsAppModalOrder.shippingAddress?.name || 'Customer';
                    const trackingLink = whatsAppModalOrder.trackingUrl || `https://stage.gaonpure.com/orders/${whatsAppModalOrder.id}`;
                    const courier = whatsAppModalOrder.courierName || 'Shiprocket Express';
                    const awb = whatsAppModalOrder.trackingNumber || 'Assigned upon packing';
                    
                    const text = customWhatsAppText || (whatsAppModalOrder.orderStatus === 'Shipped'
                      ? `🚚 *Gaon Pure — Order Dispatched!*\n\nNamaste *${customerName}*,\n\nYour order *#${whatsAppModalOrder.orderNumber}* has been dispatched via *${courier}*.\n\n🔍 *AWB:* ${awb}\n🌐 *Track Live:* ${trackingLink}\n\n_Gaon Pure Logistics_`
                      : `🌾 *Gaon Pure — Order Confirmed!*\n\nNamaste *${customerName}*,\n\nYour order *#${whatsAppModalOrder.orderNumber}* (₹${whatsAppModalOrder.totalAmount}) is confirmed and being prepared fresh!\n\n🌐 *View Details:* ${trackingLink}\n\n_Gaon Pure Team_`);

                    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
                  })()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-4 py-2 font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  Open in WhatsApp Web
                </a>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setWhatsAppModalOrder(null)}
                    className="px-4 py-2 font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingWhatsApp}
                    className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSendingWhatsApp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Send via Meta API
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANUAL DISPATCH MODAL */}
      {dispatchModalOrder && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-sm">
                Dispatch Order: {dispatchModalOrder.orderNumber}
              </h3>
              <button onClick={() => setDispatchModalOrder(null)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDispatchSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Courier Partner</label>
                <select
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Delhivery">Delhivery</option>
                  <option value="Shiprocket">Shiprocket (General)</option>
                  <option value="BlueDart">BlueDart</option>
                  <option value="DTDC">DTDC</option>
                  <option value="India Post">India Post Speed Post</option>
                  <option value="Shadowfax">Shadowfax</option>
                  <option value="Xpressbees">Xpressbees</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Tracking Number / AWB</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 14209384752"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Tracking URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://delhivery.com/track/..."
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setDispatchModalOrder(null)}
                  className="px-4 py-2 font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDispatching}
                  className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isDispatching && <Loader2 className="w-4 h-4 animate-spin" />}
                  Mark Shipped & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RAZORPAY REFUND MODAL */}
      {refundModalOrder && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-stone-900 text-sm">
                  Issue Refund: {refundModalOrder.orderNumber}
                </h3>
              </div>
              <button onClick={() => setRefundModalOrder(null)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {refundSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{refundSuccess}</span>
              </div>
            )}

            {refundError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{refundError}</span>
              </div>
            )}

            <form onSubmit={handleRefundSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-purple-50 rounded-xl text-purple-900 border border-purple-100 space-y-1">
                <div className="font-bold">Razorpay Payment Reference:</div>
                <div className="font-mono text-[11px]">{refundModalOrder.razorpayPaymentId || 'Direct / Offline Payment'}</div>
                <div className="text-[10px] text-purple-700">Total Paid by Customer: ₹{refundModalOrder.totalAmount}</div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Refund Amount (₹)</label>
                <input
                  type="number"
                  required
                  step="any"
                  max={Number(refundModalOrder.totalAmount)}
                  min={1}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Reason for Refund</label>
                <input
                  type="text"
                  required
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setRefundModalOrder(null)}
                  className="px-4 py-2 font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRefunding}
                  className="px-5 py-2 font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isRefunding && <Loader2 className="w-4 h-4 animate-spin" />}
                  Execute Gateway Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE GST INVOICE MODAL */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 space-y-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between no-print border-b border-stone-200 pb-4">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Tax Invoice Preview</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-sm"
                >
                  <Printer className="w-4 h-4" /> Print / Save as PDF
                </button>
                <button onClick={() => setInvoiceOrder(null)} className="text-stone-400 hover:text-stone-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Container */}
            <div id="printable-invoice" className="space-y-6 text-stone-800 text-xs">
              {/* Invoice Header */}
              <div className="flex justify-between items-start border-b border-stone-200 pb-6">
                <div>
                  <h2 className="text-xl font-black text-stone-900 tracking-tight">
                    {storeSettings.storeName || 'GAON PURE'}
                  </h2>
                  <p className="text-[11px] text-stone-500 mt-1">Authentic Pure Organic Products</p>
                  <p className="text-[11px] text-stone-500">Website: https://gaonpure.com</p>
                  <p className="text-[11px] text-stone-500">Email: {storeSettings.supportEmail || 'contact@gaonpure.com'}</p>
                  <p className="text-[11px] text-stone-500">Phone: {storeSettings.supportPhone || '+91 9876543210'}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-emerald-800">TAX INVOICE</div>
                  <div className="font-mono font-bold mt-1">Invoice #: {invoiceOrder.orderNumber}</div>
                  <div className="text-stone-500 mt-0.5">
                    Date: {new Date(invoiceOrder.createdAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Bill To / Ship To */}
              <div className="grid grid-cols-2 gap-6 bg-stone-50 p-4 rounded-xl">
                <div>
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Billed To</div>
                  <div className="font-bold text-stone-900">{invoiceOrder.user?.name || 'Customer'}</div>
                  <div>{invoiceOrder.user?.email || 'N/A'}</div>
                  <div>Phone: {invoiceOrder.user?.phone || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Shipping Destination</div>
                  <div>{invoiceOrder.shippingAddress?.street}</div>
                  <div>{invoiceOrder.shippingAddress?.city}, {invoiceOrder.shippingAddress?.state}</div>
                  <div className="font-bold">PIN: {invoiceOrder.shippingAddress?.pincode}</div>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs border border-stone-200 rounded-lg overflow-hidden">
                <thead className="bg-stone-100 text-stone-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Item Description</th>
                    <th className="p-3">Weight</th>
                    <th className="p-3 text-right">Price</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {invoiceOrder.items.map((it, idx) => (
                    <tr key={it.id}>
                      <td className="p-3 text-stone-400">{idx + 1}</td>
                      <td className="p-3 font-semibold text-stone-900">{it.productName}</td>
                      <td className="p-3 text-stone-500">{it.weight}</td>
                      <td className="p-3 text-right">₹{it.unitPrice}</td>
                      <td className="p-3 text-center font-bold">{it.quantity}</td>
                      <td className="p-3 text-right font-bold">₹{it.totalPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal:</span>
                    <span>₹{invoiceOrder.subtotal || invoiceOrder.totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Delivery Fee:</span>
                    <span>{Number(invoiceOrder.deliveryFee) === 0 ? 'FREE' : `₹${invoiceOrder.deliveryFee}`}</span>
                  </div>
                  {Number(invoiceOrder.discountAmount) > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Discount:</span>
                      <span>-₹{invoiceOrder.discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-stone-300 font-black text-base text-stone-900">
                    <span>Total Amount:</span>
                    <span>₹{invoiceOrder.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center pt-6 border-t border-stone-200 text-stone-400 text-[10px]">
                Thank you for supporting traditional, wholesome rural farming with Gaon Pure!
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
