const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_S5Dnxf0esaudPy';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'PDzjLM6u6BJsHZEdp9jxlcQL';

function getAuthHeader(): string {
  const credentials = `${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`;
  const encoded = Buffer.from(credentials).toString('base64');
  return `Basic ${encoded}`;
}

export interface RazorpayRefundResponse {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  payment_id: string;
  status: string;
  speed_processed?: string;
}

export async function refundRazorpayPayment(paymentId: string, amountInRupees?: number, notes?: Record<string, string>): Promise<RazorpayRefundResponse> {
  const payload: any = {
    notes: notes || { reason: 'Admin initiated refund' },
  };

  if (amountInRupees) {
    // Razorpay amount is in paise (1 INR = 100 paise)
    payload.amount = Math.round(amountInRupees * 100);
  }

  const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.error?.description || data.error?.reason || 'Razorpay refund request failed';
    throw new Error(errorMsg);
  }

  return data;
}

export async function fetchRazorpayPayment(paymentId: string) {
  const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
    method: 'GET',
    headers: {
      'Authorization': getAuthHeader(),
    },
  });

  return response.json();
}
