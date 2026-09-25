# Security Best Practices for Gaon Pure Development

This guide outlines security best practices for developers working on the Gaon Pure e-commerce platform.

## 🔐 Authentication & Authorization

### Rule 1: Never Hardcode Admin Emails or Roles
❌ **Bad**:
```typescript
const isAdmin = email === 'admin@gaonpure.com';
```

✅ **Good**:
```typescript
// Admin status is determined by Firestore backend
// Use the isAuthStore.isAdmin from Zustand store
// which fetches from authenticated Firestore reads
```

### Rule 2: Always Verify Authorization on Backend
❌ **Bad**:
```typescript
// Frontend-only check
if (userStore.isAdmin) {
  // Update product
}
```

✅ **Good**:
```typescript
// Cloud function with backend verification
export const updateProduct = onCall(async (request) => {
  // Check authentication
  if (!request.auth) throw new HttpsError("unauthenticated", "...");
  
  // Verify admin status from Firestore
  const db = admin.firestore();
  const adminDoc = await db.collection('admin_users').doc(request.auth.uid).get();
  if (!adminDoc.exists) {
    throw new HttpsError("permission-denied", "...");
  }
  
  // Proceed with operation
});
```

### Rule 3: Always Validate User Ownership
❌ **Bad**:
```typescript
await db.collection('orders').doc(orderId).update({ status: 'Shipped' });
```

✅ **Good**:
```typescript
const orderDoc = await db.collection('orders').doc(orderId).get();
const order = orderDoc.data();

// Verify user owns the order
if (order.userId !== request.auth.uid) {
  throw new HttpsError("permission-denied", "Not your order");
}

await orderDoc.ref.update({ status: 'Shipped' });
```

---

## 🔑 Secrets & Environment Variables

### Rule 4: Never Commit Secrets
❌ **Bad**:
```typescript
const RAZORPAY_KEY_SECRET = "rzp_test_abc123...";
```

✅ **Good**:
```typescript
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
if (!RAZORPAY_KEY_SECRET) {
  throw new Error('RAZORPAY_KEY_SECRET not configured');
}
```

### Rule 5: Use Environment Variables for Configuration
In `.env.local`:
```bash
# Public (exposed to browser)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project

# Private (server-side only)
RAZORPAY_KEY_SECRET=your-secret-key
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account"...}'
```

### Rule 6: Rotate Secrets Regularly
- [ ] GitHub encrypted secrets
- [ ] Firebase service account private keys  
- [ ] Razorpay API keys
- [ ] Webhook secrets

---

## ✅ Input Validation

### Rule 7: Always Validate Input
❌ **Bad**:
```typescript
const email = request.data.email;
// No validation, use directly
```

✅ **Good**:
```typescript
const email = request.data.email;
if (!email || !validateEmail(email)) {
  throw new HttpsError("invalid-argument", "Invalid email");
}
```

### Rule 8: Validate All Types
```typescript
// Import validators
import {
  validateEmail,
  validatePhone,
  validatePincode,
  validateUrl,
  sanitizeString,
} from '@/lib/security';

// Validate request data
const { email, phone, pincode, callbackUrl } = request.data;
if (!validateEmail(email)) throw new HttpsError("invalid-argument", "Invalid email");
if (!validatePhone(phone)) throw new HttpsError("invalid-argument", "Invalid phone");
if (!validatePincode(pincode)) throw new HttpsError("invalid-argument", "Invalid pincode");
if (!validateUrl(callbackUrl)) throw new HttpsError("invalid-argument", "Invalid URL");

// Sanitize strings
const sanitizedName = sanitizeString(request.data.name, 100);
```

### Rule 9: Validate Array Lengths
```typescript
const items = request.data.items;
if (!Array.isArray(items) || items.length === 0 || items.length > 100) {
  throw new HttpsError("invalid-argument", "Items must be 1-100");
}
```

### Rule 10: Validate Numeric Ranges
```typescript
const amount = request.data.amount;
if (typeof amount !== 'number' || amount < 1 || amount > 999999) {
  throw new HttpsError("invalid-argument", "Invalid amount");
}
```

---

## 🛡️ Firestore Rules

### Rule 11: Restrict Data Access
❌ **Bad**:
```firestore
match /orders/{orderId} {
  allow read: if true; // Everyone can read!
}
```

✅ **Good**:
```firestore
match /orders/{orderId} {
  allow read: if request.auth != null && 
              (resource.data.userId == request.auth.uid || isAdmin());
}
```

### Rule 12: Prevent Privilege Escalation
❌ **Bad**:
```firestore
match /users/{userId} {
  allow update: if request.auth.uid == userId;  // User can update ANY field
}
```

