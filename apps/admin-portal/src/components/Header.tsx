'use client';

import { Database, LogOut, Shield } from 'lucide-react';
import { useAdminAuth } from '@/context/AuthContext';

export default function Header() {
  const { user, logout } = useAdminAuth();

  const initial = user?.name ? user.name[0].toUpperCase() : user?.email ? user.email[0].toUpperCase() : 'A';

  return (
    <header className="h-16 bg-white border-b border-stone-200 px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          Neon PostgreSQL Connected
        </span>
        <span className="text-xs text-stone-400 font-mono hidden sm:inline">
          branch: production
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 pl-4 border-l border-stone-200">
          <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {initial}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-stone-800 flex items-center gap-1">
              {user?.name || 'Administrator'}
              <Shield className="w-3 h-3 text-emerald-600 fill-emerald-600" />
            </div>
            <div className="text-[10px] text-stone-500 font-mono">
              {user?.email || 'admin@gaonpure.com'}
            </div>
          </div>

          <button
            onClick={logout}
            title="Sign out of Admin Console"
            className="ml-2 p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all flex items-center gap-1.5 text-xs font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
