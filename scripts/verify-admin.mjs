// Force emulator connections at the very top
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Parse .env.local file to get Firebase project ID
const envPath = path.resolve(process.cwd(), '.env.local');
let projectId = 'gaonpurecom'; // fallback default

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    const match = line.match(/^\s*NEXT_PUBLIC_FIREBASE_PROJECT_ID\s*=\s*["']?([^"'\r\n]+)/);
    if (match) {
      projectId = match[1];
    }
  }
} catch (err) {
  console.warn('Could not read .env.local, using default projectId:', projectId);
}

admin.initializeApp({
  projectId: projectId
});

const auth = admin.auth();
const db = admin.firestore();

async function verifyUser() {
  const email = 'rds087@gmail.com';
  console.log(`Searching for user with email "${email}" in the emulator...`);
  
  try {
    const user = await auth.getUserByEmail(email);
    console.log(`Found user: ${user.displayName || 'Customer'} (UID: ${user.uid})`);
    
    // Set emailVerified to true in Auth
    await auth.updateUser(user.uid, {
      emailVerified: true
    });
    console.log(`Successfully marked email ${email} as VERIFIED in the Auth emulator!`);
    
    console.log(`Ensuring ${email} is promoted in the admin_users Firestore collection...`);
    await db.collection('admin_users').doc(user.uid).set({
      isAdmin: true,
      email: email,
      createdAt: new Date().toISOString()
    }, { merge: true });
    
    console.log(`Successfully promoted UID ${user.uid} to Admin in Firestore!`);
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      console.error(`Error: User with email "${email}" was not found. Make sure you signed up first in the browser!`);
    } else {
      console.error('Error verifying user:', err);
    }
    process.exit(1);
  }
}

verifyUser();
