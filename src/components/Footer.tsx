import Link from 'next/link';
import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { siteConfig } from '@/config/site';

export function Footer() {
  return (
    <footer className="bg-brand-secondary text-stone-200/90 py-16 px-4 border-t border-brand-secondary-dark mt-20 relative overflow-hidden">
      {/* Decorative background grains overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#dfa867_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />
      
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl relative z-10">
        
        {/* Brand details */}
        <div className="space-y-6 col-span-1 md:col-span-2 lg:col-span-1.5">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative overflow-hidden rounded-full w-12 h-12 border-2 border-brand-accent/40 shadow-inner bg-white">
              <img src={siteConfig.logo} alt={siteConfig.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold text-white block leading-none tracking-tight">
                {siteConfig.name}
              </span>
              <span className="text-[9px] text-brand-accent font-bold uppercase tracking-widest block mt-1">
                {siteConfig.tagline}
              </span>
            </div>
          </Link>
          <div className="max-w-md space-y-4">
            <p className="text-sm leading-relaxed opacity-85 text-stone-300">
              {siteConfig.mission}
            </p>
            <p className="text-sm font-semibold italic text-brand-accent opacity-90">
              "{siteConfig.vision}"
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <a 
              href={siteConfig.socialLinks.facebook} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-brand-accent hover:bg-white/10 hover:border-brand-accent/50 transition-all p-2.5 bg-brand-secondary-dark/60 rounded-full border border-white/5"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a 
              href={siteConfig.socialLinks.instagram} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-brand-accent hover:bg-white/10 hover:border-brand-accent/50 transition-all p-2.5 bg-brand-secondary-dark/60 rounded-full border border-white/5"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a 
              href={siteConfig.socialLinks.twitter} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-brand-accent hover:bg-white/10 hover:border-brand-accent/50 transition-all p-2.5 bg-brand-secondary-dark/60 rounded-full border border-white/5"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a 
              href={siteConfig.socialLinks.linkedin} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-brand-accent hover:bg-white/10 hover:border-brand-accent/50 transition-all p-2.5 bg-brand-secondary-dark/60 rounded-full border border-white/5"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Navigation links */}
        <div className="space-y-5">
          <h4 className="font-serif text-lg font-semibold text-white border-b border-white/10 pb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent" /> Quick Links
          </h4>
          <ul className="space-y-3.5 text-sm">
            {siteConfig.navItems.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="hover:text-brand-accent transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-white/20 group-hover:bg-brand-accent transition-all" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact info */}
        <div className="space-y-5">
          <h4 className="font-serif text-lg font-semibold text-white border-b border-white/10 pb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent" /> Origin & Contacts
          </h4>
          <ul className="space-y-4 text-sm text-stone-300">
            <li className="flex items-start gap-3">
              <span className="text-brand-accent mt-0.5 select-none text-base">📍</span>
              <span className="opacity-90">
                Village-Bhitari, Post-Bhitari,<br />
                Ayodhya, Uttar Pradesh, 224164
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-brand-accent select-none text-base">📞</span>
              <a href="tel:+919312590001" className="hover:text-brand-accent transition-colors opacity-90 font-medium">
                +91 93125 90001
              </a>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-brand-accent select-none text-base">✉️</span>
              <a href="mailto:gaonpure01@gmail.com" className="hover:text-brand-accent transition-colors opacity-90 font-medium">
                gaonpure01@gmail.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer base metadata */}
      <div className="container mx-auto mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs opacity-75 max-w-7xl relative z-10 text-stone-400">
        <p>&copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
        <p className="flex items-center gap-1.5">
          <span>{siteConfig.partner.role}:</span>
          <a 
            href={siteConfig.partner.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-white hover:text-brand-accent transition-colors font-semibold underline decoration-white/20 underline-offset-2"
          >
            {siteConfig.partner.name}
          </a>
        </p>
      </div>
    </footer>
  );
}
