import { auth } from '@/lib/firebase';
import type { CartItem } from '@/store/useCartStore';

export interface ShippingDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state?: string;
  pincode: string;
}

interface CreateCatalogPaymentLinkPayload {
  items: Array<{
    productId: string;
    weight: string;
    quantity: number;
  }>;
  shippingAddress: ShippingDetails;
  userId?: string;
  callbackUrl?: string;
}

interface CreateCatalogPaymentLinkResponse {
  schemaVersion?: string;
  orderId: string;
  paymentLinkId: string;
  paymentLinkUrl: string;
  paymentStatus?: 'Pending' | 'Paid' | 'Failed';
  paymentLinkStatus?: string;
  amount: number;
  currency: string;
  amountBreakdown?: {
    subtotal: number;
    shipping: number;
    total: number;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function requireString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Invalid payment response: ${fieldName} is missing or invalid.`);
  }
  return value;
}

function requireFiniteNumber(value: unknown, fieldName: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new Error(`Invalid payment response: ${fieldName} is missing or invalid.`);
  }
  return value;
}

function normalizePaymentResponse(data: unknown): CreateCatalogPaymentLinkResponse {
  if (!isRecord(data)) {
    throw new Error('Invalid payment response: expected an object.');
  }

  const orderId = requireString(data.orderId, 'orderId');
  const paymentLinkId = requireString(data.paymentLinkId, 'paymentLinkId');
  const paymentLinkUrl = requireString(data.paymentLinkUrl, 'paymentLinkUrl');
  const amount = requireFiniteNumber(data.amount, 'amount');
  const currency = requireString(data.currency, 'currency');

  const normalized: CreateCatalogPaymentLinkResponse = {
    orderId,
    paymentLinkId,
    paymentLinkUrl,
    amount,
    currency,
  };

  if (typeof data.schemaVersion === 'string' && data.schemaVersion.trim().length > 0) {
    normalized.schemaVersion = data.schemaVersion;
  }

  if (data.paymentStatus === 'Pending' || data.paymentStatus === 'Paid' || data.paymentStatus === 'Failed') {
    normalized.paymentStatus = data.paymentStatus;
  }

  if (typeof data.paymentLinkStatus === 'string' && data.paymentLinkStatus.trim().length > 0) {
    normalized.paymentLinkStatus = data.paymentLinkStatus;
  }

  if (isRecord(data.amountBreakdown)) {
    normalized.amountBreakdown = {
      subtotal: requireFiniteNumber(data.amountBreakdown.subtotal, 'amountBreakdown.subtotal'),
      shipping: requireFiniteNumber(data.amountBreakdown.shipping, 'amountBreakdown.shipping'),
      total: requireFiniteNumber(data.amountBreakdown.total, 'amountBreakdown.total'),
    };
  }

  return normalized;
}

export async function createCatalogPaymentLinkAgent(params: {
  cartItems: CartItem[];
  shippingAddress: ShippingDetails;
  userId?: string;
  callbackUrl?: string;
}): Promise<CreateCatalogPaymentLinkResponse> {
  const payload: CreateCatalogPaymentLinkPayload = {
    items: params.cartItems.map((item) => ({
      productId: item.id,
      weight: item.weight,
      quantity: item.quantity,
    })),
    shippingAddress: params.shippingAddress,
    userId: params.userId,
    callbackUrl: params.callbackUrl,
  };

  const token = await auth.currentUser?.getIdToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch('/api/checkout', {
    method: 'POST',
    headers,
    body: JSON.stringify({ data: payload }),
  });

  if (!response.ok) {
    const errText = await response.text();
    try {
      const parsed = JSON.parse(errText);
      if (parsed.error && parsed.error.message) {
        throw new Error(parsed.error.message);
      }
    } catch {
      // Fallback to raw text
    }
    throw new Error(errText || 'Failed to initiate checkout.');
  }

  const json = await response.json();
  if (json.error) {
    throw new Error(json.error.message || 'Failed to initiate checkout.');
  }
  return normalizePaymentResponse(json.result);
}
