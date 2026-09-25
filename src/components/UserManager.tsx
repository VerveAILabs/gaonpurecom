'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy, setDoc, deleteDoc } from 'firebase/firestore';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Customer';
  createdAt: string;
  photoURL?: string;
}

export default function UserManager() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const fetchedUsers: UserData[] = [];
      snapshot.forEach(docSnap => {
        fetchedUsers.push({ id: docSnap.id, ...docSnap.data() } as UserData);
      });
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (userId: string, currentRole: string) => {
    setUpdating(userId);
    try {
      const newRole = currentRole === 'Admin' ? 'Customer' : 'Admin';
      const userDocRef = doc(db, 'users', userId);
      const adminDocRef = doc(db, 'admin_users', userId);

      await updateDoc(userDocRef, { role: newRole });
      if (newRole === 'Admin') {
        await setDoc(adminDocRef, { isAdmin: true });
      } else {
        await deleteDoc(adminDocRef);
      }

      await fetchUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Failed to update user role.");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading users...</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      <table className="w-full text-left text-sm text-stone-600">
        <thead className="bg-stone-50 border-b border-stone-200 text-stone-700">
          <tr>
            <th className="px-6 py-4 font-semibold w-16">Profile</th>
            <th className="px-6 py-4 font-semibold">Name</th>
            <th className="px-6 py-4 font-semibold">Email</th>
            <th className="px-6 py-4 font-semibold">Joined</th>
            <th className="px-6 py-4 font-semibold">Role</th>
            <th className="px-6 py-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-stone-50">
              <td className="px-6 py-4">
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center overflow-hidden border border-stone-200">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-stone-400 text-xs">{(user.name || '?').charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 font-medium text-stone-900">{user.name}</td>
              <td className="px-6 py-4">{user.email}</td>
              <td className="px-6 py-4">{new Date(user.createdAt).toLocaleDateString()}</td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  user.role === 'Admin' ? 'bg-brand-primary text-white' : 'bg-stone-100 text-stone-800'
                }`}>
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  disabled={updating === user.id}
                  onClick={() => toggleRole(user.id, user.role)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium ${
                    user.role === 'Admin' 
                      ? 'border-red-200 text-red-600 hover:bg-red-50'
                      : 'border-green-200 text-green-700 hover:bg-green-50'
                  }`}
                >
                  {updating === user.id ? 'Updating...' : user.role === 'Admin' ? 'Revoke Admin' : 'Make Admin'}
                </button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-stone-500">
                No users found. Users will appear here after they log in.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
