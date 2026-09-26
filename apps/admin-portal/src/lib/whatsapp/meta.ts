export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  recipientPhone?: string;
  error?: string;
}

export function formatWhatsAppPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }
  return digits;
}

export async function sendMetaWhatsAppMessage(params: {
  toPhone: string;
  templateName?: string;
  templateLanguage?: string;
  templateParams?: string[];
  textMessage?: string;
}): Promise<WhatsAppSendResult> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.warn('Meta WhatsApp API credentials missing (WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCESS_TOKEN).');
    return {
      success: false,
      error: 'WhatsApp API credentials not configured in environment.',
    };
  }

  const formattedRecipient = formatWhatsAppPhone(params.toPhone);
  const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

  let bodyPayload: any;

  if (params.templateName) {
    bodyPayload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedRecipient,
      type: 'template',
      template: {
        name: params.templateName,
        language: { code: params.templateLanguage || 'en' },
        components: params.templateParams && params.templateParams.length > 0
          ? [
              {
                type: 'body',
                parameters: params.templateParams.map((val) => ({
                  type: 'text',
                  text: val,
                })),
              },
            ]
          : undefined,
      },
    };
  } else if (params.textMessage) {
    bodyPayload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedRecipient,
      type: 'text',
      text: {
        preview_url: true,
        body: params.textMessage,
      },
    };
  } else {
    return { success: false, error: 'Neither templateName nor textMessage was provided.' };
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(bodyPayload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.warn('Meta WhatsApp API error response:', data);
      if (params.templateName && params.textMessage) {
        return sendMetaWhatsAppMessage({
          toPhone: params.toPhone,
          textMessage: params.textMessage,
        });
      }
      return {
        success: false,
        error: data.error?.message || 'Meta WhatsApp API request failed.',
      };
    }

    const messageId = data.messages?.[0]?.id;
    return {
      success: true,
      messageId,
      recipientPhone: formattedRecipient,
    };
  } catch (err: any) {
    console.error('Meta WhatsApp network error:', err);
    return {
      success: false,
      error: err.message,
    };
  }
}

export async function sendOrderConfirmedWhatsApp(order: {
  id: string;
  orderNumber: string;
  totalAmount: number | string;
  shippingAddress: any;
  courierName?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  items?: Array<{ productName: string; weight: string; quantity: number }>;
}): Promise<WhatsAppSendResult> {
  const addr = typeof order.shippingAddress === 'string'
    ? JSON.parse(order.shippingAddress)
    : order.shippingAddress || {};

  const customerName = addr.name || 'Valued Customer';
  const customerPhone = addr.phone;

  if (!customerPhone) {
    return { success: false, error: 'Customer phone number is missing in shipping address.' };
  }

  const trackingLink = order.trackingUrl || `https://stage.gaonpure.com/orders/${order.id}`;
  const courier = order.courierName || 'Delhivery / Shiprocket Hub';
  const awb = order.trackingNumber || 'Assigned upon packing';
  const total = Number(order.totalAmount).toLocaleString('en-IN');

  const itemsList = order.items && order.items.length > 0
    ? order.items.map((i) => `• ${i.productName} (${i.weight}) x${i.quantity}`).join('\n')
    : 'Traditional Cold-Pressed & Milled Harvest';

  const textBody = 
`🌾 *Gaon Pure — Order Confirmed!*

Namaste *${customerName}*,

Thank you for choosing pure, unadulterated village harvest foods! Your order *#${order.orderNumber}* for *₹${total}* has been confirmed.

📦 *Ordered Items:*
${itemsList}

🚚 *Logistics Partner:* ${courier}
🔍 *Tracking AWB:* ${awb}
🌐 *Live Tracking Link:* ${trackingLink}

Your grains and cold-pressed oils are being prepared fresh from our village hubs.

_Gaon Pure — Healthy Foods, Desi Roots_
https://gaonpure.com`;

  const templateName = process.env.WHATSAPP_TEMPLATE_ORDER_CONFIRMED || 'order_confirmation_tracking';

  return sendMetaWhatsAppMessage({
    toPhone: customerPhone,
    templateName,
    templateParams: [customerName, order.orderNumber, total, courier, awb, trackingLink],
    textMessage: textBody,
  });
}

export async function sendOrderDispatchedWhatsApp(order: {
  id: string;
  orderNumber: string;
  shippingAddress: any;
  courierName?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
}): Promise<WhatsAppSendResult> {
  const addr = typeof order.shippingAddress === 'string'
    ? JSON.parse(order.shippingAddress)
    : order.shippingAddress || {};

  const customerName = addr.name || 'Valued Customer';
  const customerPhone = addr.phone;

  if (!customerPhone) {
    return { success: false, error: 'Customer phone number is missing.' };
  }

  const trackingLink = order.trackingUrl || `https://stage.gaonpure.com/orders/${order.id}`;
  const courier = order.courierName || 'Delhivery / Shiprocket';
  const awb = order.trackingNumber || 'In Transit';

  const textBody = 
`🚚 *Gaon Pure — Order Dispatched!*

Namaste *${customerName}*,

Your pure village harvest order *#${order.orderNumber}* has been dispatched from our regional distribution hub.

📦 *Courier Partner:* ${courier}
🏷️ *AWB / Tracking Number:* ${awb}
🔍 *Track Live Location:* ${trackingLink}

Expect delivery at your doorstep soon!

_Gaon Pure Logistics Team_`;

  const templateName = process.env.WHATSAPP_TEMPLATE_ORDER_DISPATCHED || 'order_dispatched_tracking';

  return sendMetaWhatsAppMessage({
    toPhone: customerPhone,
    templateName,
    templateParams: [customerName, order.orderNumber, courier, awb, trackingLink],
    textMessage: textBody,
  });
}
