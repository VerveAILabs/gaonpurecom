'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  ShoppingBag, 
  CreditCard, 
  Loader2, 
  MapPin, 
  Shield,
  Filter
} from 'lucide-react';

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

interface UserCRM {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
  totalOrders: number;
  totalSpend: number;
  addresses: Address[];
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserCRM[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchUsers = async (targetPage = page) => {
    setLoading(true);
    try {
      let url = `/api/users?page=${targetPage}&limit=15&role=${roleFilter}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setUsers(json.users);
        if (json.pagination) {
          setTotalPages(json.pagination.totalPages);
          setTotalUsers(json.pagination.total);
        }
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchUsers(1);
  }, [roleFilter]);

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers(1);
  };

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const json = await res.json();
      if (json.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      console.error('Error toggling role:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Customer CRM</h1>
          <p className="text-xs text-stone-500 mt-1">Directory of customers, order histories, and lifetime values</p>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          >
            <option value="ALL">All Roles</option>
            <option value="customer">Customers Only</option>
            <option value="admin">Administrators Only</option>
          </select>

          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          </form>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-xs text-stone-500">Retrieving customer CRM records...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500 text-xs">
          No customer records matching this search or filter.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Contact</th>
                <th className="p-4 font-semibold">Saved Addresses</th>
                <th className="p-4 font-semibold">Orders</th>
                <th className="p-4 font-semibold">Total Spend</th>
                <th className="p-4 font-semibold">Access Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-stone-900">{u.name}</div>
                    <div className="text-[10px] text-stone-400 font-mono">
                      Joined {new Date(u.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-stone-800">{u.email}</div>
                    <div className="text-stone-400 text-[11px]">{u.phone}</div>
                  </td>
                  <td className="p-4">
                    {u.addresses.length > 0 ? (
                      <div className="text-[11px] text-stone-600 space-y-0.5">
                        <div className="font-medium text-stone-800 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-stone-400" />
                          {u.addresses[0].city}, {u.addresses[0].state}
                        </div>
                        <div className="text-[10px] text-stone-400">PIN: {u.addresses[0].pincode}</div>
                      </div>
                    ) : (
                      <span className="text-stone-400 italic text-[11px]">No address</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">
                      <ShoppingBag className="w-3 h-3" />
                      {u.totalOrders}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-black text-stone-900 text-sm">
                      ₹{u.totalSpend.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleRole(u.id, u.role)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                      title="Click to toggle Admin / Customer"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      {u.role === 'admin' ? 'Admin' : 'Customer'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-stone-100 bg-stone-50/50">
              <div className="text-xs text-stone-500 font-medium">
                Page <span className="font-bold text-stone-900">{page}</span> of{' '}
                <span className="font-bold text-stone-900">{totalPages}</span> ({totalUsers} customers)
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>
                <span className="text-xs font-bold text-stone-700 px-2">{page}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
