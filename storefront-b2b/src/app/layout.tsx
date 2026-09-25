import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Gaon Pure Wholesale & B2B | Bulk Farm-Direct Organic Commodities',
  description: 'Direct farm-to-enterprise supply of A2 Desi Cow Ghee, Cold-Pressed Mustard Oils, Forest Honey, and Natural Spices. Bulk volume pricing, lab-certified batches, and GST ITC eligible.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-emerald-200 selection:text-emerald-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
