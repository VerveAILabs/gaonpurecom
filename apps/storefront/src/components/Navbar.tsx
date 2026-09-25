'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, User, LogOut, LayoutDashboard, X } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthModal } from '@/components/AuthModal';
import { siteConfig } from '@/config/site';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const { items, setIsOpen } = useCartStore();
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <header className="fixed top-4 left-0 right-0 z-40 px-4 w-full">
        <div className="container mx-auto max-w-6xl bg-white/75 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/50 rounded-full h-16 px-6 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-stone-700 hover:text-brand-secondary transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative overflow-hidden rounded-full w-9 h-9 border border-stone-200/50 shadow-inner flex-shrink-0">
                <img 
                  src={siteConfig.logo} 
                  alt={siteConfig.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-serif text-base font-bold text-brand-secondary block leading-none tracking-tight">
                  {siteConfig.name}
                </span>
                <span className="text-[8px] text-brand-primary font-bold tracking-widest uppercase block mt-1 leading-none">
                  {siteConfig.tagline}
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 font-semibold text-stone-600 text-xs uppercase tracking-wider">
            {siteConfig.navItems.map((item) => (
              <Link 
                key={item.label} 
                href={item.href} 
                className="relative hover:text-brand-secondary transition-colors py-2 group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Cart & Account */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <a 
                    href={process.env.NEXT_PUBLIC_ADMIN_PORTAL_URL || 'http://localhost:3001'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden lg:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 hover:text-emerald-800 transition-colors px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 shadow-xs"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" /> Admin Console
                  </a>
                )}
                
                <div className="hidden md:flex items-center">
                  <Link 
                    href="/profile" 
                    className="flex items-center gap-2 text-xs font-bold text-stone-600 bg-stone-50/60 border border-stone-200/50 hover:bg-stone-100 transition-colors px-4 py-1.5 rounded-full shadow-sm"
                  >
                    {user?.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.name || 'User'} 
                        className="w-4 h-4 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-brand-primary text-white flex items-center justify-center text-[9px] font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {user?.name?.split(' ')[0]}
                  </Link>
                </div>
                
                <button 
                  onClick={logout} 
                  className="p-2 text-stone-400 hover:text-red-500 transition-colors cursor-pointer" 
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-4.5 py-2.5 rounded-full border border-stone-200 hover:border-brand-primary/30 text-stone-700 font-bold hover:bg-brand-cream-dark transition-all text-[11px] uppercase tracking-wider cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-brand-primary" /> Sign In
              </button>
            )}

            <div className="w-px h-5 bg-stone-250 hidden md:block" />

            <button 
              className="w-9 h-9 text-stone-700 hover:text-brand-primary transition-colors relative bg-stone-100 hover:bg-brand-cream-dark rounded-full shadow-inner flex items-center justify-center cursor-pointer"
              onClick={() => setIsOpen(true)}
            >
              <ShoppingCart className="w-4 h-4" />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-brand-primary text-white text-[8px] font-bold rounded-full flex items-center justify-center shadow-sm border border-white"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Slide Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-stone-955/35 backdrop-blur-sm z-30"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Panel */}
            <motion.div 
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="md:hidden fixed inset-x-4 top-22 bg-white border border-stone-200/50 rounded-3xl shadow-xl z-40 overflow-hidden"
            >
              <div className="px-6 py-6 space-y-4 flex flex-col font-bold text-stone-600">
                {siteConfig.navItems.map((item) => (
                  <Link 
                    key={item.label} 
                    href={item.href} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="hover:text-brand-primary transition-colors py-2 border-b border-stone-100 last:border-b-0 text-sm"
                  >
                    {item.label}
                  </Link>
                ))}
                
                {isAuthenticated ? (
                  <div className="space-y-4 pt-2">
                    {isAdmin && (
                      <a 
                        href={process.env.NEXT_PUBLIC_ADMIN_PORTAL_URL || 'http://localhost:3001'}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 text-xs uppercase tracking-wider text-brand-primary font-bold transition-colors py-2 border-b border-stone-100"
                      >
                        <LayoutDashboard className="w-4 h-4" /> Admin Console
                      </a>
                    )}
                    <Link 
                      href="/profile" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 text-sm font-semibold text-stone-700 py-2 border-b border-stone-100"
                    >
                      {user?.photoURL && (
                        <img 
                          src={user.photoURL} 
                          alt={user.name || 'User'} 
                          className="w-5 h-5 rounded-full object-cover border border-stone-200"
                        />
                      )}
                      My Profile ({user?.name})
                    </Link>
                    <button 
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        logout();
                      }} 
                      className="flex items-center gap-2 text-red-500 font-semibold py-2 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" /> Log Out
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsAuthOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-brand-primary text-white font-bold hover:bg-brand-primary-dark transition-all text-xs w-full shadow shadow-brand-primary/10"
                  >
                    <User className="w-3.5 h-3.5" /> Sign In
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
