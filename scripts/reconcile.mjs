// Force emulator connections
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';

import admin from 'firebase-admin';
import Razorpay from 'razorpay';
import fs from 'fs';
import path from 'path';

// Parse env variables
const envPath = path.resolve(process.cwd(), '.env.local');
const funcEnvPath = path.resolve(process.cwd(), 'functions', '.env');
let projectId = 'gaonpurecom';

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/^\s*NEXT_PUBLIC_FIREBASE_PROJECT_ID\s*=\s*["']?([^"'\r\n]+)/);
  if (match) projectId = match[1];
} catch (err) {}

// Read Razorpay credentials from functions/.env
let keyId = '', keySecret = '';
try {
  const content = fs.readFileSync(funcEnvPath, 'utf8');
  const keyIdMatch = content.match(/^RAZORPAY_KEY_ID\s*=\s*(.+)$/m);
  const keySecretMatch = content.match(/^RAZORPAY_KEY_SECRET\s*=\s*(.+)$/m);
  if (keyIdMatch) keyId = keyIdMatch[1].trim().replace(/['"]/g, '');
  if (keySecretMatch) keySecret = keySecretMatch[1].trim().replace(/['"]/g, '');
} catch (err) {
  console.error('Could not load Razorpay keys from functions/.env:', err.message);
  process.exit(1);
}

if (!keyId || !keySecret) {
  console.error('Razorpay keys not found in functions/.env');
  process.exit(1);
}

admin.initializeApp({ projectId });
const db = admin.firestore();
const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

async function runReconciliation() {
  console.log('Starting local payment reconciliation...');
  
  const pendingOrdersSnapshot = await db.collection('orders')
    .where('paymentStatus', '==', 'Pending')
    .get();

  if (pendingOrdersSnapshot.empty) {
    console.log('No pending orders found in local database.');
    return;
  }

  console.log(`Found ${pendingOrdersSnapshot.size} pending orders. Checking statuses with Razorpay...`);

  for (const orderDoc of pendingOrdersSnapshot.docs) {
    const orderData = orderDoc.data();
    const linkId = orderData.razorpayPaymentLinkId;

    if (!linkId) {
      console.log(`Order ${orderDoc.id} has no payment link ID. Skipping.`);
      continue;
    }

    try {
      console.log(`Checking link ${linkId} for order ${orderDoc.id}...`);
      const link = await razorpay.paymentLink.fetch(linkId);
      const status = link.status;
      console.log(`Razorpay Status: ${status}`);

      if (status === 'paid') {
        await orderDoc.ref.update({
          paymentStatus: 'Paid',
          status: 'Confirmed',
          paidAt: admin.firestore.FieldValue.serverTimestamp(),
          lastReconciliation: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`✅ Order ${orderDoc.id} successfully updated to PAID!`);
      } else if (status === 'expired' || status === 'cancelled') {
        await orderDoc.ref.update({
          paymentStatus: 'Failed',
          status: 'Cancelled',
          lastReconciliation: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`❌ Order ${orderDoc.id} updated to CANCELLED/EXPIRED.`);
      } else {
        console.log(`Order ${orderDoc.id} is still in state: "${status}". No changes made.`);
      }
    } catch (err) {
      console.error(`Error reconciling order ${orderDoc.id}:`, err.message);
    }
  }
}

runReconciliation().then(() => {
  console.log('Reconciliation run complete!');
  process.exit(0);
});
