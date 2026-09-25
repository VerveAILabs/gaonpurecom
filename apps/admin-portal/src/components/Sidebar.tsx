'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Boxes, 
  Users, 
  Tag, 
  Settings, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Orders & Dispatch', href: '/orders', icon: ShoppingBag },
  { name: 'Product Catalog', href: '/products', icon: Package },
  { name: 'Inventory & Stock', href: '/inventory', icon: Boxes },
  { name: 'Customer CRM', href: '/users', icon: Users },
  { name: 'Coupons & Offers', href: '/coupons', icon: Tag },
  { name: 'Store Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-stone-900 text-stone-300 flex flex-col flex-shrink-0 min-h-screen border-r border-stone-800">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-stone-800 bg-stone-950">
        <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-900/50 text-base">
          GP
        </div>
        <div>
          <h1 className="font-bold text-white text-sm tracking-wide">Gaon Pure</h1>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3 h-3" /> Admin Console
          </p>
        </div>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
          Operations
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                  : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Live Storefront Link */}
      <div className="p-4 border-t border-stone-800 bg-stone-950/60">
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-stone-800/80 hover:bg-stone-800 text-xs font-medium text-stone-300 transition-colors"
        >
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Storefront Live
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
        </a>
      </div>
    </aside>
  );
}
