'use client';

import { X, Minus, Plus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export function CartDrawer() {
  const { isOpen, setIsOpen, items, updateQuantity, removeItem, getTotal } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const subtotal = getTotal();
  const freeShippingThreshold = 1000;
  const progressPercent = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const neededForFreeShipping = freeShippingThreshold - subtotal;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with fade-in */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-950/40 backdrop-blur-sm z-50 transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer with slide-in */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-brand-cream shadow-2xl z-[60] flex flex-col border-l border-stone-200/50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-stone-200/50 bg-white">
              <h2 className="font-serif text-xl font-bold text-brand-secondary flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-brand-primary" />
                Shopping Bag
              </h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-700 transition-colors bg-stone-50 hover:bg-stone-100 rounded-full border border-stone-200/40 shadow-sm cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            {items.length > 0 && (
              <div className="bg-white border-b border-stone-200/40 p-5 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-stone-500">
                    {subtotal >= freeShippingThreshold 
                      ? '🎉 Free shipping unlocked!' 
                      : `Add ₹${neededForFreeShipping} more for FREE shipping`}
                  </span>
                  <span className="font-bold text-brand-primary">₹{subtotal} / ₹{freeShippingThreshold}</span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    className="h-full bg-brand-primary rounded-full" 
                  />
                </div>
                {subtotal < freeShippingThreshold && (
                  <p className="text-[10px] text-stone-400 font-medium">Standard shipping charges (₹50) apply from village hubs.</p>
                )}
              </div>
            )}

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              <AnimatePresence initial={false}>
                {items.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center h-full text-stone-500 gap-4"
                  >
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-inner border border-stone-200/40">
                      <ShoppingBag className="w-8 h-8 text-stone-300" />
                    </div>
                    <p className="font-medium text-sm text-stone-600">Your shopping bag is empty</p>
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="text-brand-primary font-bold hover:text-brand-primary-dark hover:underline text-xs uppercase tracking-widest cursor-pointer mt-2"
                    >
                      Continue Browsing
                    </button>
                  </motion.div>
                ) : (
                  items.map((item) => (
                    <motion.div 
                      key={`${item.id}-${item.weight}`}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      className="flex gap-4 bg-white p-4 rounded-2xl shadow-sm border border-stone-200/40 hover:border-brand-primary/10 transition-all relative overflow-hidden min-h-[110px]"
                    >
                      {/* Product Image on the left */}
                      <div className="w-20 h-20 bg-stone-50 rounded-xl border border-stone-200/30 p-2 flex items-center justify-center flex-shrink-0">
                        {item.image && (item.image.startsWith('http') || item.image.startsWith('/')) ? (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="max-h-full max-w-full object-contain rounded-lg" 
                          />
                        ) : (
                          <span className="text-3xl select-none">{item.image || '🌾'}</span>
                        )}
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-sans text-xs md:text-sm font-bold text-stone-850 line-clamp-2 leading-tight pr-4">{item.name}</h3>
                            <button 
                              onClick={() => removeItem(item.id, item.weight)}
                              className="text-stone-300 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0"
                              title="Remove item"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="text-[9px] bg-brand-primary/5 border border-brand-primary/15 text-brand-primary px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                              {item.weight}
                            </span>
                            <span className="text-[10px] text-stone-450 font-bold">
                              ₹{item.price} each
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100/50">
                          <p className="font-extrabold text-sm text-brand-secondary">₹{item.price * item.quantity}</p>
                          
                          {/* Amazon-style count adjusters */}
                          <div className="flex items-center bg-stone-50 rounded-lg border border-stone-200/50 shadow-sm overflow-hidden">
                            <button 
                              onClick={() => updateQuantity(item.id, item.weight, item.quantity - 1)}
                              className="px-2.5 py-1 hover:bg-stone-100 transition-colors text-stone-650 font-extrabold text-xs cursor-pointer"
                            >
                              -
                            </button>
                            <span className="px-2.5 text-xs font-bold text-stone-700 min-w-[12px] text-center select-none">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.weight, item.quantity + 1)}
                              className="px-2.5 py-1 hover:bg-stone-100 transition-colors text-stone-650 font-extrabold text-xs cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Bottom summary and action */}
            {items.length > 0 && (
              <div className="p-6 border-t border-stone-200/50 bg-white shadow-[0_-8px_30px_rgb(0,0,0,0.02)] space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-stone-500">Cart Subtotal</span>
                  <span className="font-bold text-lg text-brand-secondary">₹{subtotal}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Secure processing. Fresh stock dispatched from local village mills.</span>
                </div>
                
                <Link 
                  href="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold py-3.5 rounded-full shadow hover:shadow-md transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 text-xs uppercase tracking-widest cursor-pointer"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
