# Payment Gateway Setup (Razorpay + Similar Providers)

This project now uses a server-side payment-link agent that:
- Validates cart items against published products in Firestore.
- Creates a Firestore order in pending payment state.
- Creates a Razorpay hosted payment link (UPI, cards, netbanking, wallets).
- Updates order status from Razorpay webhook events.

## 1) Razorpay Account Setup

1. Create or sign in to your Razorpay account.
2. Complete KYC and business verification.
3. In Dashboard, switch to Test Mode for initial integration testing.
4. Open Settings -> API Keys.
5. Generate Key ID and Key Secret.
6. Open Settings -> Webhooks.
7. Create a webhook URL pointing to your deployed function endpoint:
   - https://us-central1-<your-project-id>.cloudfunctions.net/razorpayWebhook
8. Configure webhook secret and copy it.
9. Subscribe webhook events:
   - payment_link.paid
   - payment_link.expired
   - payment_link.cancelled

## 2) Firebase Functions Environment

Create or update [functions/.env](functions/.env) with:

RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_server_side_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

Important:
- Do not expose KEY_SECRET or WEBHOOK_SECRET in frontend env files.
- Only server-side Cloud Functions should read these values.

## 3) Frontend/Website Flow

Checkout now calls the payment-link agent in [src/lib/paymentLinkAgent.ts](src/lib/paymentLinkAgent.ts), which invokes Cloud Function createCatalogPaymentLink.

The function:
- Reads products from Firestore products collection.
- Accepts only active products (published by admin).
- Validates chosen weight variant and stock.
- Recomputes final amount server-side.
- Returns a Razorpay short payment URL.

The checkout page in [src/app/checkout/page.tsx](src/app/checkout/page.tsx) redirects the buyer to that payment link.

## 4) Deployment Steps

1. Build and deploy functions:
   - cd functions
   - npm install
   - npm run build
   - firebase deploy --only functions
2. Deploy web app:
   - npm install
   - npm run build
   - firebase deploy (or your hosting deploy command)
3. In Razorpay dashboard, use the final production webhook URL after deployment.

## 5) Testing Checklist

1. Add active products from admin panel.
2. Add product variant to cart on website.
3. Go to checkout and submit shipping details.
4. Confirm redirect to Razorpay hosted page.
5. Pay using UPI test mode.
6. Verify order document is updated to:
   - paymentStatus: Paid
   - status: Confirmed
7. Test expired/cancelled link and verify order updates.

## 6) If Using A Similar Provider (Cashfree, PhonePe PG, PayU)

Keep this architecture unchanged:
- Server-side function validates published products + recomputes amount.
- Server creates hosted payment link/order token.
- Frontend only redirects to provider URL.
- Provider webhook is signature-verified server-side.
- Firestore order status is updated only from webhook events.

Provider-specific replacements:
- Replace Razorpay SDK client in [functions/src/razorpay.ts](functions/src/razorpay.ts).
- Replace createCatalogPaymentLink implementation in [functions/src/index.ts](functions/src/index.ts).
- Replace webhook signature logic in razorpayWebhook handler.
