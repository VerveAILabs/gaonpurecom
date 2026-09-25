import { setGlobalOptions } from "firebase-functions";
import { onCall, onRequest, HttpsError, Request } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import * as crypto from "crypto";
import { getRazorpayClient } from "./razorpay";

type CheckoutItemInput = {
  productId: string;
  weight: string;
  quantity: number;
};

type ShippingAddressInput = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
};

admin.initializeApp();
setGlobalOptions({ maxInstances: 10 });

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

function validatePhone(phone: string): boolean {
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}

function validatePincode(pincode: string): boolean {
  const pincodeRegex = /^[0-9]{6}$/;
  return pincodeRegex.test(pincode);
}

function sanitizeString(str: string, maxLength: number = 255): string {
  return str.substring(0, maxLength).trim();
}

function isAllowedCallbackUrl(url: URL): boolean {
  const allowedHosts = new Set(["gaonpure.com", "www.gaonpure.com", "localhost", "127.0.0.1"]);
  return allowedHosts.has(url.hostname);
}

/**
 * createRazorpayOrder
 * Called from the frontend when the user clicks "Pay Now".
 * Creates a Razorpay order server-side and returns the orderId + amount.
 */
export const createRazorpayOrder = onCall(
  { region: "us-central1" },
  async (request) => {
    const { amount, currency = "INR", receipt } = request.data as {
      amount: number;
      currency?: string;
      receipt: string;
    };

    if (!amount || amount < 1) {
      throw new HttpsError("invalid-argument", "A valid amount is required.");
    }

    try {
      // Amount must be in paise (1 INR = 100 paise)
      const order = await getRazorpayClient().orders.create({
        amount: Math.round(amount * 100),
        currency,
        receipt,
        payment_capture: true,
      });

      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
      };
    } catch (err: any) {
      console.error("Razorpay create order error:", err);
      throw new HttpsError("internal", "Failed to create Razorpay order.");
    }
  }
);

/**
 * verifyRazorpayPayment
 * Called from the frontend after successful payment.
 * Verifies the HMAC-SHA256 signature and updates the Firestore order to 'Paid'.
 */
export const verifyRazorpayPayment = onCall(
  { region: "us-central1" },
  async (request) => {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      firestoreOrderId,
    } = request.data as {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      firestoreOrderId: string;
    };

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !firestoreOrderId
    ) {
      throw new HttpsError("invalid-argument", "Missing payment verification fields.");
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new HttpsError("internal", "Razorpay secret not configured.");
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("Razorpay signature mismatch!");
      throw new HttpsError("permission-denied", "Payment signature verification failed.");
    }

    const db = admin.firestore();
    await db.collection("orders").doc(firestoreOrderId).update({
      paymentStatus: "Paid",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      status: "Confirmed",
      paidAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  }
);

export const getUserOrders = onCall(
  { region: "us-central1" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be logged in.");
    }

    const uid = request.auth.uid;
    const db = admin.firestore();

    const snapshot = await db.collection("orders")
      .where("userId", "==", uid)
      .orderBy("date", "desc")
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
);

