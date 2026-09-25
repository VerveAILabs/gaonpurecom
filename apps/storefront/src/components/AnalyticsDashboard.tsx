'use client';

export default function AnalyticsDashboard() {
  return (
    <div className="min-h-[40vh] rounded-3xl bg-white border border-stone-200 shadow-sm p-10 text-center">
      <h2 className="text-2xl font-serif font-bold text-brand-secondary mb-4">Analytics Overview</h2>
      <p className="text-stone-500">Analytics features are disabled for static deployment. You can display precomputed metrics manually if needed.</p>
    </div>
  );
}
