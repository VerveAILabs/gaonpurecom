import AdminConfigPanel from '@/components/AdminConfigPanel';

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold text-brand-secondary">Store Settings</h1>
      </div>
      <AdminConfigPanel />
    </div>
  );
}
