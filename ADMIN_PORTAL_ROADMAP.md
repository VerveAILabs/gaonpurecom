# Gaon Pure — Admin Portal Production Readiness Roadmap

This document tracks all tasks required to bring the **Admin Portal** (`apps/admin-portal`) to 100% production readiness.

---

## 🚦 Status Overview
- **Core UI & DB Workflows**: 100% Completed
- **Production Readiness**: Fully Hardened & Verified (`npm run build:admin` passing)

---

## 📋 Task Checklist

### Phase 1: Authentication & Security Hardening (P0 — Completed)
- [x] **1.1 Admin Authentication Flow**
  - Implement Admin Sign-in page (`/login`) with Firebase Auth & Neon DB verification.
  - Add session cookie and Web Crypto HMAC token management.
- [x] **1.2 Middleware & Route Protection**
  - Guard all admin portal routes (`/`, `/orders`, `/products`, `/inventory`, `/users`, `/coupons`, `/settings`) with Next.js middleware.
  - Redirect unauthenticated or non-admin visitors to `/login`.
- [x] **1.3 Secure All API Endpoints**
  - Next.js Edge Middleware validates `gp_admin_session` cookie on all protected `/api/*` endpoints.
- [x] **1.4 Dynamic Header & Logout**
  - Updated `Header.tsx` to display real authenticated admin details and avatar.
  - Added functional "Sign Out" button.

---

### Phase 2: Media & Category Management (P1 — Completed)
- [x] **2.1 Product Image File Upload**
  - Integrated direct image file upload to Firebase Storage with real-time thumbnail preview, progress indicators, and fallback URL support.
- [x] **2.2 Category Management CRUD**
  - Added dedicated Category Management modal and API (`/api/categories`) with automatic slug generation, product counter, and safe deletion checks.

---

### Phase 3: Order & Razorpay Enhancements (P1 — Completed)
- [x] **3.1 Razorpay Payment & Refund Integration**
  - Integrated Razorpay Refund client (`/api/orders/refund`) using active Test/Live credentials.
  - Added "Issue Refund" modal with custom amount, gateway reference inspection, and audit trail in order notes.
- [x] **3.2 Printable Invoice Branding**
  - Invoice now reads company name, support phone, and support email dynamically from live Store Settings (`/api/settings`).

---

### Phase 4: Scalability, Filters & Pagination (P2 — Completed)
- [x] **4.1 Paginated Endpoints & UI Controls**
  - Added `page` and `limit` pagination controls and count queries to `/api/orders` and `/api/users`.
  - Added modern responsive pagination toolbars (previous/next/counter) to both Orders and Customer CRM pages.
- [x] **4.2 Advanced Search & Filter Bar**
  - Integrated server-side search across Customer names, emails, phones, and role filtering (`ALL`, `customer`, `admin`).

---

### Phase 5: Build, Test & Deployment Verification (P0 — Completed)
- [x] **5.1 Environment Variables & Secret Audit**
  - Configured Razorpay keys and Firebase variables in `.env`, `apphosting.yaml`, and `apphosting.staging.yaml`.
- [x] **5.2 Full Build & Smoke Test**
  - Verified full workspace build (`npm run build:admin`) passing cleanly across all 23 routes and middleware.
- [x] **5.3 Deployment Setup**
  - Updated App Hosting configurations ready for live deployment.

---

### Phase 6: Storefront & Domain Integration (Completed)
- [x] **6.1 Storefront Admin Link Integration**
  - Updated storefront profile page (`apps/storefront/src/app/profile/page.tsx`) to link to external Admin Portal (`NEXT_PUBLIC_ADMIN_PORTAL_URL`).
  - Updated `siteConfig.adminNavItems` to dynamically target admin portal.
- [x] **6.2 Domain & Firebase App Hosting Configuration**
  - Staging Storefront domain configured: `stage.gaonpure.com` (`HOST_ACTIVE`, `OWNERSHIP_ACTIVE`, `CERT_ACTIVE`).
  - Staging Admin Portal domain configured: `admin.gaonpure.com` (`HOST_ACTIVE`, `OWNERSHIP_ACTIVE`, `CERT_ACTIVE`).
  - Production Storefront prepared for `gaonpure.com`.
  - App Hosting configuration files updated: `apphosting.staging.yaml` and `apphosting.yaml`.

---

## 🛠 Required Integrations & MCP Servers
- [x] **Neon PostgreSQL** (Active on project `calm-silence-80161866`)
- [x] **Firebase MCP Server** (Active & logged in as `contact@verveai.co`)
- [x] **Google Cloud & ADC Auth** (Authenticated as `contact@verveai.co`, project `gaonpurecom-staging`)
- [x] **Razorpay MCP Server** (Configured & Active with Test credentials)
