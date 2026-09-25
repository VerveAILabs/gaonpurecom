import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Mail, Phone, MapPin, Award, Truck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-serif font-black text-lg shadow-md shadow-emerald-950">
                GP
              </div>
              <div>
                <span className="font-serif text-xl font-bold text-white tracking-wide">
                  Gaon Pure
                </span>
                <span className="block text-[10px] tracking-widest text-emerald-400 font-semibold uppercase">
                  Wholesale & Bulk Sourcing
                </span>
              </div>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Empowering food businesses, restaurants, Ayurvedic practitioners, and institutional buyers with authentic, laboratory-tested farm produce directly sourced from rural producers.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-stone-800/80 px-3 py-2 rounded-lg border border-stone-700/60">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>FSSAI Certified & GST Input Tax Credit Ready</span>
            </div>
          </div>

          {/* Col 2: Bulk Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Wholesale Commodities
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <Link href="#catalog" className="hover:text-emerald-400 transition-colors">
                  A2 Vedic Desi Ghee (Tin / Drum 15L - 50L)
                </Link>
              </li>
              <li>
                <Link href="#catalog" className="hover:text-emerald-400 transition-colors">
                  Wood-Pressed Mustard Oil (Bulk Cans 15kg - 50kg)
                </Link>
              </li>
              <li>
                <Link href="#catalog" className="hover:text-emerald-400 transition-colors">
                  Single-Origin Raw Forest Honey (20kg - 50kg Buckets)
                </Link>
              </li>
              <li>
                <Link href="#catalog" className="hover:text-emerald-400 transition-colors">
                  Organic A2 Turmeric Powder (Bulk Sacks 10kg - 50kg)
                </Link>
              </li>
              <li>
                <Link href="#catalog" className="hover:text-emerald-400 transition-colors">
                  Natural Stone Ground Flours & Grains
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: B2B Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Institutional Programs
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li className="flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Private Label & White Label Packaging</span>
              </li>
              <li className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Inter-State Pallet Freight Logistics</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>COA & Lab Purity Reports per Batch</span>
              </li>
              <li className="flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Flexible Credit for Verified Corporates</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Desk */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Wholesale Trade Desk
            </h4>
            <div className="space-y-3 text-xs text-stone-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Gaon Pure Agrotech Hub,<br />
                  Varanasi-Lucknow Highway, Uttar Pradesh, India
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="tel:+919876543210" className="hover:text-emerald-400">
                  +91 98765 43210
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="mailto:b2b@gaonpure.com" className="hover:text-emerald-400">
                  b2b@gaonpure.com
                </a>
              </div>
              <div className="pt-2 text-[11px] text-stone-500">
                GSTIN: 09AAACG1234F1Z5
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between text-[11px] text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} Gaon Pure Agrotech Private Limited. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="http://localhost:3000" className="hover:text-stone-300">
              Retail B2C Store
            </Link>
            <Link href="#pricing" className="hover:text-stone-300">
              Volume Tier Policy
            </Link>
            <Link href="#inquiry" className="hover:text-stone-300">
              Trade Inquiry
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
