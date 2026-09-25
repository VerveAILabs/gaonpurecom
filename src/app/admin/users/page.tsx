import UserManager from '@/components/UserManager';

export default function AdminUsers() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold text-brand-secondary">Users Management</h1>
      </div>
      <UserManager />
    </div>
  );
}
