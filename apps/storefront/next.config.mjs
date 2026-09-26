import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectSrc = [
  "'self'",
  "https:",
  "wss:",
  "*.razorpay.com",
  "*.rzp.io",
  "http://localhost:*",
  "http://127.0.0.1:*",
  "ws://localhost:*",
  "ws://127.0.0.1:*",
].join(' ');

const imgSrc = [
  "'self'",
  "data:",
  "https:",
  "*.razorpay.com",
  "*.rzp.io",
  "http://localhost:*",
  "http://127.0.0.1:*",
].join(' ');

const csp = `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' checkout.razorpay.com *.razorpay.com cdn.jsdelivr.net apis.google.com www.gstatic.com; style-src 'self' 'unsafe-inline' cdn.jsdelivr.net; img-src ${imgSrc}; font-src 'self' data:; connect-src ${connectSrc}; frame-src 'self' checkout.razorpay.com *.razorpay.com *.rzp.io apis.google.com *.firebaseapp.com;`;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.resolve(__dirname, '../../'),
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
