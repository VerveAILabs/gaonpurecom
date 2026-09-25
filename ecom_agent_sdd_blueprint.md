# E-Commerce Architectural Spec (Condensed Agent Blueprint)
**Target Stack:** Next.js (App Router, React 19) + Tailwind CSS v4 + Firebase v11 + Razorpay Node SDK v2

---

## 1. Safety & Architecture Rules
*   **Role-Based Access Control (RBAC):** Admin authorization must reside server-side in `/admin_users/{userId}`. Never trust role flags sent from the client.
*   **Profile Integrity:** Diff guards must prevent customers from editing their own `role`, `email`, or `createdAt`.
*   **Checkout & Pricing Security:**
    *   Calculate all cart prices server-side by fetching products from Firestore.
    *   Redirect client exclusively via Razorpay Hosted Payment Links.
    *   Verify webhook signatures via HMAC-SHA256 using `req.rawBody`.
    *   Ensure webhook idempotency using a Firestore Transaction logging event IDs in a `razorpay_events` collection.
    *   Restrict callback redirect URLs via host allowlist validation.
*   **Inputs:** Validate emails, phone numbers, and pincodes using strict regexes before processing.

---

## 2. Directory Layout
```text
├── firestore.rules            # Security rules
├── storage.rules              # Storage access rules
├── next.config.ts             # Contains security headers
├── functions/                 # Firebase Cloud Functions (Node 22)
│   ├── src/index.ts           # Functions entry (V2 Callables/HTTPS/Schedules)
│   └── src/razorpay.ts        # Razorpay SDK initialization
└── src/
    ├── app/                   # Next.js App Router layout/routes (admin, checkout, shop, profile)
    ├── components/            # Shared components (AuthModal, ProductCard)
    ├── store/                 # Zustand stores (useAuthStore, useCartStore)
    └── types/                 # Shared TS interfaces
```

---

## 3. Database Schema

*   `/admin_users/{userId}` -> `{ isAdmin: boolean, email: string }`
*   `/users/{userId}` -> `{ name: string, email: string, phone: string, address: string, city: string, pincode: string, role: string, isGuest: boolean }`
*   `/products/{productId}` -> `{ name: string, category: string, isActive: boolean, prices: Array<{ weight: string, price: number, stock: number }> }`
*   `/orders/{orderId}` -> `{ userId: string, date: string, items: Array<{ id: string, name: string, weight: string, quantity: number, price: number }>, totalAmount: number, shippingAddress: object, paymentStatus: "Pending" | "Paid" | "Failed", status: "Ordered" | "Confirmed" | "Cancelled", razorpayPaymentLinkId?: string, razorpayPaymentLinkUrl?: string }`
*   `/razorpay_events/{eventId}` -> `{ processedAt: timestamp, event: string, orderId: string }`

---

## 4. Security Configuration

### 4.1 Firestore Rules (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/admin_users/$(request.auth.uid)) && 
             get(/databases/$(database)/documents/admin_users/$(request.auth.uid)).data.isAdmin == true;
    }
    match /admin_users/{userId} {
      allow read: if request.auth != null && (request.auth.uid == userId || isAdmin());
      allow write: if request.auth != null && request.auth.uid == userId && 
                      request.auth.token.email in ['admin@domain.com'];
    }
    match /users/{userId} {
      allow read: if request.auth != null && (request.auth.uid == userId || isAdmin());
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if (request.auth != null && request.auth.uid == userId &&
                        !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role', 'email', 'createdAt'])) || isAdmin();
    }
    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /orders/{orderId} {
      allow get: if request.auth != null && (resource.data.userId == request.auth.uid || isAdmin());
      allow list: if request.auth != null && ((request.query.limit <= 100 && request.auth.uid == resource.data.userId) || isAdmin());
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update, delete: if isAdmin();
    }
  }
}
```

---

## 5. Cloud Functions Backend (v2)

### 5.1 Function: `createCatalogPaymentLink` (onCall)
1.  **Validate parameters:** Ensure shipping fields match regex requirements (email, phone, 6-digit pincode).
2.  **Verify Catalog & Price:** Loop through checkout items, query `/products/{id}`, check `isActive == true`, check variant stock, and calculate the total.
3.  **Onboard User profile:** Update/create profile matching user ID or create guest entry under `/users`.
4.  **Draft Order:** Create `/orders` record in `Pending` payment status.
5.  **Call Razorpay API:** Generate a hosted payment link using transaction details and reference ID notes.
6.  **Update & Return:** Append `razorpayPaymentLinkId` to order, and return link URL.

### 5.2 Function: `razorpayWebhook` (onRequest)
1.  **Verify Webhook Origin:** Compare calculated raw request body HMAC-SHA256 signature to the `x-razorpay-signature` header. Return 401 if mismatched.
2.  **Perform Transaction:**
    *   Check if event ID is recorded in `/razorpay_events`. Abort if already processed.
    *   Load `/orders/{orderId}`. Verify link ID matches.
    *   If event is `payment_link.paid`: Set payment status to `Paid` and status to `Confirmed`.
    *   If event is `payment_link.expired` or `payment_link.cancelled` and not already paid: Set payment status to `Failed` and status to `Cancelled`.
    *   Write event ID to `/razorpay_events`.

### 5.3 Function: `reconcilePayments` (onSchedule)
1.  Cron: `0 */6 * * *` (Every 6 hours).
2.  Query pending orders older than 24 hours.
3.  Request status from Razorpay API. Update Firestore fields for paid/cancelled/expired items.

---

## 6. Global State: `useCartStore.ts` (Zustand)
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem { id: string; name: string; weight: string; price: number; quantity: number; imageUrl: string; }
interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity: number) => void;
  removeItem: (id: string, weight: string) => void;
  updateQuantity: (id: string, weight: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}
export const useCartStore = create<CartStore>()(
  persist((set, get) => ({
    items: [],
    addItem: (item, quantity) => set((state) => {
      const idx = state.items.findIndex(i => i.id === item.id && i.weight === item.weight);
      if (idx > -1) {
        const items = [...state.items];
        items[idx].quantity += quantity;
        return { items };
      }
      return { items: [...state.items, { ...item, quantity }] };
    }),
    removeItem: (id, weight) => set((state) => ({ items: state.items.filter(i => !(i.id === id && i.weight === weight)) })),
    updateQuantity: (id, weight, quantity) => set((state) => ({
      items: state.items.map(i => (i.id === id && i.weight === weight) ? { ...i, quantity } : i).filter(i => i.quantity > 0)
    })),
    clearCart: () => set({ items: [] }),
    getCartTotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }), { name: 'cart-storage' })
);
```

---

## 7. Execution Steps for coding agents
1.  **Setup Framework:** Install dependencies (`zustand`, `lucide-react`, `firebase`). Set up Firebase configurations and Next.js security headers config.
2.  **Auth & Profiles:** Setup `useAuthStore` and create an Auth State sync hook. Build `AuthModal` with login/signup steps.
3.  **Database Rules:** Implement and deploy `firestore.rules` containing the `isAdmin()` function validation.
4.  **Catalog Routing:** Create the product shopping views, the search filter states, and the shopping cart drawer.
5.  **Checkout Backend:** Implement the `createCatalogPaymentLink` Callable Cloud Function containing server-side stock and price verification.
6.  **Payment Sync:** Build `razorpayWebhook` ensuring signature checking and transaction-based deduplication checks.
7.  **Recovery Cron:** Setup the scheduled cloud cron checking for stale transactions.
8.  **Layout Guards:** Configure root routes redirects that bounce non-admin users back to the landing page if they try to access administrative files.
