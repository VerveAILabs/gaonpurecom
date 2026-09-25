'use client';

import { ProductCard } from '@/components/ProductCard';
import { ArrowRight, Leaf, Waves, CheckCircle2, ShieldCheck, HelpCircle, Landmark } from 'lucide-react';
import Link from 'next/link';
import { subscribeToProducts, Product } from '@/store/useCatalogStore';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Grains info data for interactive explorer
const grainDetails: Record<string, { name: string; desc: string; benefit: string; symbol: string }> = {
  Jowar: { symbol: '🌾', name: 'Jowar (Sorghum)', desc: 'Sourced from dry farming belts, Jowar is a gluten-free grain rich in dietary fiber that promotes digestive health and regulates blood sugar levels.', benefit: 'Digestive Health · Gluten-Free' },
  Bajra: { symbol: '🌾', name: 'Bajra (Pearl Millet)', desc: 'A traditional winter favorite harvested in sandy fields, Bajra is loaded with iron, magnesium, and essential amino acids to support energy levels and heart health.', benefit: 'Iron Rich · Heart Friendly' },
  Chana: { symbol: '🌱', name: 'Chana (Bengal Gram)', desc: 'Provides high-quality plant protein. We use desi chana which is roasted lightly under clay sand and stone-split in villages.', benefit: 'High Protein · Amino Acids' },
  Makka: { symbol: '🌽', name: 'Makka (Yellow Maize)', desc: 'Sun-dried in rural courtyards, our yellow maize provides natural beta-carotenes, fiber, and an authentic sweet flavor.', benefit: 'Vision Health · Antioxidants' },
  Ragi: { symbol: '🌾', name: 'Ragi (Finger Millet)', desc: 'The calcium champion of grains. Cultivated traditionally, Ragi is highly recommended for bone strength and natural development.', benefit: 'Bone Strength · Calcium Rich' },
  Moong: { symbol: '🌱', name: 'Moong (Green Gram)', desc: 'Light, cooling, and highly digestible. Moong beans are sourced directly from small village clusters right after harvest.', benefit: 'Easy Digestion · Protein' },
  Soybeen: { symbol: '🌱', name: 'Soybeen (Soybean)', desc: 'A powerhouse of proteins and healthy fats, cleaned manually to avoid machine oil contaminations.', benefit: 'Plant Protein · Heart Health' },
  Jau: { symbol: '🌾', name: 'Jau (Barley)', desc: 'An ancient grain famous for its detoxifying properties. Jau helps in body cooling, blood sugar control, and slow digestion.', benefit: 'Detoxifying · Low Glycemic' },
  Sawa: { symbol: '🌾', name: 'Sawa (Barnyard Millet)', desc: 'A fast-growing ancient millet packed with digestible fiber. Sourced from traditional smallholder farms.', benefit: 'Low GI · High Fiber' },
  Kodo: { symbol: '🌾', name: 'Kodo Millet', desc: 'An eco-friendly, ancient grain rich in polyphenols and antioxidants. Perfect for building natural immunity.', benefit: 'Antioxidant · Immune Support' },
  Kutki: { symbol: '🌾', name: 'Kutki (Little Millet)', desc: 'Highly rich in zinc, magnesium, and iron. Grown in remote forest-fringe village communities using ancestral methods.', benefit: 'Mineral Rich · Gut Friendly' },
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeProducts, setActiveProducts] = useState<Product[]>([]);
  const [activeGrain, setActiveGrain] = useState<string>('Jowar');

  useEffect(() => {
    setMounted(true);
    const unsubscribe = subscribeToProducts((products) => {
      setActiveProducts(products.filter(p => p.isActive));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">

      {/* ——— Hero Section (Typography & Text Driven) ——— */}
      <section className="page-hero min-h-[85vh] flex items-center paper-texture">
        {/* Subtle decorative wheat pattern overlay via css grid lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#dfa867_1.5px,transparent_1.5px)] [background-size:40px_40px] opacity-[0.025]" />
        
        <div className="container mx-auto px-4 z-10 grid md:grid-cols-5 gap-12 items-center pt-12 max-w-7xl">
          
          {/* Main Hero Copy */}
          <div className="space-y-7 md:col-span-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-primary/5 border border-brand-primary/15 backdrop-blur-md">
              <Leaf className="w-3.5 h-3.5 text-brand-primary" />
              <span className="text-[10px] font-bold text-brand-primary tracking-widest uppercase">
                100% Traditional · FSSAI Certified
              </span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold font-serif text-brand-secondary leading-[1.1] tracking-tight">
              Raw, Pure & <br />
              <span className="text-brand-primary italic font-normal">Produced in Villages.</span>
            </h1>
            
            <p className="text-base md:text-lg text-stone-600 leading-relaxed max-w-xl font-medium">
              We bring the unadulterated goodness of traditional stone-ground multigrain flour and cold-pressed products directly from Indian village farms. Crafted slowly to preserve essential vitamins, oils, and fibers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-3">
              <Link href="/shop"
                className="btn-primary flex items-center justify-center gap-2 group text-xs uppercase tracking-widest bg-brand-primary text-white border-none shadow-lg">
                Explore Shop
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="#processing"
                className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest border border-brand-secondary/25 text-brand-secondary hover:bg-brand-secondary/5 font-bold px-7 py-3.5 rounded-full transition-all duration-300">
                Learn Our Process
              </Link>
            </div>

            {/* FSSAI badge */}
            <div className="inline-flex items-center gap-2.5 bg-stone-50 border border-stone-200/50 rounded-2xl px-4 py-3 text-stone-600 text-xs mt-4 font-semibold shadow-sm">
              <ShieldCheck className="w-4 h-4 text-brand-primary shrink-0" />
              <span>FSSAI Registered License No. <strong className="text-stone-850">22726257000084</strong></span>
            </div>
          </div>

          {/* Side Editorial Statement */}
          <div className="md:col-span-2 bg-white/80 border border-stone-200/60 shadow-sm p-8 rounded-3xl space-y-6 text-stone-850 text-left relative overflow-hidden paper-texture">
            <div className="absolute top-0 right-0 w-16 h-16 bg-brand-primary/5 rounded-bl-full border-b border-l border-stone-200/40 flex items-center justify-center">
              <Landmark className="w-5 h-5 text-brand-primary" />
            </div>
            <div className="text-xs uppercase tracking-widest text-brand-primary font-bold">Authenticity Promise</div>
            <h3 className="text-2xl font-serif text-brand-secondary font-bold leading-snug">Sourced Directly From Farmer Collectives</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              We work in direct partnership with farmer clusters across Uttar Pradesh. By bypassing corporate industrial mills, we ensure that every grain is sun-dried naturally, cleaned manually, and processed locally to preserve authentic desi roots.
            </p>
            <div className="border-t border-stone-100 pt-4 flex justify-between items-center text-[10px] text-stone-400 font-semibold uppercase tracking-wider">
              <span>Origin: Bhitari, Ayodhya</span>
              <span className="font-bold text-brand-primary">100% Raw Ingredients</span>
            </div>
          </div>

        </div>
      </section>

      {/* ——— Section 2: Traditional Stone-Milling Showcase ——— */}
      <section id="processing" className="py-24 bg-white border-b border-stone-200/50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest block">Our Uncompromising Standards</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand-secondary">Why Cold-Pressed & Stone-Ground?</h2>
            <p className="text-stone-500 text-sm md:text-base max-w-xl mx-auto">
              Modern high-speed roller mills generate extreme temperatures that burn out critical fibers, healthy fats, and enzymes. Here is how we maintain purity.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="bg-brand-cream/35 border border-stone-200/40 p-8 rounded-3xl space-y-4 hover:border-brand-primary/20 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-lg font-serif">
                1
              </div>
              <h3 className="text-xl font-serif font-bold text-brand-secondary">Slow RPM Grinding</h3>
              <p className="text-stone-600 text-xs md:text-sm leading-relaxed">
                By rotating our heavy grinding stones slowly (less than 120 RPM), we prevent the flour from overheating. This safeguards natural dietary fibers and vitamins from scorching.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-brand-cream/35 border border-stone-200/40 p-8 rounded-3xl space-y-4 hover:border-brand-primary/20 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-brand-accent/20 flex items-center justify-center text-brand-primary font-bold text-lg font-serif">
                2
              </div>
              <h3 className="text-xl font-serif font-bold text-brand-secondary">Chokar (Bran) Retention</h3>
              <p className="text-stone-600 text-xs md:text-sm leading-relaxed">
                Refining strips away the nutritious wheat bran. Our flour is explicitly packed <strong>"Chokar Sahit"</strong>, retaining the fibrous outer shell that aids in digestion and blood sugar control.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-brand-cream/35 border border-stone-200/40 p-8 rounded-3xl space-y-4 hover:border-brand-primary/20 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-brand-secondary/10 flex items-center justify-center text-brand-secondary font-bold text-lg font-serif">
                3
              </div>
              <h3 className="text-xl font-serif font-bold text-brand-secondary">Zero Chemical Processing</h3>
              <p className="text-stone-600 text-xs md:text-sm leading-relaxed">
                Our grains are cleaned by hand, washed in clean water, and sun-dried. We use no synthetic bleaching agents, artificial vitamins, or chemical preservatives.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ——— Section 3: Interactive Grain Explorer ——— */}
      <section className="py-24 bg-brand-cream-dark/30 border-b border-stone-200/50 relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest block">The 11-Grain Blend</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand-secondary">Explore Our Ingredients</h2>
            <p className="text-stone-500 text-sm max-w-md mx-auto">
              Click on any grain below to learn about its health benefits and traditional village significance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 items-stretch">
            
            {/* Left: Grain Chips Grid */}
            <div className="md:col-span-2 flex flex-wrap gap-2.5 content-start">
              {Object.keys(grainDetails).map((key) => {
                const grain = grainDetails[key];
                const isActive = activeGrain === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveGrain(key)}
                    className={`px-5 py-3 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer border ${
                      isActive 
                        ? 'bg-brand-secondary border-brand-secondary text-white shadow-md scale-102' 
                        : 'bg-white border-stone-200 text-stone-600 hover:border-brand-primary/30 hover:bg-stone-50'
                    }`}
                  >
                    <span>{grain.symbol}</span>
                    <span>{key}</span>
                  </button>
                );
              })}
            </div>

            {/* Right: Dynamic Explorer Panel */}
            <div className="md:col-span-1 bg-white border border-stone-200/50 rounded-3xl p-8 flex flex-col justify-between shadow-sm relative overflow-hidden min-h-[300px]">
              <div className="absolute inset-0 bg-[radial-gradient(#dfa867_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.015] pointer-events-none" />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeGrain}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 relative z-10"
                >
                  <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                    <div>
                      <span className="text-[9px] font-bold text-brand-primary uppercase tracking-widest block mb-1">
                        Active Ingredient
                      </span>
                      <h4 className="text-xl font-serif font-bold text-brand-secondary leading-none">
                        {grainDetails[activeGrain].name}
                      </h4>
                    </div>
                    <span className="text-4xl">{grainDetails[activeGrain].symbol}</span>
                  </div>

                  <p className="text-stone-600 text-xs md:text-sm leading-relaxed">
                    {grainDetails[activeGrain].desc}
                  </p>

                  <div className="bg-brand-cream p-3 rounded-xl border border-stone-200/30">
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Key Nutritional Benefit</span>
                    <span className="text-xs font-bold text-brand-secondary leading-none">
                      {grainDetails[activeGrain].benefit}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 pt-4 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
                <span>Direct Sourcing verified</span>
                <span className="text-brand-primary font-bold uppercase tracking-wider">100% Authentic</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ——— Section 4: Products Showcase ——— */}
      <section id="products" className="py-24 bg-brand-cream/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#c26d47_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.02]" />
        <div className="container mx-auto px-4 relative z-10 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest block">Available Stock</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand-secondary">Pure Village Catalog</h2>
            <p className="text-stone-500 text-sm max-w-sm mx-auto">
              Select weights and add products directly to your cart. Dispatched fresh from source hubs.
            </p>
          </div>
          <div className="space-y-8">
            {!mounted ? (
              <div className="text-center text-stone-400 py-12 text-sm flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                Loading products...
              </div>
            ) : activeProducts.length === 0 ? (
              <div className="text-center text-stone-500 py-12 bg-white rounded-3xl border border-stone-200/50 p-8 shadow-sm">
                <p className="text-sm">Our catalog is currently being updated. Please check back soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {activeProducts.map(product => <ProductCard key={product.id} product={product} />)}
              </div>
            )}
          </div>
          <div className="text-center mt-14">
            <Link href="/shop" className="btn-primary inline-flex items-center gap-2 text-xs uppercase tracking-widest">
              View All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
