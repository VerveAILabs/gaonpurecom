export interface ShiprocketCredentials {
  email?: string;
  password?: string;
}

export interface ShiprocketAddress {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state?: string;
  pincode: string;
}

export interface ShiprocketOrderItem {
  name: string;
  sku?: string;
  units: number;
  selling_price: number;
  discount?: number;
  tax?: number;
}

export interface CreateShiprocketOrderPayload {
  order_id: string;
  order_date: string;
  pickup_location?: string;
  billing_customer_name: string;
  billing_last_name?: string;
  billing_address: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  order_items: ShiprocketOrderItem[];
  payment_method: 'Prepaid' | 'COD';
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number; // in kg
}

export interface ShiprocketAWBResult {
  success: boolean;
  shipmentId?: number;
  orderId?: number;
  awbCode?: string;
  courierName?: string;
  trackingUrl?: string;
  labelUrl?: string;
  manifestUrl?: string;
  error?: string;
}

export interface CourierServiceabilityResult {
  success: boolean;
  recommendedCourier?: string;
  couriers?: Array<{
    courierName: string;
    courierCompanyId: number;
    rate: number;
    estimatedDeliveryDays: string;
    rating: number;
    codAvailable: boolean;
  }>;
  error?: string;
}

const BASE_URL = process.env.SHIPROCKET_API_BASE_URL || 'https://apiv2.shiprocket.in/v1/external';

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Authenticates with Shiprocket API and returns a cached JWT bearer token.
 */
export async function getShiprocketToken(): Promise<string | null> {
  if (process.env.SHIPROCKET_TOKEN) {
    return process.env.SHIPROCKET_TOKEN;
  }

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    return null;
  }

  const now = Date.now();
  if (cachedToken && now < tokenExpiry) {
    return cachedToken;
  }

  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.warn('Shiprocket authentication failed:', err);
      return null;
    }

    const json = await res.json();
    if (json.token) {
      cachedToken = json.token;
      // Cache token for 9 days (Shiprocket tokens typically valid for 10 days)
      tokenExpiry = now + 9 * 24 * 60 * 60 * 1000;
      return cachedToken;
    }
  } catch (err) {
    console.error('Shiprocket auth network error:', err);
  }

  return null;
}

/**
 * Checks courier serviceability, rates, and EDD between source and destination pincodes.
 */
