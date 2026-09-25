'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Settings 
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isInitialized, isAuthenticated, isAdmin } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated || !isAdmin) {
        router.push('/');
      }
    }
  }, [isInitialized, isAuthenticated, isAdmin, router, pathname]);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (!isInitialized || !isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="animate-pulse rounded-full h-12 w-12 border-4 border-brand-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row bg-stone-50 min-h-[calc(100vh-5rem)]">
      
      {/* Mobile Admin Navigation Header */}
      <div className="md:hidden bg-white border-b border-stone-200 px-6 py-4 flex flex-col z-30 sticky top-20">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-brand-secondary">Admin Console</h2>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-stone-600 hover:text-brand-primary transition-colors focus:outline-none"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Dropdown Menu */}
        {isMobileMenuOpen && (
          <nav className="mt-4 pt-4 border-t border-stone-100 flex flex-col gap-1.5 animate-fadeIn">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-green-50 text-green-700 font-bold border-l-4 border-green-700'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      <AdminSidebar />
      
      <main className="flex-1 p-6 lg:p-10 overflow-auto">
        {children}
      </main>
    </div>
  );
}
