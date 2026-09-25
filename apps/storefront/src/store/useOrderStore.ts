import { db, auth } from '@/lib/firebase';
import { collection, getDocs, query, where, onSnapshot, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';

export type OrderStatus = 'Ordered' | 'Payment Pending' | 'Confirmed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled' | 'Return';

export interface Order {
  id: string;
  orderNumber?: string;
  userId: string;
  date: string;
  createdAt?: string;
  items: any[];
  totalAmount: number;
  subtotal?: number;
  deliveryFee?: number;
  discountAmount?: number;
  shippingAddress: any;
  customerName?: string;
  customerEmail?: string;
  paymentStatus: string;
  status: OrderStatus;
  orderStatus?: OrderStatus;
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  deliveryType?: 'Digital' | 'Physical';
  trackingUpdates?: { status: OrderStatus; timestamp: string; note?: string }[];
}

const ordersCollection = collection(db, 'orders');

export const createOrder = async (orderData: Partial<Order>, userId: string): Promise<Order> => {
  const now = new Date().toISOString();

  // 1. Write to Neon PostgreSQL via API route
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        items: orderData.items || [],
        totalAmount: orderData.totalAmount || 0,
        subtotal: orderData.subtotal || orderData.totalAmount || 0,
        deliveryFee: orderData.deliveryFee || 0,
        discountAmount: orderData.discountAmount || 0,
        shippingAddress: orderData.shippingAddress || {},
        paymentStatus: orderData.paymentStatus || 'Pending',
      }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.order) {
        return {
          id: json.order.id,
          orderNumber: json.order.orderNumber,
          userId: json.order.userId,
          date: json.order.createdAt,
          items: json.order.items,
          totalAmount: Number(json.order.totalAmount),
          shippingAddress: json.order.shippingAddress,
          paymentStatus: json.order.paymentStatus,
          status: (json.order.orderStatus as OrderStatus) || 'Ordered',
          trackingUpdates: [{ status: 'Ordered', timestamp: now, note: 'Order placed in system' }],
        };
      }
    }
  } catch (err) {
    console.warn('Neon order creation error, trying Firestore fallback:', err);
  }

  // Fallback to Firestore
  const newOrder: Omit<Order, 'id'> = {
    userId,
    date: now,
    items: orderData.items || [],
    totalAmount: orderData.totalAmount || 0,
    shippingAddress: orderData.shippingAddress || {},
    customerName: orderData.customerName || '',
    customerEmail: orderData.customerEmail || '',
    paymentStatus: orderData.paymentStatus || 'Pending',
    deliveryType: orderData.deliveryType || 'Physical',
    status: 'Ordered',
    trackingUpdates: [
      {
        status: 'Ordered',
        timestamp: now,
        note: 'Order placed waiting for confirmation',
      },
    ],
  };

  const docRef = await addDoc(ordersCollection, newOrder);
  return { id: docRef.id, ...newOrder };
};

export const getOrders = async (): Promise<Order[]> => {
  try {
    const user = auth.currentUser;
    if (user?.uid) {
      const res = await fetch(`/api/orders?userId=${user.uid}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.orders) {
          return json.orders.map((o: any) => ({
            id: o.id,
            orderNumber: o.orderNumber,
            userId: o.userId,
            date: o.createdAt,
            createdAt: o.createdAt,
            items: o.items,
            totalAmount: Number(o.totalAmount),
            shippingAddress: o.shippingAddress,
            paymentStatus: o.paymentStatus,
            status: (o.orderStatus as OrderStatus) || 'Ordered',
            orderStatus: o.orderStatus,
            courierName: o.courierName,
            trackingNumber: o.trackingNumber,
            trackingUrl: o.trackingUrl,
            trackingUpdates: [
              { status: o.orderStatus, timestamp: o.updatedAt || o.createdAt, note: `Status: ${o.orderStatus}` },
            ],
          }));
        }
      }
    }
  } catch (err) {
    console.warn('Error fetching orders from PostgreSQL API:', err);
  }

  return [];
};

export const getOrderById = async (id: string): Promise<Order | null> => {
  // 1. Try Neon PostgreSQL
  try {
    const res = await fetch(`/api/orders?orderId=${id}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.order) {
        const o = json.order;
        return {
          id: o.id,
          orderNumber: o.orderNumber,
          userId: o.userId,
          date: o.createdAt,
          createdAt: o.createdAt,
          items: o.items,
          totalAmount: Number(o.totalAmount),
          shippingAddress: o.shippingAddress,
          paymentStatus: o.paymentStatus,
          status: (o.orderStatus as OrderStatus) || 'Ordered',
          orderStatus: o.orderStatus,
          courierName: o.courierName,
          trackingNumber: o.trackingNumber,
          trackingUrl: o.trackingUrl,
          trackingUpdates: [
            { status: o.orderStatus, timestamp: o.updatedAt || o.createdAt, note: `Courier: ${o.courierName || 'Pending'} (AWB: ${o.trackingNumber || 'Pending'})` },
          ],
        };
      }
    }
  } catch (err) {
    console.warn('Error fetching order from PostgreSQL API:', err);
  }

  // 2. Fallback to Firestore
  try {
    const orderDocRef = doc(db, 'orders', id);
    const snap = await getDoc(orderDocRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as Omit<Order, 'id'>) };
  } catch {
    return null;
  }
};

export const updateOrderStatus = async (orderId: string, newStatus: OrderStatus, note?: string) => {
  try {
    const res = await fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, orderStatus: newStatus }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.order) return json.order;
    }
  } catch (err) {
    console.warn('Error updating order status in PostgreSQL:', err);
  }

  // Fallback to Firestore
  try {
    const orderDocRef = doc(db, 'orders', orderId);
    const orderSnapshot = await getDoc(orderDocRef);
    if (orderSnapshot.exists()) {
      const currentOrder = orderSnapshot.data() as Omit<Order, 'id'>;
      const trackingUpdates = [...(currentOrder.trackingUpdates || []), { status: newStatus, timestamp: new Date().toISOString(), note }];
      await updateDoc(orderDocRef, { status: newStatus, trackingUpdates });
      return { id: orderId, ...currentOrder, status: newStatus, trackingUpdates };
    }
  } catch {}

  return null;
};

export const subscribeToOrders = (userId: string, callback: (orders: Order[]) => void) => {
  // Fetch immediately from PostgreSQL
  getOrders().then((orders) => {
    if (orders.length > 0) callback(orders);
  });

  const orderQuery = query(ordersCollection, where('userId', '==', userId));
  return onSnapshot(orderQuery, (snapshot) => {
    if (!snapshot.empty) {
      const orders: Order[] = [];
      snapshot.forEach((docSnap) => {
        orders.push({ id: docSnap.id, ...(docSnap.data() as Omit<Order, 'id'>) });
      });
      callback(orders);
    }
  }, () => {});
};

export const getAllOrders = async (): Promise<Order[]> => {
  return getOrders();
};
