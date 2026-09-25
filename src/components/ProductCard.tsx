'use client';

import { useState } from 'react';
import { ChevronDown, Plus, Check } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import type { Product } from '@/store/useCatalogStore';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function ProductCard({ product }: { product: Product }) {
  const [selectedWeight, setSelectedWeight] = useState(product.prices[0]?.weight);
  const cartItems = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const addItem = useCartStore((state) => state.addItem);

  const currentPriceOption = product.prices.find(p => p.weight === selectedWeight) || product.prices[0];

  // Check if this variant is already in the cart
  const cartItem = cartItems.find((i) => i.id === product.id && i.weight === selectedWeight);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevents navigation when clicking ADD on the card
    if (!currentPriceOption) return;
    
    addItem({
      id: product.id,
      name: product.name,
      price: currentPriceOption.price,
      image: product.imageUrl || '',
      weight: selectedWeight,
    });
  };

  if (!currentPriceOption) return null;

  const originalPrice = Math.round(currentPriceOption.price * 1.3);

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group">
      
      {/* Product Image Section */}
      <Link href={`/shop/${product.id}`} className="block relative aspect-square w-full bg-stone-50 overflow-hidden">
        {/* Discount Tag */}
        <div className="absolute top-2 left-2 bg-[#447A14] text-white text-[9px] font-bold px-2 py-0.5 rounded z-10 uppercase">
          24% OFF
        </div>
 
        {/* Product Image */}
        <div className="w-full h-full p-4 flex items-center justify-center bg-stone-50/50">
          {product.imageUrl && (product.imageUrl.startsWith('http') || product.imageUrl.startsWith('/')) ? (
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-full object-contain rounded-xl group-hover:scale-102 transition-transform duration-500"
            />
          ) : (
            <span className="text-6xl select-none">{product.imageUrl || '🌾'}</span>
          )}
        </div>
      </Link>
 
      {/* Product Details Section */}
      <div className="p-4 flex flex-col flex-1">
        {/* Brand name */}
        <span className="text-[10px] text-stone-400 font-semibold tracking-wide lowercase">
          gaonpure
        </span>
 
        {/* Title */}
        <Link href={`/shop/${product.id}`} className="block mt-1 group-hover:text-brand-primary transition-colors">
          <h3 className="font-sans text-xs md:text-sm font-bold text-stone-800 line-clamp-2 min-h-[32px] leading-tight">
            {product.name}
          </h3>
        </Link>
 
        {/* Dropdown Selector */}
        <div className="relative mt-3">
          <select 
            value={selectedWeight} 
            onChange={(e) => setSelectedWeight(e.target.value)}
            className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 pr-8 text-[11px] font-bold text-stone-600 appearance-none focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary cursor-pointer shadow-sm"
          >
            {product.prices.map((priceOption) => (
              <option key={priceOption.weight} value={priceOption.weight}>
                {priceOption.weight}
              </option>
            ))}
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
            <ChevronDown className="w-3 h-3" />
          </div>
        </div>
 
        {/* Price & Buy Action */}
        <div className="flex items-center justify-between mt-5 pt-3 border-t border-stone-100">
          <div className="flex flex-col">
            <span className="text-xs md:text-sm font-extrabold text-stone-900 leading-none">
              ₹{currentPriceOption.price}
            </span>
            <span className="text-[9px] text-stone-400 line-through font-semibold mt-1 leading-none">
              ₹{originalPrice}
            </span>
          </div>
 
          {quantity > 0 ? (
            <div className="flex items-center bg-brand-primary text-white rounded-lg font-bold text-[10px] transition-all duration-300 shadow-sm border border-brand-primary">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  updateQuantity(product.id, selectedWeight, quantity - 1);
                }}
                className="px-3 py-1.5 hover:bg-brand-primary-dark transition-colors rounded-l-lg cursor-pointer text-xs font-extrabold"
              >
                -
              </button>
              <span className="px-2 text-xs font-extrabold select-none min-w-[16px] text-center">{quantity}</span>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  updateQuantity(product.id, selectedWeight, quantity + 1);
                }}
                className="px-3 py-1.5 hover:bg-brand-primary-dark transition-colors rounded-r-lg cursor-pointer text-xs font-extrabold"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={currentPriceOption.stock === 0}
              className="border border-brand-primary text-brand-primary bg-white hover:bg-brand-primary hover:text-white px-4 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-sm hover:shadow active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[54px]"
            >
              ADD
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
