'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, SlidersHorizontal, ShieldCheck } from 'lucide-react';
import { subscribeToProducts, Product } from '@/store/useCatalogStore';
import { ProductCard } from '@/components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    setMounted(true);
    const unsubscribe = subscribeToProducts((all) => {
      setProducts(all.filter(p => p.isActive));
    });
    return () => unsubscribe();
  }, []);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
    return ['All', ...cats];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, search]);

  return (
    <div className="min-h-screen bg-brand-cream/50 pb-20">

      {/* ——— Elegant Header ——— */}
      <section className="bg-brand-secondary pt-28 pb-8 relative overflow-hidden paper-texture">
        {/* Subtle decorative wheat pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#dfa867_1.5px,transparent_1.5px)] [background-size:40px_40px] opacity-[0.02] pointer-events-none" />
        
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <nav className="breadcrumb-light">
            <Link href="/">Home</Link>
            <ChevronRight className="w-3 h-3 text-white/40" />
            <span>Shop Catalog</span>
          </nav>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mt-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
                Our Village Store
              </h1>
              <p className="text-stone-300 text-xs mt-1 max-w-md leading-relaxed">
                Raw grains, cold-pressed oils, and traditional sweeteners, packed fresh and certified for pure health.
              </p>
            </div>
            
            <div className="relative w-full md:w-[280px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search store..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white text-stone-850 placeholder-stone-400 border-none outline-none focus:ring-2 focus:ring-brand-accent/50 shadow-md text-xs font-semibold"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ——— FSSAI strip ——— */}
      <div className="fssai-strip">
        <ShieldCheck className="w-3.5 h-3.5 text-brand-accent shrink-0" />
        <span>FSSAI Certified Hubs · No. <strong>22726257000084</strong></span>
      </div>

      {/* ——— Category Filter Chips (Sticky) ——— */}
      {categories.length > 1 && (
        <div className="bg-white border-b border-stone-200/50 sticky top-16 z-30 shadow-sm">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-none">
              <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400 flex-shrink-0 mr-1.5" />
              {categories.map(cat => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'text-white shadow-sm'
                        : 'bg-stone-50 border border-stone-200/40 text-stone-500 hover:bg-stone-100 hover:border-stone-300'
                    }`}
                    style={isActive ? { background: 'var(--color-brand-primary)' } : {}}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ——— Products Showcase ——— */}
      <section className="py-14">
        <div className="container mx-auto px-4 max-w-5xl">
          {!mounted ? (
            <div className="flex flex-col items-center justify-center py-28 gap-3">
              <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-stone-400 font-semibold tracking-wider uppercase">Loading inventory...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-[32px] border border-stone-200/50 text-center py-20 px-8 shadow-sm paper-texture">
              <div className="text-5xl mb-4 select-none">🌾</div>
              <h3 className="text-lg font-bold text-stone-750 mb-2">
                {search || activeCategory !== 'All' ? 'No matching products' : 'Coming soon!'}
              </h3>
              <p className="text-stone-400 text-xs leading-relaxed max-w-xs mx-auto">
                {search || activeCategory !== 'All'
                  ? 'We could not find products matching your filters. Try clearing search keywords.'
                  : 'Our traditional mills are processing fresh crops. Check back soon for stock availability!'}
              </p>
              {(search || activeCategory !== 'All') && (
                <button 
                  onClick={() => { setSearch(''); setActiveCategory('All'); }} 
                  className="btn-primary mt-6 text-xs uppercase tracking-widest px-6 py-3 cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-[10px] text-stone-450 uppercase tracking-widest font-bold border-b border-stone-200/40 pb-2">
                Showing {filtered.length} product{filtered.length !== 1 ? 's' : ''} from source
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
                {filtered.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
