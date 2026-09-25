import { SalesDashboard } from '@/components/admin/SalesDashboard';

export default function AdminOverview() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold text-brand-secondary">Dashboard Overview</h1>
        <p className="text-stone-500 text-sm">Welcome to the Gaon Pure admin console</p>
      </div>
      
      <SalesDashboard />
    </div>
  );
}
