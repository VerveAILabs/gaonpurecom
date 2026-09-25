import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'gp_admin_session';
const SECRET_KEY = process.env.SESSION_SECRET || 'gp_admin_secret_2026_secure_jwt_token_key_gaonpure';

interface AdminSessionPayload {
  uid: string;
  email: string;
  name?: string;
  role: string;
  exp: number;
}

// Convert string key to CryptoKey
async function getCryptoKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(SECRET_KEY);
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

// Base64Url helper
function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return atob(str);
}

// Create a tamper-proof signed session token
export async function signSession(payload: Omit<AdminSessionPayload, 'exp'>, expiresInDays = 7): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + expiresInDays * 24 * 60 * 60;
  const fullPayload: AdminSessionPayload = { ...payload, exp };
  
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const data = `${encodedHeader}.${encodedPayload}`;

  const key = await getCryptoKey();
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(data)
  );

  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signatureBase64 = base64UrlEncode(String.fromCharCode(...signatureArray));

  return `${data}.${signatureBase64}`;
}

// Verify a signed session token
export async function verifySession(token: string): Promise<AdminSessionPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signatureBase64] = parts;
    const data = `${encodedHeader}.${encodedPayload}`;

    const key = await getCryptoKey();
    
    // Decode signature
    const binarySignature = base64UrlDecode(signatureBase64);
    const signatureBytes = new Uint8Array(binarySignature.length);
    for (let i = 0; i < binarySignature.length; i++) {
      signatureBytes[i] = binarySignature.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      new TextEncoder().encode(data)
    );

    if (!isValid) return null;

    const payload: AdminSessionPayload = JSON.parse(base64UrlDecode(encodedPayload));
    
    // Check expiration
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}

// Set session in response cookies
export async function setAdminSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

// Clear session cookie
export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// Get and verify current session from request
export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}