export const createCatalogPaymentLink = onCall(
  { region: "us-central1" },
  async (request) => {
    const { items, shippingAddress, userId, callbackUrl } = request.data as {
      items: CheckoutItemInput[];
      shippingAddress: ShippingAddressInput;
      userId?: string;
      callbackUrl?: string;
    };

    if (!Array.isArray(items) || items.length === 0) {
      throw new HttpsError("invalid-argument", "At least one cart item is required.");
    }

    if (!shippingAddress || typeof shippingAddress !== "object") {
      throw new HttpsError("invalid-argument", "Shipping address is required.");
    }

    const { name, email, phone, address, city, pincode } = shippingAddress;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      throw new HttpsError("invalid-argument", "Customer name is required.");
    }
    if (!email || !validateEmail(email)) {
      throw new HttpsError("invalid-argument", "Valid email address is required.");
    }
    if (!phone || !validatePhone(phone)) {
      throw new HttpsError("invalid-argument", "Valid phone number is required.");
    }
    if (!address || typeof address !== "string" || address.trim().length === 0) {
      throw new HttpsError("invalid-argument", "Shipping address is required.");
    }
    if (!city || typeof city !== "string" || city.trim().length === 0) {
      throw new HttpsError("invalid-argument", "City is required.");
    }
    if (!pincode || !validatePincode(pincode)) {
      throw new HttpsError("invalid-argument", "Valid 6-digit pincode is required.");
    }

    let validatedCallbackUrl: string | undefined;
    if (callbackUrl && typeof callbackUrl === "string") {
      try {
        const parsed = new URL(callbackUrl);
        if (!isAllowedCallbackUrl(parsed)) {
          throw new HttpsError("invalid-argument", "Callback URL host is not allowed.");
        }
        validatedCallbackUrl = parsed.toString();
      } catch (error) {
        if (error instanceof HttpsError) {
          throw error;
        }
        throw new HttpsError("invalid-argument", "Invalid callback URL.");
      }
    }

    const db = admin.firestore();
    const normalizedItems: Array<{
      id: string;
      name: string;
      weight: string;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
    }> = [];

    for (const item of items) {
      if (!item.productId || !item.weight || !item.quantity || item.quantity < 1) {
        throw new HttpsError("invalid-argument", "Invalid cart item payload.");
      }

      const productSnap = await db.collection("products").doc(item.productId).get();
      if (!productSnap.exists) {
        throw new HttpsError("not-found", `Product not found: ${item.productId}`);
      }

      const product = productSnap.data() as {
        name?: string;
        isActive?: boolean;
        prices?: Array<{ weight: string; price: number; stock?: number }>;
      };

      if (!product.isActive) {
        throw new HttpsError("failed-precondition", `Product is not active: ${item.productId}`);
      }

      const variant = (product.prices || []).find((p) => p.weight === item.weight);
      if (!variant) {
        throw new HttpsError(
          "failed-precondition",
          `Price variant not found for ${item.productId} (${item.weight}).`
        );
      }

      if ((variant.stock ?? 0) < item.quantity) {
        throw new HttpsError(
          "failed-precondition",
          `Insufficient stock for ${product.name || item.productId} (${item.weight}).`
        );
      }

      const unitPrice = Number(variant.price || 0);
      if (unitPrice <= 0) {
        throw new HttpsError(
          "failed-precondition",
          `Invalid price configured for ${product.name || item.productId}.`
        );
      }

      normalizedItems.push({
        id: item.productId,
        name: product.name || item.productId,
        weight: item.weight,
        quantity: item.quantity,
        unitPrice,
        lineTotal: unitPrice * item.quantity,
      });
    }

    const subtotal = normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const shipping = subtotal > 1000 ? 0 : 50;
    const totalAmount = subtotal + shipping;

    let effectiveUserId: string;
    if (request.auth?.uid) {
      effectiveUserId = request.auth.uid;
      try {
        const userRef = db.collection("users").doc(effectiveUserId);
        const userSnap = await userRef.get();
        if (userSnap.exists) {
          const udata = userSnap.data() || {};
          const updatePayload: Record<string, any> = {};
          if (!udata.phone) updatePayload.phone = phone.trim();
          if (!udata.address) updatePayload.address = address.trim();
          if (!udata.city) updatePayload.city = city.trim();
          if (!udata.state && (shippingAddress as any).state) updatePayload.state = (shippingAddress as any).state.trim();
          if (!udata.pincode) updatePayload.pincode = pincode.trim();
          if (Object.keys(updatePayload).length > 0) {
            await userRef.update(updatePayload);
          }
        }
      } catch (err) {
        console.error("Error updating existing user profile during checkout:", err);
      }
    } else {
      // Guest Checkout: Check if a guest customer profile with this email already exists
      const userEmail = email.toLowerCase().trim();
      try {
        const usersSnap = await db.collection("users")
          .where("email", "==", userEmail)
          .limit(1)
          .get();
        
        if (!usersSnap.empty) {
          const guestDoc = usersSnap.docs[0];
          effectiveUserId = guestDoc.id;
          // Update address/details to the latest checkout details
          await guestDoc.ref.update({
            name: name.trim(),
            phone: phone.trim(),
            address: address.trim(),
            city: city.trim(),
            state: ((shippingAddress as any).state || "").trim(),
            pincode: pincode.trim(),
          });
        } else {
          // Create new guest customer record
          const newUserRef = db.collection("users").doc();
          effectiveUserId = newUserRef.id;
          await newUserRef.set({
            name: name.trim(),
            email: userEmail,
            phone: phone.trim(),
            address: address.trim(),
            city: city.trim(),
            state: ((shippingAddress as any).state || "").trim(),
            pincode: pincode.trim(),
            role: "Customer",
            createdAt: new Date().toISOString(),
            isGuest: true,
          });
        }
      } catch (err) {
        console.error("Error looking up/creating guest customer during checkout:", err);
        // Fallback to "guest" to prevent checkout block in case of database sync failure
        effectiveUserId = "guest";
      }
    }

    const orderDoc = await db.collection("orders").add({
      userId: effectiveUserId,
      date: new Date().toISOString(),
      items: normalizedItems.map((i) => ({
        id: i.id,
        name: i.name,
        weight: i.weight,
        quantity: i.quantity,
        price: i.unitPrice,
      })),
      totalAmount,
      shippingAddress: {
        name: sanitizeString(name),
        email: sanitizeString(email, 254),
        phone: sanitizeString(phone),
        address: sanitizeString(address),
        city: sanitizeString(city),
        pincode: sanitizeString(pincode),
      },
      customerName: sanitizeString(name),
      customerEmail: sanitizeString(email, 254),
      paymentStatus: "Pending",
      status: "Ordered",
      deliveryType: "Physical",
      trackingUpdates: [{
        status: "Ordered",
        timestamp: new Date().toISOString(),
        note: "Payment link created and shared with customer.",
      }],
    });

    const link = await getRazorpayClient().paymentLink.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      description: `Gaon Pure order ${orderDoc.id}`,
      reference_id: orderDoc.id,
      customer: {
        name: sanitizeString(name),
        email: sanitizeString(email, 254),
        contact: sanitizeString(phone),
      },
      notify: {
        sms: true,
        email: true,
      },
      reminder_enable: true,
      callback_url: validatedCallbackUrl || "https://gaonpure.com/profile",
      callback_method: "get",
      notes: {
        firestoreOrderId: orderDoc.id,
        requestedUserId: sanitizeString(userId || "guest"),
        source: "catalog-payment-link-agent",
      },
    });

    await orderDoc.update({
      razorpayPaymentLinkId: link.id,
      razorpayPaymentLinkStatus: link.status,
      razorpayPaymentLinkUrl: link.short_url,
    });

    return {
      schemaVersion: "2026-04-30",
      orderId: orderDoc.id,
      paymentLinkId: link.id,
      paymentLinkUrl: link.short_url,
      paymentStatus: "Pending",
      paymentLinkStatus: link.status || "created",
      amount: totalAmount,
      currency: "INR",
      amountBreakdown: {
        subtotal,
        shipping,
        total: totalAmount,
      },
    };
  }
);