export async function checkShiprocketServiceability(params: {
  pickupPincode?: string;
  deliveryPincode: string;
  weightKg?: number;
  isCod?: boolean;
}): Promise<CourierServiceabilityResult> {
  const token = await getShiprocketToken();
  if (!token) {
    return { success: false, error: 'Shiprocket credentials not configured' };
  }

  const pickup = params.pickupPincode || '411001'; // Default Pune hub
  const delivery = params.deliveryPincode.replace(/\D/g, '').slice(0, 6);
  const weight = Math.max(0.5, params.weightKg || 1);
  const cod = params.isCod ? 1 : 0;

  const url = `${BASE_URL}/courier/serviceability/?pickup_postcode=${pickup}&delivery_postcode=${delivery}&weight=${weight}&cod=${cod}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: `Serviceability error: ${err}` };
    }

    const json = await res.json();
    const availableCouriers = json.data?.available_courier_companies || [];

    const mappedCouriers = availableCouriers.map((c: any) => ({
      courierName: c.courier_name,
      courierCompanyId: c.courier_company_id,
      rate: Number(c.rate),
      estimatedDeliveryDays: c.etd || '3-5 days',
      rating: Number(c.rating || 4.5),
      codAvailable: c.cod === 1,
    }));

    return {
      success: true,
      recommendedCourier: json.data?.recommended_courier_company_id 
        ? mappedCouriers.find((c: any) => c.courierCompanyId === json.data.recommended_courier_company_id)?.courierName
        : mappedCouriers[0]?.courierName || 'Delhivery',
      couriers: mappedCouriers,
    };
  } catch (err: any) {
    console.error('Shiprocket serviceability check error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Automatically creates an ad-hoc order on Shiprocket and requests AWB assignment.
 */
export async function createAndAssignShiprocketShipment(order: {
  id: string;
  orderNumber: string;
  totalAmount: any;
  subtotal?: any;
  shippingAddress: any;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: any;
    weight?: string;
  }>;
}): Promise<ShiprocketAWBResult> {
  const token = await getShiprocketToken();
  if (!token) {
    return {
      success: false,
      error: 'Shiprocket credentials not configured (SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD).',
    };
  }

  const addr: ShiprocketAddress = typeof order.shippingAddress === 'string'
    ? JSON.parse(order.shippingAddress)
    : order.shippingAddress || {};

  // Compute total package weight in kg
  let totalWeightKg = 0;
  const orderItems: ShiprocketOrderItem[] = order.items.map((it: any, idx: number) => {
    const qty = Number(it.quantity || 1);
    const weightStr = (it.weight || '1kg').toLowerCase();
    let unitWeightKg = 1;
    if (weightStr.includes('kg')) {
      unitWeightKg = parseFloat(weightStr.replace('kg', '')) || 1;
    } else if (weightStr.includes('g')) {
      unitWeightKg = (parseFloat(weightStr.replace('g', '')) || 500) / 1000;
    } else if (weightStr.includes('l')) {
      unitWeightKg = parseFloat(weightStr.replace('l', '')) || 1;
    } else if (weightStr.includes('ml')) {
      unitWeightKg = (parseFloat(weightStr.replace('ml', '')) || 500) / 1000;
    }
    totalWeightKg += unitWeightKg * qty;

    return {
      name: it.productName,
      sku: it.sku || it.variantId || `GP-ITEM-${idx + 1}`,
      units: qty,
      selling_price: Number(it.unitPrice),
      discount: 0,
      tax: 0,
    };
  });

  const now = new Date();
  const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const cleanPhone = (addr.phone || '9999999999').replace(/\D/g, '').slice(-10);
  const fullName = (addr.name || 'Valued Customer').trim();
  const nameParts = fullName.split(' ');
  const firstName = nameParts[0] || 'Customer';
  const lastName = nameParts.slice(1).join(' ') || '.';

  const payload: CreateShiprocketOrderPayload = {
    order_id: order.orderNumber,
    order_date: formattedDate,
    pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: addr.address || 'Street Address',
    billing_city: addr.city || 'Pune',
    billing_state: addr.state || 'Maharashtra',
    billing_pincode: (addr.pincode || '411001').replace(/\D/g, '').slice(0, 6),
    billing_country: 'India',
    billing_email: addr.email || 'order@gaonpure.com',
    billing_phone: cleanPhone,
    shipping_is_billing: true,
    order_items: orderItems,
    payment_method: 'Prepaid',
    sub_total: Number(order.subtotal || order.totalAmount),
    length: 15,
    breadth: 15,
    height: 15,
    weight: Math.max(0.5, Math.round(totalWeightKg * 100) / 100),
  };

  try {
    // 1. Create order on Shiprocket
    const orderRes = await fetch(`${BASE_URL}/orders/create/adhoc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!orderRes.ok) {
      const errText = await orderRes.text();
      return { success: false, error: `Shiprocket order creation error: ${errText}` };
    }

    const orderJson = await orderRes.json();
    const shipmentId = orderJson.shipment_id;
    const shiprocketOrderId = orderJson.order_id;

    if (!shipmentId) {
      return { success: false, error: 'Shiprocket returned no shipment_id' };
    }

    // 2. Request AWB assignment for this shipment
    let awbCode = '';
    let courierName = 'Delhivery (via Shiprocket)';
    let trackingUrl = '';

    try {
      // Find optimal courier if possible
      const serviceability = await checkShiprocketServiceability({
        pickupPincode: process.env.SHIPROCKET_PICKUP_PINCODE || '411028',
        deliveryPincode: payload.billing_pincode,
        weightKg: payload.weight,
        isCod: false,
      });

      const chosenCourier = serviceability.couriers?.[0];
      const awbPayload: any = { shipment_id: shipmentId };
      if (chosenCourier?.courierCompanyId) {
        awbPayload.courier_id = chosenCourier.courierCompanyId;
        courierName = `${chosenCourier.courierName} (via Shiprocket)`;
      }

      const awbRes = await fetch(`${BASE_URL}/courier/assign/awb`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(awbPayload),
      });

      if (awbRes.ok) {
        const awbJson = await awbRes.json();
        if (awbJson.response?.data?.awb_code) {
          awbCode = awbJson.response.data.awb_code;
          courierName = awbJson.response.data.courier_name || courierName;
          trackingUrl = `https://shiprocket.co/tracking/${awbCode}`;
        }
      }
    } catch (awbErr) {
      console.warn('Shiprocket AWB assignment deferred:', awbErr);
    }

    return {
      success: true,
      shipmentId,
      orderId: shiprocketOrderId,
      awbCode: awbCode || undefined,
      courierName,
      trackingUrl: trackingUrl || undefined,
    };
  } catch (err: any) {
    console.error('Shiprocket automation failed:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Tracks a shipment in real-time by AWB code or order ID.
 */
export async function trackShiprocketShipment(awbCode: string): Promise<{
  success: boolean;
  status?: string;
  currentLocation?: string;
  activityHistory?: Array<{ date: string; status: string; location: string; activity: string }>;
  error?: string;
}> {
  const token = await getShiprocketToken();
  if (!token) {
    return { success: false, error: 'Shiprocket credentials missing' };
  }

  try {
    const res = await fetch(`${BASE_URL}/courier/track/awb/${awbCode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: `Tracking error: ${err}` };
    }

    const json = await res.json();
    const trackingData = json.tracking_data;
    const scans = trackingData?.shipment_track_activities || [];

    return {
      success: true,
      status: trackingData?.track_status ? (trackingData.track_status === 1 ? 'Delivered' : 'In Transit') : 'Booked',
      currentLocation: trackingData?.shipment_track?.[0]?.current_status || 'Hub',
      activityHistory: scans.map((s: any) => ({
        date: s.date,
        status: s.status,
        location: s.location,
        activity: s.activity,
      })),
    };
  } catch (err: any) {
    console.error('Shiprocket tracking lookup failed:', err);
    return { success: false, error: err.message };
  }
}
