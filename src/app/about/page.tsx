'use client';

import Link from 'next/link';
import { ChevronRight, Leaf, Target, Eye, ShieldCheck, Users, Award, Heart } from 'lucide-react';

const milestones = [
  { year: '2020', title: 'Gaon Pure Founded', desc: "Started with a dream to bring pure, unadulterated foods from India's villages to every home." },
  { year: '2021', title: 'First 100 Customers', desc: 'Word spread quickly. Farmers loved us, families trusted us.' },
  { year: '2022', title: 'FSSAI Licensed', desc: 'Officially licensed under FSSAI No. 22726257000084 — guaranteeing the highest food safety standards.' },
  { year: '2024', title: 'Going Online', desc: 'Launched our e-commerce platform so pure, village-sourced food can reach every corner of India.' },
];

const values = [
  { icon: Leaf,       title: 'Purity First',    desc: 'No adulteration, no shortcuts — ever. Every product is as nature intended.' },
  { icon: ShieldCheck,title: 'FSSAI Certified', desc: 'Licensed under FSSAI No. 22726257000084, meeting the highest food safety standards.' },
  { icon: Users,      title: 'Farmer Focused',  desc: 'We work directly with farmers, ensuring fair prices and sustainable practices.' },
  { icon: Heart,      title: 'Family Trusted',  desc: 'Made for families who care about what goes on their plate — just like ours.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ——— Hero ——— */}
      <section className="page-hero pb-16">
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <nav className="breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight className="w-3 h-3 text-stone-400" />
            <span>About Us</span>
          </nav>
          <div className="max-w-3xl pt-4">
            <div className="inline-flex items-center gap-2 bg-brand-primary/5 border border-brand-primary/15 rounded-full px-4 py-2 text-brand-primary text-xs font-bold uppercase tracking-wider mb-6">
              <Leaf className="w-4 h-4 text-brand-primary" /> Pure. Natural. Trusted.
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-brand-secondary leading-tight mb-5">
              From India's Villages,<br />
              <span className="text-brand-primary italic font-normal">To Your Table.</span>
            </h1>
            <p className="text-xl text-stone-600 leading-relaxed max-w-2xl font-medium">
              Gaon Pure was born from a simple belief — the best food grows where roots run deep.
              We source directly from traditional Indian farmers to bring you food that is pure, unprocessed, and full of life.
            </p>
          </div>
        </div>
      </section>

      {/* ——— Mission & Vision ——— */}
      <section className="py-20 bg-stone-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card p-8">
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-brand-secondary)]/10 flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-[var(--color-brand-secondary)]" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-stone-800 mb-4">Our Mission</h2>
              <p className="text-stone-600 leading-relaxed text-lg">
                To provide unadulterated, high-quality organic products directly from the village to your home — preserving traditions and nourishing lives.
              </p>
            </div>
            <div className="card p-8">
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-brand-primary)]/10 flex items-center justify-center mb-6">
                <Eye className="w-6 h-6 text-[var(--color-brand-primary)]" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-stone-800 mb-4">Our Vision</h2>
              <p className="text-stone-600 leading-relaxed text-lg">
                To become the most trusted global brand for authentic, traditional, and pure products — a name every family associates with health and honesty.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ——— Values ——— */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-serif font-bold text-stone-800 mb-4">What We Stand For</h2>
            <p className="text-stone-500 text-lg max-w-xl mx-auto">Every product we sell is a promise — made with care, backed by values.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center p-6 rounded-3xl bg-stone-50 border border-stone-100 hover:border-[var(--color-brand-secondary)]/30 hover:bg-[var(--color-brand-secondary)]/5 transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-[var(--color-brand-secondary)]/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-[var(--color-brand-secondary)]/20 transition-colors">
                  <Icon className="w-7 h-7 text-[var(--color-brand-secondary)]" />
                </div>
                <h3 className="font-bold text-stone-800 mb-2 text-lg">{title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Timeline ——— */}
      <section className="py-20 bg-gradient-to-b from-stone-50 to-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-serif font-bold text-stone-800 mb-4">Our Journey</h2>
            <p className="text-stone-500 text-lg">Every great brand starts with a story worth telling.</p>
          </div>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[var(--color-brand-secondary)]/20" />
            <div className="space-y-10">
              {milestones.map((m, i) => (
                <div key={i} className="relative pl-20">
                  <div className="absolute left-4 top-1 w-8 h-8 rounded-full bg-[var(--color-brand-secondary)] flex items-center justify-center shadow-md">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-bold text-[var(--color-brand-secondary)] bg-[var(--color-brand-secondary)]/10 border border-[var(--color-brand-secondary)]/20 px-3 py-1 rounded-full">{m.year}</span>
                  <h3 className="text-lg font-bold text-stone-800 mt-2 mb-1">{m.title}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ——— FSSAI & CTA ——— */}
      <section className="py-16" style={{ background: 'var(--hero-gradient)' }}>
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-white/60 text-sm font-medium uppercase tracking-wider mb-1">FSSAI Licensed</p>
                <h3 className="text-white text-2xl font-bold">License No. 22726257000084</h3>
                <p className="text-white/60 text-sm mt-1">Certified by the Food Safety and Standards Authority of India</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Link href="/shop" className="btn-primary">Shop Now</Link>
              <Link href="/contact" className="btn-outline">Contact Us</Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
