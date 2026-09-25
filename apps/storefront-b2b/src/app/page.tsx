import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import BulkQuoteForm from '@/components/BulkQuoteForm';
import { 
  ShieldCheck, 
  Truck, 
  Boxes, 
  Award, 
  FileCheck, 
  Percent, 
  CheckCircle, 
  ChevronRight,
  Warehouse,
  Flame,
  Clock,
  ArrowRight
} from 'lucide-react';

export const revalidate = 60; // revalidate catalog every minute

export default async function B2BHomePage() {
  let products = [];
  try {
    products = await prisma.product.findMany({
      include: {
        category: true,
        variants: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    console.error('Error fetching B2B products from Neon DB:', error);
    // Fallback static data if DB is temporarily loading
    products = [
      {
        id: 'fallback-ghee',
        name: 'A2 Gir Cow Desi Ghee (Bilona Method)',
        description: 'Vedic bilona cultured curd ghee from free-grazing indigenous Gir cows. Bulk packaged in airtight food-grade 15L tins & 50L drums.',
        category: { name: 'Dairy & Desi Ghee' },
        variants: [
          { id: 'v1', weight: '15L Tin', price: 23500 },
          { id: 'v2', weight: '50L Drum', price: 74000 }
        ],
        imageUrl: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=600&auto=format&fit=crop'
      },
      {
        id: 'fallback-oil',
        name: 'Wood-Pressed Mustard Oil (Kachi Ghani)',
        description: 'Cold-pressed under 35°C in wooden Kolhu. High pungency, natural allyl isothiocyanate preserved. 15kg Tin & 50kg Food Drums.',
        category: { name: 'Cold-Pressed Oils' },
        variants: [
          { id: 'v3', weight: '15kg Tin', price: 3450 },
          { id: 'v4', weight: '50kg Drum', price: 10800 }
        ],
        imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop'
      }
    ];
  }

  const formattedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description || '',
    imageUrl: p.imageUrl,
    category: p.category ? { name: p.category.name } : null,
    variants: (p.variants || []).map((v) => ({
      id: v.id,
      weight: v.weight,
      price: Number(v.price),
    })),
  }));

  return (
    <div className="min-h-screen bg-stone-50">
      {/* 1. Hero Section */}
      <section className="relative bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 text-white overflow-hidden py-16 sm:py-24">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_50%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <Warehouse className="w-3.5 h-3.5" /> Farm Direct Wholesale • Institutional Sourcing
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                Authentic Farm Produce for <span className="text-emerald-400">Enterprises & Kitchens</span>
              </h1>
              <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-2xl">
                Source A2 Gir cow ghee, cold-pressed oils, wild forest honey, and unadulterated spices directly from verified rural clusters. 
                Full GST Input Tax Credit (ITC), batch lab test certificates (COA), and pallet freight across India.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#inquiry"
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-900/40 transition-all flex items-center gap-2"
                >
                  <Boxes className="w-4 h-4" /> Request Volume Quote
                </a>
                <a
                  href="#catalog"
                  className="px-6 py-3.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                >
                  View Bulk Catalog <ChevronRight className="w-4 h-4" />
                </a>
              </div>

              {/* Badges */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-stone-800/80">
                <div className="flex items-center gap-2 text-xs text-stone-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>FSSAI Certified</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-300">
                  <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>GST ITC Invoicing</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-300">
                  <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>COA per Batch</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-300">
                  <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Pallet Freight</span>
                </div>
              </div>
            </div>

            {/* Right: Key Stats / Quick Highlights */}
            <div className="lg:col-span-5">
              <div className="bg-stone-800/80 backdrop-blur-md border border-stone-700/60 rounded-3xl p-6 sm:p-8 space-y-6">
                <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" /> Enterprise Sourcing Benchmarks
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 bg-stone-900/60 p-3.5 rounded-xl border border-stone-700/40">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">0% Synthetic Additives or Emulsifiers</div>
                      <div className="text-[11px] text-stone-400">Strict cold-press and hand-churned Vedic methods preserved at scale.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-stone-900/60 p-3.5 rounded-xl border border-stone-700/40">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">Direct Farm Cluster Procurement</div>
                      <div className="text-[11px] text-stone-400">Fair price paid directly to smallholder farmers and Gaushalas without middlemen.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-stone-900/60 p-3.5 rounded-xl border border-stone-700/40">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">Tailored Industrial Packaging</div>
                      <div className="text-[11px] text-stone-400">Airtight 15L food tins, 25kg vacuum packs, and 50L/200L stainless drums.</div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <span className="text-[11px] text-stone-400">
                    Need retail packs for your personal pantry?{' '}
                    <a href="http://localhost:3000" className="text-emerald-400 hover:underline font-semibold">
                      Visit Retail Store &rarr;
                    </a>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Volume Pricing Tiers */}
      <section id="pricing" className="py-16 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full mb-3 border border-emerald-200">
            <Percent className="w-3.5 h-3.5" /> Volume Pricing Structure
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Wholesale Tiers Designed for Growing Businesses
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2">
            Transparent tiered discounts applied automatically based on consignment weight and recurring order volume.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tier 1 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                Tier 1 • Boutique / Kitchens
              </div>
              <h3 className="text-xl font-serif font-bold text-stone-900">
                25 kg – 99 kg
              </h3>
              <div className="mt-4 flex items-baseline gap-1 text-emerald-700">
                <span className="text-3xl font-black font-serif">20%</span>
                <span className="text-xs font-bold uppercase">Off Consumer MRP</span>
              </div>
              <ul className="mt-6 space-y-3 text-xs text-stone-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Standard 5kg & 15kg food-grade packaging</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Official GST Tax Invoice (5% ITC)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Batch Quality Certificate</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>3-5 Business Days Pan-India Dispatch</span>
                </li>
              </ul>
            </div>
            <a
              href="#inquiry"
              className="mt-8 block text-center py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors"
            >
              Select Tier 1
            </a>
          </div>

          {/* Tier 2: Popular */}
          <div className="bg-emerald-900 text-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-600 shadow-xl relative flex flex-col justify-between">
            <div className="absolute -top-3 right-6 bg-emerald-500 text-stone-950 font-bold uppercase text-[10px] tracking-wider px-3 py-0.5 rounded-full shadow-md">
              Most Popular
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-1">
                Tier 2 • Distributors & Chains
              </div>
              <h3 className="text-xl font-serif font-bold text-white">
                100 kg – 499 kg
              </h3>
              <div className="mt-4 flex items-baseline gap-1 text-emerald-300">
                <span className="text-3xl font-black font-serif">30%</span>
                <span className="text-xs font-bold uppercase">Off Consumer MRP</span>
              </div>
              <ul className="mt-6 space-y-3 text-xs text-emerald-100">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>15L / 50L bulk drums & 25kg sacks</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Discounted pallet freight rates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Dedicated Relationship Manager</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Batch NMR & Laboratory Purity Analysis</span>
                </li>
              </ul>
            </div>
            <a
              href="#inquiry"
              className="mt-8 block text-center py-2.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 rounded-xl text-xs font-bold shadow-md transition-colors"
            >
              Select Tier 2
            </a>
          </div>

          {/* Tier 3 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                Tier 3 • Institutional & Private Label
              </div>
              <h3 className="text-xl font-serif font-bold text-stone-900">
                500 kg+ / Metric Tons
              </h3>
              <div className="mt-4 flex items-baseline gap-1 text-emerald-700">
                <span className="text-3xl font-black font-serif">38%+</span>
                <span className="text-xs font-bold uppercase">Enterprise Contract</span>
              </div>
              <ul className="mt-6 space-y-3 text-xs text-stone-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Custom private-label packaging support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Annual harvest forward-contracting</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Free surface container logistics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>15-day credit terms upon verification</span>
                </li>
              </ul>
            </div>
            <a
              href="#inquiry"
              className="mt-8 block text-center py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Enterprise Contract
            </a>
          </div>
        </div>
      </section>

      {/* 3. Bulk Commodity Catalog */}
      <section id="catalog" className="py-16 bg-stone-100 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
                Neon DB Live Catalog
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                Available Wholesale Commodities
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                All commodities available in commercial food-grade packaging with batch traceability.
              </p>
            </div>
            <a
              href="#inquiry"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              Request custom commodity not listed &rarr;
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {formattedProducts.map((product) => {
              const basePrice = product.variants?.[0]?.price ? Number(product.variants[0].price) : 250;
              const wholesalePrice20 = Math.round(basePrice * 0.8);
              const wholesalePrice30 = Math.round(basePrice * 0.7);

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {product.imageUrl ? (
                      <div className="relative h-48 w-full bg-stone-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                          {product.category?.name || 'Organic Staple'}
                        </div>
                      </div>
                    ) : (
                      <div className="h-48 w-full bg-stone-100 flex items-center justify-center text-stone-400">
                        <Boxes className="w-12 h-12" />
                      </div>
                    )}

                    <div className="p-5 space-y-3">
                      <h3 className="font-serif font-bold text-base text-stone-900 leading-snug">
                        {product.name}
                      </h3>
                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      {/* Wholesale pricing badge */}
                      <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/80 space-y-1 text-xs">
                        <div className="flex justify-between items-center text-stone-500">
                          <span>Retail Benchmark:</span>
                          <span className="line-through">₹{basePrice}/unit</span>
                        </div>
                        <div className="flex justify-between items-center font-bold text-emerald-800">
                          <span>Tier 1 (25-99 units):</span>
                          <span>₹{wholesalePrice20}/unit</span>
                        </div>
                        <div className="flex justify-between items-center font-bold text-emerald-950">
                          <span>Tier 2 (100+ units):</span>
                          <span className="text-emerald-700">₹{wholesalePrice30}/unit</span>
                        </div>
                      </div>

                      {/* Variants tags */}
                      {product.variants && product.variants.length > 0 && (
                        <div className="pt-1">
                          <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                            Available Pack Sizes:
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {product.variants.map((v) => (
                              <span
                                key={v.id}
                                className="text-[11px] font-mono font-medium bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md border border-stone-200"
                              >
                                {v.weight}
                              </span>
                            ))}
                            <span className="text-[11px] font-mono font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200">
                              15L / 50kg Bulk
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <a
                      href="#inquiry"
                      className="block w-full text-center py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      Inquire Wholesale Price
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Interactive Quotation Form */}
      <section id="inquiry" className="py-16 max-w-7xl mx-auto px-6">
        <BulkQuoteForm products={formattedProducts} />
      </section>

      {/* 5. Quality Assurance & Lab Verification */}
      <section id="why-us" className="py-16 bg-white border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Standard Operating Procedures
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 leading-tight">
                Purity Guaranteed at Commercial Volume
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Unlike bulk commodity brokers who blend synthetic oils or feed lot butter, Gaon Pure maintains strict cold extraction and hand-churned Vedic curd standards from farm to dispatch container.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">Zero Heating Cold Pressing</h4>
                    <p className="text-[11px] text-stone-500">Mustard, groundnut, and sesame oils are extracted below 35°C in wooden Ghani without any chemical solvent washing.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">Bilona Churned Cultured Curd</h4>
                    <p className="text-[11px] text-stone-500">Desi cow ghee is made strictly from whole milk curd churned with wooden bilona—no direct cream boiling or vegetable fat mixing.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">Certificate of Analysis (COA) per Consignment</h4>
                    <p className="text-[11px] text-stone-500">Every bulk dispatch includes batch NMR, moisture content, peroxide value, and fatty acid profile reports for your QC files.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 bg-stone-50 p-8 rounded-3xl border border-stone-200 space-y-6">
              <h3 className="text-lg font-serif font-bold text-stone-900">
                Frequently Asked Institutional Questions
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-stone-800">What is the minimum order quantity (MOQ)?</h4>
                  <p className="text-stone-500 mt-1">Our standard wholesale MOQ is 25 kg/Liters for consolidated orders. For sample evaluations, we provide 2kg testing kits.</p>
                </div>

                <div className="border-t border-stone-200 pt-3">
                  <h4 className="font-bold text-stone-800">Do you offer GST input credit invoices?</h4>
                  <p className="text-stone-500 mt-1">Yes, all consignments are dispatched with GST e-Invoices and e-Way bills. You can claim 5% or 12% ITC depending on the commodity.</p>
                </div>

                <div className="border-t border-stone-200 pt-3">
                  <h4 className="font-bold text-stone-800">How is shipping and transit insurance handled?</h4>
                  <p className="text-stone-500 mt-1">We partner with major surface freight carriers (VRL, Safexpress, BlueDart) with full transit risk insurance and GPS tracking.</p>
                </div>

                <div className="border-t border-stone-200 pt-3">
                  <h4 className="font-bold text-stone-800">Can you package in our custom private-label brand?</h4>
                  <p className="text-stone-500 mt-1">Yes, for orders exceeding 500kg per month, our facility handles custom white-label filling, labeling, and barcoding according to your specifications.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
