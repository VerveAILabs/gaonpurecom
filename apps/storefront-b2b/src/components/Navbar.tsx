'use client';

import Link from 'next/link';
import { 
  Building2, 
  ShoppingBag, 
  ExternalLink, 
  FileCheck, 
  PhoneCall,
  Boxes
} from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200">
      {/* Top Bar */}
      <div className="bg-stone-900 text-stone-300 text-[11px] py-1.5 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            Official B2B Wholesale Portal — GST Tax Input Credit Eligible
          </span>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <a href="tel:+919876543210" className="hover:text-white flex items-center gap-1">
              <PhoneCall className="w-3 h-3 text-emerald-400" />
              Wholesale Desk: +91 98765 43210
            </a>
            <a 
              href="http://localhost:3000" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              Switch to Retail Store <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
        {/* Logo & Identity */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-700 flex items-center justify-center text-white font-serif font-black text-lg shadow-md shadow-emerald-900/30">
            GP
          </div>
          <div>
            <div className="font-serif text-xl font-bold text-stone-900 leading-tight">
              Gaon Pure <span className="text-xs uppercase tracking-widest font-sans font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md ml-1">Wholesale</span>
            </div>
            <div className="text-[10px] text-stone-500 tracking-wider uppercase font-semibold">
              Bulk Agricultural Sourcing
            </div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-stone-600">
          <Link href="#catalog" className="hover:text-emerald-700 transition-colors">
            Bulk Catalog
          </Link>
          <Link href="#pricing" className="hover:text-emerald-700 transition-colors">
            Volume Tiers
          </Link>
          <Link href="#why-us" className="hover:text-emerald-700 transition-colors">
            Quality & Certifications
          </Link>
          <Link href="#inquiry" className="hover:text-emerald-700 transition-colors">
            Custom Quote
          </Link>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <a
            href="#inquiry"
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-2"
          >
            <Boxes className="w-3.5 h-3.5" /> Request Wholesale Quote
          </a>
        </div>
      </div>
    </header>
  );
}
