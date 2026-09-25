'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Phone, Mail, Clock, ShieldCheck, MessageCircle, CheckCircle2, ExternalLink } from 'lucide-react';

const faqs = [
  { q: 'Are your products FSSAI certified?', a: 'Yes! All Gaon Pure products are covered under our FSSAI License No. 22726257000084, ensuring the highest food safety and quality standards.' },
  { q: 'Do you deliver pan-India?', a: 'Yes, we deliver to most cities and towns across India. Enter your PIN code at checkout to confirm availability.' },
  { q: 'How can I track my order?', a: 'After placing an order, you can track it from your profile page or using the Order ID sent to your email.' },
  { q: 'What is your return policy?', a: 'We offer a 7-day return/replacement policy for damaged or incorrect items. Contact us on WhatsApp for the fastest resolution.' },
  { q: 'Are the products organic?', a: 'Our products are sourced directly from trusted farmers using traditional, chemical-free methods. Many are certified organic — check each product listing for details.' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));
    setSent(true);
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ——— Hero ——— */}
      <section className="page-hero pb-16">
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <nav className="breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight className="w-3 h-3 text-stone-400" />
            <span>Contact</span>
          </nav>
          <div className="pt-4">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-brand-secondary leading-tight mb-4">
              We'd Love to <span className="text-brand-primary italic font-normal">Hear From You</span>
            </h1>
            <p className="text-xl text-stone-600 max-w-xl font-medium">
              Got a question about our products, an order issue, or just want to say hello? We're here to help.
            </p>
          </div>
        </div>
      </section>

      {/* ——— Contact Cards ——— */}
      <section className="py-14 bg-stone-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid sm:grid-cols-3 gap-6">
            {/* WhatsApp */}
            <a href="https://wa.me/919312590001" target="_blank" rel="noopener noreferrer"
              className="card p-6 group text-center hover:border-[var(--color-brand-secondary)]/30">
              <div className="w-14 h-14 rounded-2xl bg-[var(--color-brand-secondary)]/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-[var(--color-brand-secondary)]/20 transition-colors">
                <Phone className="w-7 h-7 text-[var(--color-brand-secondary)]" />
              </div>
              <h3 className="font-bold text-stone-800 mb-1">Call / WhatsApp</h3>
              <p className="text-[var(--color-brand-secondary)] font-semibold text-lg">+91 93125 90001</p>
              <p className="text-stone-400 text-xs mt-1 flex items-center justify-center gap-1">
                <ExternalLink className="w-3 h-3" /> Open in WhatsApp
              </p>
            </a>

            {/* Email */}
            <a href="mailto:gaonpure@gmail.com"
              className="card p-6 group text-center hover:border-[var(--color-brand-primary)]/30">
              <div className="w-14 h-14 rounded-2xl bg-[var(--color-brand-primary)]/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-[var(--color-brand-primary)]/20 transition-colors">
                <Mail className="w-7 h-7 text-[var(--color-brand-primary)]" />
              </div>
              <h3 className="font-bold text-stone-800 mb-1">Email Us</h3>
              <p className="text-[var(--color-brand-primary)] font-semibold">gaonpure@gmail.com</p>
              <p className="text-stone-400 text-xs mt-1">We reply within 24 hours</p>
            </a>

            {/* Hours */}
            <div className="card p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="font-bold text-stone-800 mb-1">Working Hours</h3>
              <p className="text-stone-600 font-medium">Mon – Sat</p>
              <p className="text-stone-500 text-sm">9:00 AM – 7:00 PM IST</p>
            </div>
          </div>

          {/* FSSAI badge */}
          <div className="fssai-strip mt-6 rounded-2xl px-5 py-4 justify-start gap-4">
            <ShieldCheck className="w-7 h-7 flex-shrink-0" />
            <div>
              <p className="font-bold text-white">FSSAI Licensed · No. 22726257000084</p>
              <p className="text-white/60 text-sm mt-0.5">Certified by the Food Safety and Standards Authority of India. All products meet national food safety standards.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ——— Form + FAQ ——— */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-start">

            {/* Form */}
            <div>
              <h2 className="text-3xl font-serif font-bold text-stone-800 mb-2">Send Us a Message</h2>
              <p className="text-stone-500 mb-8">Fill in the form and we'll get back to you as soon as possible.</p>

              {sent ? (
                <div className="p-8 bg-[var(--color-brand-secondary)]/5 border border-[var(--color-brand-secondary)]/20 rounded-3xl text-center">
                  <CheckCircle2 className="w-12 h-12 text-[var(--color-brand-secondary)] mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-[var(--color-brand-secondary)] mb-2">Message Received!</h3>
                  <p className="text-stone-500">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Your Name</label>
                      <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="Ramesh Singh"
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-secondary)]/20 focus:border-[var(--color-brand-secondary)] transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Phone</label>
                      <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                        placeholder="9876543210"
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-secondary)]/20 focus:border-[var(--color-brand-secondary)] transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                    <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-secondary)]/20 focus:border-[var(--color-brand-secondary)] transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Message</label>
                    <textarea required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                      placeholder="How can we help you?"
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-secondary)]/20 focus:border-[var(--color-brand-secondary)] transition-all resize-none" />
                  </div>
                  <button type="submit" disabled={sending} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-70">
                    {sending
                      ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><MessageCircle className="w-5 h-5" /> Send Message</>}
                  </button>
                </form>
              )}
            </div>

            {/* FAQ */}
            <div>
              <h2 className="text-3xl font-serif font-bold text-stone-800 mb-2">Frequently Asked</h2>
              <p className="text-stone-500 mb-8">Quick answers to questions we hear most often.</p>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <div key={i} className="border border-stone-200 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full text-left px-5 py-4 flex justify-between items-center hover:bg-stone-50 transition-colors">
                      <span className="font-semibold text-stone-800 text-sm pr-4">{faq.q}</span>
                      <ChevronRight className={`w-4 h-4 text-stone-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-90' : ''}`} />
                    </button>
                    {openFaq === i && (
                      <div className="px-5 pb-4 text-stone-600 text-sm leading-relaxed border-t border-stone-100 pt-3">{faq.a}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ——— WhatsApp sticky button ——— */}
      <a href="https://wa.me/919312590001" target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 text-white font-bold px-5 py-3 rounded-full shadow-xl hover:scale-105 transition-transform flex items-center gap-2 text-sm"
        style={{ background: '#25D366' }}>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        Chat on WhatsApp
      </a>
    </div>
  );
}
