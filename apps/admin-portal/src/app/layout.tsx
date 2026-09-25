import type { Metadata } from 'next';
import './globals.css';
import AdminLayoutShell from '@/components/AdminLayoutShell';

export const metadata: Metadata = {
  title: 'Gaon Pure — Admin Console',
  description: 'Mission Control for Gaon Pure Storefront',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50 text-stone-900">
        <AdminLayoutShell>
          {children}
        </AdminLayoutShell>
      </body>
    </html>
  );
}