export const razorpayWebhook = onRequest(
  { region: "us-central1" },
  async (req: Request, res: any) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const signature = req.header("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      res.status(400).send("Missing webhook signature or server configuration.");
      return;
    }

    const expected = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.rawBody)
      .digest("hex");

    if (expected !== signature) {
      res.status(401).send("Invalid signature.");
      return;
    }

    const payload = req.body as {
      event?: string;
      id?: string;
      payload?: {
        payment_link?: {
          entity?: {
            id?: string;
            reference_id?: string;
            status?: string;
          };
        };
        payment?: {
          entity?: {
            id?: string;
            notes?: {
              firestoreOrderId?: string;
            };
          };
        };
      };
    };


    const event = payload.event || "";
    const eventId = payload.id;

    if (!eventId) {
      res.status(400).send("Missing event ID in webhook payload.");
      return;
    }

    const paymentLinkEntity = payload.payload?.payment_link?.entity;
    const paymentEntity = payload.payload?.payment?.entity;
    const orderId =
      paymentLinkEntity?.reference_id ||
      paymentEntity?.notes?.firestoreOrderId ||
      "";

    if (!orderId) {
      res.status(200).send("No order reference found.");
      return;
    }

    const db = admin.firestore();
    const orderRef = db.collection("orders").doc(orderId);
    const eventRef = db.collection("razorpay_events").doc(eventId);

    try {
      await db.runTransaction(async (transaction) => {
        const eventDoc = await transaction.get(eventRef);
        if (eventDoc.exists) {
          throw new Error("ALREADY_PROCESSED");
        }

        const existingOrderDoc = await transaction.get(orderRef);
        if (!existingOrderDoc.exists) {
          throw new Error("ORDER_NOT_FOUND");
        }

        const existingOrderData = existingOrderDoc.data() || {};
        const existingPaymentLinkId =
          typeof existingOrderData.razorpayPaymentLinkId === "string"
            ? existingOrderData.razorpayPaymentLinkId
            : "";

        if (
          existingPaymentLinkId &&
          paymentLinkEntity?.id &&
          existingPaymentLinkId !== paymentLinkEntity.id
        ) {
          throw new Error("LINK_MISMATCH");
        }

        const updates: Record<string, unknown> = {
          lastWebhookEvent: event,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (paymentLinkEntity?.id) {
          updates.razorpayPaymentLinkId = paymentLinkEntity.id;
          updates.razorpayPaymentLinkStatus = paymentLinkEntity.status || "unknown";
        }

        if (event === "payment_link.paid") {
          updates.paymentStatus = "Paid";
          updates.status = "Confirmed";
          updates.paidAt = admin.firestore.FieldValue.serverTimestamp();
          if (paymentEntity?.id) {
            updates.razorpayPaymentId = paymentEntity.id;
          }
        }

        if (
          (event === "payment_link.expired" || event === "payment_link.cancelled") &&
          existingOrderData.paymentStatus !== "Paid"
        ) {
          updates.paymentStatus = "Failed";
          updates.status = "Cancelled";
        }

        transaction.set(orderRef, updates, { merge: true });
        transaction.set(eventRef, {
          processedAt: admin.firestore.FieldValue.serverTimestamp(),
          event: event,
          orderId: orderId,
        });
      });

      res.status(200).send("ok");
    } catch (e: any) {
      if (e.message === "ALREADY_PROCESSED") {
        res.status(200).send("Event already processed.");
      } else if (e.message === "ORDER_NOT_FOUND") {
        res.status(200).send("Order not found; webhook ignored.");
      } else if (e.message === "LINK_MISMATCH") {
        res.status(200).send("Payment link mismatch; webhook ignored.");
      } else {
        console.error("Webhook transaction error:", e);
        res.status(500).send("Internal server error.");
      }
    }
  }
);

