'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { subscribeToProducts, Product } from '@/store/useCatalogStore';
import { useCartStore } from '@/store/useCartStore';
import { 
  ArrowLeft, 
  Leaf, 
  ShieldCheck, 
  ShoppingCart, 
  Check, 
  Plus, 
  Minus, 
  Truck, 
  ChevronRight,
  ChevronDown,
  Sparkles,
  Flame,
  Award
} from 'lucide-react';
import Link from 'next/link';

interface ProductDetailClientProps {
  id: string;
}

export default function ProductDetailClient({ id }: ProductDetailClientProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeight, setSelectedWeight] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  
  const addItem = useCartStore((state) => state.addItem);

  // Subscribe to all products to find this specific one
  useEffect(() => {
    const unsubscribe = subscribeToProducts((all) => {
      setProducts(all);
      const found = all.find(p => p.id === id);
      if (found) {
        setProduct(found);
        setSelectedWeight(found.prices[0]?.weight || '');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream/30 pt-32 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-[32px] border border-stone-200/50 shadow-sm">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-500 font-bold text-xs uppercase tracking-wider">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-brand-cream/30 pt-32 pb-24 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-4 bg-white p-8 rounded-[32px] border border-stone-200/50 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto border border-red-100">
            <Leaf className="w-6 h-6 text-red-500" />
          </div>
          <h1 className="text-xl font-serif font-bold text-stone-850">Product Not Found</h1>
          <p className="text-stone-600 text-xs leading-relaxed">The product you are looking for does not exist or has been removed from our catalog.</p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="px-5 py-2.5 bg-brand-secondary text-white rounded-full font-bold hover:bg-brand-secondary-dark transition-colors text-xs uppercase tracking-widest flex items-center gap-2 mx-auto w-fit"
            >
              <ArrowLeft className="w-4 h-4 text-brand-accent-light" /> Back to Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentPriceOption = product.prices.find(p => p.weight === selectedWeight) || product.prices[0];
  const originalPrice = currentPriceOption ? Math.round(currentPriceOption.price * 1.3) : 0;

  const handleAddToCart = () => {
    if (!currentPriceOption) return;
    
    // Add multiple quantities
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: currentPriceOption.price,
        image: product.imageUrl || '',
        weight: selectedWeight,
      });
    }

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // Sourcing and traditional details based on name
  const renderDetailsList = () => {
    const name = product.name.toLowerCase();
    if (name.includes('multigrain') || name.includes('flour')) {
      return (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-brand-primary uppercase tracking-wider flex items-center gap-1.5">
            <Leaf className="w-4 h-4" /> 11 Balanced Grains Included:
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {['Jowar', 'Bajra', 'Chana', 'Makka', 'Ragi', 'Moong', 'Soybeen', 'Jau', 'Sawa', 'Kodo', 'Kutki'].map(grain => (
              <span key={grain} className="text-xs font-semibold bg-stone-50 text-stone-700 border border-stone-200/50 px-3 py-1 rounded-lg">
                {grain}
              </span>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-brand-cream/40 pt-28 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Breadcrumb navigation */}
        <div className="flex items-center gap-2 text-xs text-stone-550 mb-8 mt-2 uppercase tracking-wider font-semibold">
          <Link href="/">Home</Link>
          <ChevronRight className="w-3 h-3 text-stone-300" />
          <Link href="/shop">Store</Link>
          <ChevronRight className="w-3 h-3 text-stone-300" />
          <span className="text-brand-primary font-bold">{product.name}</span>
        </div>

        {/* Dynamic Detail Card */}
        <div className="bg-white rounded-[32px] border border-stone-200/50 shadow-sm p-6 md:p-10 flex flex-col md:flex-row gap-8 md:gap-12 paper-texture relative overflow-hidden mb-8">
          
          {/* Left Column: Product Image Wrapper */}
          <div className="w-full md:w-1/2 aspect-square bg-stone-50 rounded-2xl border border-stone-200/30 p-8 flex items-center justify-center relative">
            {/* Green Discount Tag */}
            <div className="absolute top-4 left-4 bg-[#447A14] text-white text-[10px] font-bold px-3 py-1 rounded shadow-sm z-10 uppercase tracking-wider">
              24% OFF
            </div>
            
            <div className="w-full h-full flex items-center justify-center">
              {product.imageUrl && (product.imageUrl.startsWith('http') || product.imageUrl.startsWith('/')) ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="max-h-full max-w-full object-contain rounded-xl"
                />
              ) : (
                <span className="text-9xl select-none">{product.imageUrl || '🌾'}</span>
              )}
            </div>
          </div>

          {/* Right Column: Info & Actions */}
          <div className="w-full md:w-1/2 flex flex-col justify-center space-y-6">
            
            {/* Badges */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-primary uppercase tracking-widest bg-brand-primary/10 px-3 py-1 rounded-full">
                <Leaf className="w-3.5 h-3.5" /> Village Produced
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-secondary uppercase tracking-widest bg-stone-100 px-3 py-1 rounded-full border border-stone-200/50">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-accent animate-pulse" /> FSSAI Certified
              </span>
              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider border-l border-stone-200 pl-2">
                {product.category}
              </span>
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-secondary leading-tight">
                {product.name}
              </h1>
              <p className="text-stone-400 text-[10px] uppercase font-bold tracking-widest mt-1">gaonpure products</p>
            </div>

            <p className="text-stone-600 text-sm md:text-base leading-relaxed">
              {product.description}
            </p>

            {/* Dynamic elements details */}
            {renderDetailsList()}

            {/* Selector Option Dropdown */}
            <div className="space-y-2 border-t border-stone-100 pt-4">
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest">Select Weight Options</label>
              <div className="relative max-w-xs">
                <select 
                  value={selectedWeight} 
                  onChange={(e) => setSelectedWeight(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 pr-10 text-xs font-bold text-stone-700 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary/25 cursor-pointer shadow-sm"
                >
                  {product.prices.map((p) => (
                    <option key={p.weight} value={p.weight}>
                      {p.weight} pack - ₹{p.price} ({p.stock > 0 ? `${p.stock} left` : 'Out of stock'})
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Pricing Section & Quantity Adjusters */}
            <div className="flex flex-wrap items-center justify-between gap-6 border-t border-stone-100 pt-5">
              
              {/* Prices display */}
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl font-extrabold text-brand-secondary">₹{currentPriceOption.price * quantity}</span>
                {originalPrice > 0 && (
                  <span className="text-stone-400 line-through text-sm font-semibold">₹{originalPrice * quantity}</span>
                )}
              </div>

              {/* Counter quantity */}
              <div className="flex items-center gap-4 bg-stone-50 px-3.5 py-1.5 rounded-full border border-stone-200/50">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="p-1 hover:bg-white rounded-full transition-all cursor-pointer shadow-sm"
                >
                  <Minus className="w-3 h-3 text-stone-500" />
                </button>
                <span className="text-sm font-bold w-4 text-center text-stone-700">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="p-1 hover:bg-white rounded-full transition-all cursor-pointer text-brand-primary shadow-sm"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

            </div>

            {/* Buy / Add Button */}
            <div className="pt-2">
              <button
                onClick={handleAddToCart}
                disabled={currentPriceOption.stock === 0}
                className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-300 shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  added 
                    ? 'bg-brand-secondary text-white shadow-inner' 
                    : 'bg-brand-primary hover:bg-brand-primary-dark text-white hover:shadow-md'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4 text-brand-accent-light" />
                    Added to Shopping Bag
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 text-white" />
                    Add to Cart · ₹{currentPriceOption.price * quantity}
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Village Sourcing Sincerity Section */}
        <div className="bg-brand-secondary text-white rounded-[32px] border border-brand-secondary-dark p-8 md:p-12 relative overflow-hidden shadow-md">
          {/* Decorative overlay pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#dfa867_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-brand-accent text-[10px] font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" /> Authenticity & Farm Integrity
            </div>
            
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white leading-tight">
              Direct Sourcing from Ayodhya Villages
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 pt-4">
              <div className="space-y-2">
                <div className="font-serif font-bold text-brand-accent text-lg flex items-center gap-2">
                  <Flame className="w-4 h-4" /> Traditional Wooden Presses
                </div>
                <p className="text-stone-300 text-xs md:text-sm leading-relaxed">
                  We use ancestral wooden churners (Bilona) and cold stone grinding stones. By processing materials under low RPMs, we avoid high heat that burns off precious antioxidants, fatty acids, and taste.
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-serif font-bold text-brand-accent text-lg flex items-center gap-2">
                  <Award className="w-4 h-4" /> Pure Farm to Kitchen
                </div>
                <p className="text-stone-300 text-xs md:text-sm leading-relaxed">
                  Every product is cleaned manually, washed in village springs, and sun-dried in community courtyards. We completely avoid chemical bleaching, synthetic vitamin fortification, or industrial preservatives.
                </p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6 mt-6 flex justify-between items-center text-[10px] text-white/50 font-bold uppercase tracking-widest">
              <span>Sourced: Bhitari, Uttar Pradesh</span>
              <span>FSSAI License Verified</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
