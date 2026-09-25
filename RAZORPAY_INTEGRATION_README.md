# Razorpay Integration Runbook (Firebase + Next.js)

This document captures the full integration and deployment flow for Razorpay in this project, including the issues we encountered and how to resolve them.

## 1. Integration Architecture

Checkout uses a hosted payment-link flow:

1. Frontend checkout calls Firebase callable function `createCatalogPaymentLink`.
2. Cloud Function validates cart items and prices from Firestore products.
3. Cloud Function creates an order document with `paymentStatus: Pending`.
4. Cloud Function creates a Razorpay payment link and returns the short URL.
5. Frontend redirects customer to Razorpay hosted page.
6. Razorpay webhook updates order status in Firestore on paid/expired/cancelled.

## 2. Files Involved

- `functions/src/index.ts`
  - `createCatalogPaymentLink`
  - `razorpayWebhook`
  - optional legacy: `createRazorpayOrder`, `verifyRazorpayPayment`
- `functions/src/razorpay.ts`
  - Razorpay client initialization using env vars
- `src/lib/paymentLinkAgent.ts`
  - callable contract + runtime response normalization
- `src/app/checkout/page.tsx`
  - checkout submit and redirect to Razorpay URL
- `PAYMENT_GATEWAY_SETUP.md`
  - setup overview

## 3. Required Environment Variables

Set these in `functions/.env`:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`

Notes:

- Keep secrets only in server-side function env.
- Do not store `RAZORPAY_KEY_SECRET` or `RAZORPAY_WEBHOOK_SECRET` in frontend env files.

## 4. Razorpay Dashboard Setup

1. Go to Razorpay Dashboard -> Settings -> API Keys.
2. Generate Test Mode key pair and set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`.
3. Go to Settings -> Webhooks.
4. Set webhook URL:
   - `https://us-central1-<project-id>.cloudfunctions.net/razorpayWebhook`
5. Set webhook secret and copy it to `RAZORPAY_WEBHOOK_SECRET`.
6. Subscribe to events:
   - `payment_link.paid`
   - `payment_link.expired`
   - `payment_link.cancelled`

## 5. Local Validation Steps

1. Build functions:
   - `npm --prefix functions run build`
2. Start local functions emulator:
   - `firebase emulators:start --only functions`
3. Confirm these endpoints initialize:
   - `createCatalogPaymentLink`
   - `razorpayWebhook`

## 6. Deployment Steps

1. Ensure Firebase login:
   - `firebase login`
2. Deploy functions:
   - `firebase deploy --only functions`
3. Verify deployment output lists updated functions.

## 7. IAM Issue We Faced (Important)

### Symptom

Deploy failed with:

- Missing permission `iam.serviceAccounts.ActAs`
- Service account: `<project-id>@appspot.gserviceaccount.com`

### Root Cause

The deploy user did not have Service Account User permission on the App Engine default service account.

### Required Fix

A Project Owner must grant role:

- `roles/iam.serviceAccountUser`

To the deploy user (example `rds087@gmail.com`) on:

- `<project-id>@appspot.gserviceaccount.com`

Console URL pattern:

- `https://console.cloud.google.com/iam-admin/iam?project=<project-id>`

### Optional but Recommended Roles for Deploy User

- `roles/cloudfunctions.developer`
- `roles/cloudbuild.builds.editor`
- `roles/artifactregistry.writer`

## 8. gcloud CLI Notes

If `gcloud` is not installed, install Google Cloud SDK first.

If installed but not found in PATH on Windows, use full path:

- `C:\Users\<username>\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd`

Authenticate before IAM commands:

- `gcloud auth login`

## 9. Post-Deploy Smoke Test Checklist

1. Add active product with price variant and stock.
2. Add item to cart and open checkout.
3. Submit shipping details.
4. Verify redirect to Razorpay hosted page.
5. Complete test payment in Razorpay.
6. Confirm Firestore order fields update:
   - `paymentStatus = Paid`
   - `status = Confirmed`
   - `razorpayPaymentId` exists
7. Test expired/cancelled link flow.

## 10. Security and Reliability Guards Already Added

- Frontend runtime validation for payment-link response payload.
- Callback URL host allowlist in function.
- Function derives effective user from auth context (not trusting raw client user ID).
- Webhook ignores unknown order references.
- Webhook ignores payment-link mismatch with existing order.
- Cancel/expired events do not overwrite already paid orders.

## 11. Common Troubleshooting

### A) `Missing permissions required for functions deploy`

- Confirm deploy user has `roles/iam.serviceAccountUser` on `<project-id>@appspot.gserviceaccount.com`.

### B) `key_id is required` or Razorpay client init errors

- Confirm `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` exist in `functions/.env` (or deployed env).

### C) Webhook signature invalid

- Confirm webhook secret in Razorpay exactly matches `RAZORPAY_WEBHOOK_SECRET`.
- Ensure webhook points to correct project and region URL.

### D) Payment succeeds but order not updated

- Check webhook event subscription includes `payment_link.paid`.
- Check function logs for signature mismatch or order reference mismatch.

## 12. Recommended Next Improvements

1. Move profile order fetch to server-filtered query by user ID (avoid client-side filtering all orders).
2. Add webhook idempotency (store processed event IDs).
3. Add integration tests for payment contract and webhook transitions.
4. Add periodic reconciliation job for pending links.

---

Owner checklist:

- [ ] Razorpay keys configured in `functions/.env`
- [ ] Webhook URL configured
- [ ] Webhook secret configured
- [ ] IAM roles granted to deploy user
- [ ] `firebase deploy --only functions` successful
- [ ] Paid/expired/cancelled flows tested