export const reconcilePayments = onSchedule(
  {
    schedule: "0 */6 * * *", // Every 6 hours
    region: "us-central1",
    memory: "256MiB",
  },
  async (event) => {
    console.log("Starting payment reconciliation job...");
    const db = admin.firestore();
    const threshold = new Date();
    threshold.setHours(threshold.getHours() - 24);

    const pendingOrdersSnapshot = await db.collection("orders")
      .where("paymentStatus", "==", "Pending")
      .where("date", "<=", threshold.toISOString())
      .get();

    if (pendingOrdersSnapshot.empty) {
      console.log("No pending orders found for reconciliation.");
      return;
    }

    const razorpay = getRazorpayClient();

    for (const orderDoc of pendingOrdersSnapshot.docs) {
      const orderData = orderDoc.data();
      const linkId = orderData.razorpayPaymentLinkId;

      if (!linkId) {
        console.log(`Order ${orderDoc.id} has no payment link ID, skipping.`);
        continue;
      }

      try {
        const link = await razorpay.paymentLink.fetch(linkId);
        const status = link.status;

        if (status === "paid") {
          await orderDoc.ref.update({
            paymentStatus: "Paid",
            status: "Confirmed",
            paidAt: admin.firestore.FieldValue.serverTimestamp(),
            lastReconciliation: admin.firestore.FieldValue.serverTimestamp(),
          });
          console.log(`Order ${orderDoc.id} reconciled to PAID.`);
        } else if (status === "expired" || status === "cancelled") {
          await orderDoc.ref.update({
            paymentStatus: "Failed",
            status: "Cancelled",
            lastReconciliation: admin.firestore.FieldValue.serverTimestamp(),
          });
          console.log(`Order ${orderDoc.id} reconciled to CANCELLED/EXPIRED.`);
        } else {
          console.log(`Order ${orderDoc.id} is still ${status}, no update needed.`);
        }
      } catch (err) {
        console.error(`Error reconciling order ${orderDoc.id}:`, err);
      }
    }
    console.log(`Reconciliation job completed. Processed ${pendingOrdersSnapshot.size} orders.`);
  }
);
