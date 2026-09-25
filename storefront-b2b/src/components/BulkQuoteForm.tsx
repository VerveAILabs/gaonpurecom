'use client';

import React, { useState } from 'react';
import { 
  Building, 
  Send, 
  Calculator, 
  CheckCircle2, 
  FileText, 
  Percent, 
  Truck, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface ProductVariant {
  id: string;
  weight: string;
  price: number;
}

interface Product {
  id: string;
  name: string;
  variants: ProductVariant[];
  category?: { name: string } | null;
}

interface BulkQuoteFormProps {
  products: Product[];
}

export default function BulkQuoteForm({ products }: BulkQuoteFormProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(50); // in kg or liters
  const [companyName, setCompanyName] = useState<string>('');
  const [gstin, setGstin] = useState<string>('');
  const [contactName, setContactName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [pincode, setPincode] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  // Base rate per kg/L estimate
  const basePrice = selectedProduct?.variants?.[0]?.price
    ? Number(selectedProduct.variants[0].price)
    : 250;

  // Tier calculation:
  // < 25: 10% wholesale discount
  // 25 - 99: 20% discount
  // 100 - 499: 30% discount
  // 500+: 38% commercial enterprise discount
  let discountPercent = 10;
  let tierLabel = 'Starter Bulk (10-24 units)';
  if (quantity >= 500) {
    discountPercent = 38;
    tierLabel = 'Institutional Enterprise (500+ units)';
  } else if (quantity >= 100) {
    discountPercent = 30;
    tierLabel = 'Tier 2 Wholesale (100-499 units)';
  } else if (quantity >= 25) {
    discountPercent = 20;
    tierLabel = 'Tier 1 Wholesale (25-99 units)';
  }

  const wholesaleRatePerUnit = Math.round(basePrice * (1 - discountPercent / 100));
  const estimatedSubtotal = wholesaleRatePerUnit * quantity;
  const gstRate = 0.05; // 5% GST for basic food staples
  const gstAmount = Math.round(estimatedSubtotal * gstRate);
  const estimatedTotal = estimatedSubtotal + gstAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-stone-900/5 border border-stone-200/80 overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-stone-900 text-white p-6 sm:p-8">
        <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-widest text-emerald-300 mb-2">
          <Calculator className="w-4 h-4" /> Instant B2B Rate & Proforma Estimator
        </div>
        <h3 className="text-xl sm:text-2xl font-serif font-bold">
          Wholesale Quotation & Commercial Dispatch Request
        </h3>
        <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl">
          Get custom volume pricing tailored to your kitchen, retail chain, Ayurvedic clinic, or processing facility. Complete with GST ITC eligibility and COA certificate.
        </p>
      </div>

      {submitted ? (
        <div className="p-8 sm:p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h4 className="text-xl font-serif font-bold text-stone-900">
            Wholesale Quote Request Received!
          </h4>
          <p className="text-sm text-stone-600 max-w-md mx-auto">
            Thank you, <span className="font-semibold text-stone-900">{contactName || 'Valued Partner'}</span>. Our B2B Corporate Desk has generated RFQ reference <span className="font-mono font-bold text-emerald-700">GP-B2B-{Math.floor(100000 + Math.random() * 900000)}</span>.
          </p>
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 max-w-md mx-auto text-left text-xs space-y-2">
            <div className="flex justify-between text-stone-600">
              <span>Item Selected:</span>
              <span className="font-semibold text-stone-900">{selectedProduct?.name}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Quantity:</span>
              <span className="font-semibold text-stone-900">{quantity} kg / Liters</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Estimated Rate:</span>
              <span className="font-semibold text-emerald-700">₹{wholesaleRatePerUnit} / unit</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Approx. Total (incl. GST):</span>
              <span className="font-semibold text-stone-900">₹{estimatedTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <p className="text-xs text-stone-500">
            A formal proforma invoice with GST breakdown and batch COA will be dispatched to <span className="font-semibold">{email || 'your email'}</span> within 2 business hours.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-4 px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Submit Another RFQ
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Product & Volume Selector */}
            <div className="lg:col-span-7 space-y-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-emerald-600" /> Sourcing Requirements
              </h4>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Select Farm Commodity / Product
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full text-xs font-medium bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.category?.name ? `(${p.category.name})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-stone-700">
                    Bulk Volume Requirement (Units in Kg / Liters)
                  </label>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {quantity} Units
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                  <span>10 kg (Min)</span>
                  <span>50 kg</span>
                  <span>200 kg</span>
                  <span>500 kg</span>
                  <span>1,000+ kg</span>
                </div>
              </div>

              {/* Volume Tier Badge Card */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-stone-800 uppercase tracking-wide flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    {tierLabel}
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    Unlocks <span className="font-bold text-emerald-700">{discountPercent}% discount</span> off consumer retail
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-serif font-black text-emerald-800">
                    ₹{wholesaleRatePerUnit}
                    <span className="text-[10px] font-sans font-normal text-stone-500">/unit</span>
                  </div>
                  <div className="text-[10px] line-through text-stone-400">
                    Retail: ₹{basePrice}
                  </div>
                </div>
              </div>

              {/* Live Quotation Summary Box */}
              <div className="bg-emerald-900 text-white rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-xs text-emerald-200">
                  <span>Estimated Net Value ({quantity} × ₹{wholesaleRatePerUnit}):</span>
                  <span className="font-mono">₹{estimatedSubtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs text-emerald-200">
                  <span>GST (5% ITC Eligible):</span>
                  <span className="font-mono">₹{gstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-emerald-800 pt-2 flex justify-between items-baseline">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Estimated Proforma Total:
                  </span>
                  <span className="text-lg font-mono font-bold text-emerald-100">
                    ₹{estimatedTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Business & Buyer Details */}
            <div className="lg:col-span-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" /> Buyer Credentials
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Company / Enterprise / Farm Entity *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Organic Heritage Foods LLP"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    GSTIN (For ITC Benefit)
                  </label>
                  <input
                    type="text"
                    placeholder="22AAAAA0000A1Z5"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    className="w-full text-xs font-mono uppercase bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Delivery Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 110001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full text-xs font-mono bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Procurement Head"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Business Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="procurement@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Special Packaging / Frequency Instructions
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Need 15L tin packaging; weekly recurring shipments..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <span>Generating Proforma...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Request Official Proforma Invoice
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 text-[10px] text-stone-500">
                <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Pan-India surface pallet freight available. Safe tamper-proof food drums.</span>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
