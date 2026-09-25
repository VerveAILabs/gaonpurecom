import Razorpay from "razorpay";

/**
 * Lazily creates a Razorpay client only when called (not at module load time).
 * This prevents key errors during Firebase CLI code analysis.
 */
export function getRazorpayClient(): Razorpay {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error("Razorpay env variables RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in Firebase.");
  }

  return new Razorpay({ key_id, key_secret });
}