✅ **Good**:
```firestore
match /users/{userId} {
  allow update: if request.auth.uid == userId && 
                !request.resource.data.diff(resource.data)
                  .affectedKeys().hasAny(['role', 'isAdmin', 'email']);
}
```

### Rule 13: Implement Collection-Level Access Control
```firestore
match /admin_users/{userId} {
  allow read: if isAdmin();
  allow write: if false;  // Managed via backend process
}

match /analytics/{document=**} {
  allow read, write: if isAdmin();
}
```

---

## 🔒 Payment Security

### Rule 14: Always Verify Payment Signatures
```typescript
const expectedSignature = crypto
  .createHmac('sha256', keySecret)
  .update(`${orderId}|${paymentId}`)
  .digest('hex');

if (expectedSignature !== providedSignature) {
  throw new HttpsError("permission-denied", "Invalid signature");
}
```

### Rule 15: Store Payment Data Safely
```typescript
// ❌ Never store in localStorage without encryption
localStorage.setItem('paymentData', JSON.stringify(sensitiveData));

// ✅ Store only non-sensitive data
localStorage.setItem('orderId', orderId);  // OK
// Or use SessionStorage for temporary data
sessionStorage.setItem('checkoutTemp', data);  // Auto-cleared on close
```

### Rule 16: Log Payment Operations
```typescript
await db.collection('audit_logs').add({
  action: 'payment_verified',
  orderId,
  userId: request.auth.uid,
  timestamp: admin.firestore.FieldValue.serverTimestamp(),
  details: { razorpayOrderId, razorpayPaymentId },
});
```

---

## 🚀 API Security

### Rule 17: Implement Rate Limiting
```typescript
import { RateLimiter } from '@/lib/security';

const limiter = new RateLimiter(60000, 10); // 10 requests per minute

if (!limiter.isAllowed(request.auth.uid)) {
  throw new HttpsError("resource-exhausted", "Too many requests");
}
```

### Rule 18: Add CORS Headers Properly
```typescript
// In next.config.ts
async headers() {
  return [{
    source: '/api/(.*)',
    headers: [
      {
        key: 'Access-Control-Allow-Origin',
        value: process.env.ALLOWED_ORIGINS || 'https://gaonpure.com',
      },
      // ... other headers
    ],
  }];
}
```

### Rule 19: Validate API Requests
```typescript
// Always check request method
if (req.method !== 'POST') {
  res.status(405).send('Method Not Allowed');
  return;
}

// Verify webhook signatures
if (expectedSignature !== providedSignature) {
  res.status(401).send('Invalid signature');
  return;
}
```

---

## 📝 Logging & Monitoring

### Rule 20: Log Security Events
```typescript
// Bad: Too verbose, security risk
console.log('User password:', password);

// Good: Log only relevant info
console.log('Login attempt for email:', sanitizedEmail);
console.log('Unauthorized access attempt to admin console by:', userId);
console.log('Payment verification failed for order:', orderId);
```

### Rule 21: Monitor Failures
- Track failed login attempts
- Monitor Firestore rule violations
- Alert on repeated authorization failures
- Track payment verification failures

---

## 🧪 Testing Security

### Rule 22: Test Authorization
```typescript
// Test that users cannot access others' orders
// Test that admins can access all orders
// Test that non-admins cannot modify products
// Test that users cannot change their role
```

### Rule 23: Test Input Validation
```typescript
// Test with empty strings
// Test with very long strings
// Test with special characters  ("<>{}[]")
// Test with SQL injection attempts
// Test with XSS payloads
// Test with invalid emails/phones/pincodes
```

---

## 🔄 Code Review Checklist

Before submitting a PR:

- [ ] No hardcoded secrets or credentials?
- [ ] All inputs validated?
- [ ] User authorization verified on backend?
- [ ] SQL/XSS injection risks eliminated?
- [ ] Sensitive data not logged?
- [ ] Firestore rules restrict access properly?
- [ ] Error messages don't leak Info?
- [ ] Secrets in `.env.local`?
- [ ] HTTPS forced in production?
- [ ] CORS restricted to known domains?

---

## 📞 Security Issues

If you discover a security vulnerability:

1. **Do NOT** open a public issue on GitHub
2. **Do NOT** commit exploits to the repo
3. **Do** email security concerns to admin@gaonpure.com
4. **Do** provide detailed reproduction steps
5. **Do** include the impact assessment

---

**Last Updated**: April 16, 2026
**Maintainer**: Gaon Pure Security Team
