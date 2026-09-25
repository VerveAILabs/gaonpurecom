'use client';

import { useState, useEffect, Fragment } from 'react';
import { getAllOrders, updateOrderStatus, Order, OrderStatus } from '@/store/useOrderStore';
import { 
  ChevronDown, 
  ChevronUp, 
  Package, 
  MapPin, 
  CreditCard, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  Clock, 
  ExternalLink 
} from 'lucide-react';

export default function OrderManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    'Ordered': 'bg-blue-50 text-blue-700 border border-blue-200',
    'Payment Pending': 'bg-amber-50 text-amber-700 border border-amber-200',
    'Confirmed': 'bg-cyan-50 text-cyan-700 border border-cyan-200',
    'Shipped': 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    'Out for Delivery': 'bg-orange-50 text-orange-700 border border-orange-200',
    'Delivered': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    'Cancelled': 'bg-rose-50 text-rose-700 border border-rose-200',
    'Return': 'bg-pink-50 text-pink-700 border border-pink-200',
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, newStatus, `Status updated to ${newStatus} by admin.`);
      await fetchOrders();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    } finally {
      setUpdating(null);
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-stone-200 shadow-sm">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-primary border-t-transparent mb-4"></div>
        <p className="text-stone-500 font-medium">Loading customer orders...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-stone-600 border-collapse">
          <thead className="bg-stone-50 border-b border-stone-200 text-stone-700">
            <tr>
              <th className="px-6 py-4 font-semibold w-10"></th>
              <th className="px-6 py-4 font-semibold">Order ID</th>
              <th className="px-6 py-4 font-semibold">Customer</th>
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 font-semibold">Amount</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Fulfillment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {orders.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              return (
                <Fragment key={order.id}>
                  {/* Main Row */}
                  <tr 
                    onClick={() => toggleExpand(order.id)}
                    className="hover:bg-stone-50/70 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-stone-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-stone-400" />
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-stone-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-stone-900">{order.customerName}</div>
                      <div className="text-xs text-stone-500">{order.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-stone-800">{new Date(order.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</div>
                      <div className="text-[10px] text-stone-400">{new Date(order.date).toLocaleTimeString('en-IN', { timeStyle: 'short' })}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-stone-900">
                      ₹{order.totalAmount}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || 'bg-stone-100 text-stone-800'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <select
                        disabled={updating === order.id}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        className="bg-white border text-sm border-stone-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-primary font-medium text-stone-700"
                      >
                        {Object.keys(statusColors).map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                  </tr>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <tr className="bg-stone-50/50">
                      <td colSpan={7} className="px-8 py-6 border-t border-stone-200">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                          
                          {/* Col 1: Ordered Items */}
                          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col gap-4">
                            <h4 className="font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                              <Package className="w-4 h-4 text-brand-primary" />
                              Items Ordered
                            </h4>
                            <div className="divide-y divide-stone-100 overflow-y-auto max-h-60 space-y-3">
                              {order.items && order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center pt-3 first:pt-0">
                                  <div>
                                    <div className="font-semibold text-stone-800 text-sm">{item.name}</div>
                                    <div className="text-xs text-stone-500">Qty: {item.quantity} × {item.weight}</div>
                                  </div>
                                  <div className="font-bold text-stone-800 text-sm">
                                    ₹{(item.price || item.unitPrice || 0) * item.quantity}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="border-t border-stone-100 pt-3 mt-auto flex justify-between font-bold text-stone-900">
                              <span>Total Paid</span>
                              <span className="text-brand-secondary text-base">₹{order.totalAmount}</span>
                            </div>
                          </div>

                          {/* Col 2: Shipping & Delivery Info */}
                          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col gap-4">
                            <h4 className="font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                              <MapPin className="w-4 h-4 text-brand-primary" />
                              Shipping Address
                            </h4>
                            {order.shippingAddress ? (
                              <div className="text-sm text-stone-600 space-y-2.5">
                                <p className="font-semibold text-stone-800 flex items-center gap-2">
                                  <User className="w-3.5 h-3.5 text-stone-400" />
                                  {order.shippingAddress.name}
                                </p>
                                <p className="flex items-center gap-2">
                                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                                  +91 {order.shippingAddress.phone}
                                </p>
                                <p className="flex items-start gap-2">
                                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                                  <span className="leading-tight">
                                    {order.shippingAddress.address}, {order.shippingAddress.city} - {order.shippingAddress.pincode}
                                  </span>
                                </p>
                              </div>
                            ) : (
                              <p className="text-stone-400 text-xs">No address specified.</p>
                            )}
                          </div>

                          {/* Col 3: Payment & Fulfillment History */}
                          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col gap-4">
                            <h4 className="font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                              <CreditCard className="w-4 h-4 text-brand-primary" />
                              Payment & Status
                            </h4>
                            <div className="text-sm space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-stone-500">Payment Status</span>
                                <span className={`font-semibold px-2 py-0.5 rounded text-xs ${
                                  order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {order.paymentStatus || 'Pending'}
                                </span>
                              </div>
                              
                              {(order as any).razorpayPaymentLinkId && (
                                <div className="space-y-1 bg-stone-50 p-2.5 rounded-lg border border-stone-200 text-xs text-stone-500">
                                  <div className="font-semibold text-stone-700">Razorpay Payment Link</div>
                                  <div className="truncate font-mono">{ (order as any).razorpayPaymentLinkId }</div>
                                  { (order as any).razorpayPaymentLinkUrl && (
                                    <a 
                                      href={(order as any).razorpayPaymentLinkUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-brand-primary font-bold hover:underline mt-1"
                                    >
                                      Open Payment Link <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="border-t border-stone-100 pt-3">
                              <div className="font-bold text-stone-800 text-xs mb-2 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-stone-400" /> Update Timeline
                              </div>
                              <div className="space-y-2 overflow-y-auto max-h-32 pr-2 text-xs">
                                {order.trackingUpdates && order.trackingUpdates.map((update, idx) => (
                                  <div key={idx} className="flex gap-2 border-l border-stone-200 pl-3 relative pb-2 last:pb-0">
                                    <div className="absolute w-2 h-2 rounded-full bg-brand-primary -left-1 top-1"></div>
                                    <div>
                                      <div className="font-semibold text-stone-700">{update.status}</div>
                                      <div className="text-[10px] text-stone-400">{new Date(update.timestamp).toLocaleDateString('en-IN')} {new Date(update.timestamp).toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit'})}</div>
                                      {update.note && <div className="text-stone-500 italic mt-0.5">{update.note}</div>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-stone-500">
                  No customer orders found in the database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
