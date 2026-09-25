export const siteConfig = {
  name: "Gaon Pure",
  tagline: "Healthy Foods, Desi Root",
  logo: "/logo.jpeg",
  mission: "To provide unadulterated, high-quality organic products directly from the village to your home.",
  vision: "To become the most trusted global brand for authentic, traditional, and pure products.",
  
  navItems: [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  
  adminNavItems: [
    { label: "Dashboard", href: `${process.env.NEXT_PUBLIC_ADMIN_PORTAL_URL || "https://admin.gaonpure.com"}` },
    { label: "Products", href: `${process.env.NEXT_PUBLIC_ADMIN_PORTAL_URL || "https://admin.gaonpure.com"}/products` },
    { label: "Orders", href: `${process.env.NEXT_PUBLIC_ADMIN_PORTAL_URL || "https://admin.gaonpure.com"}/orders` },
    { label: "Users", href: `${process.env.NEXT_PUBLIC_ADMIN_PORTAL_URL || "https://admin.gaonpure.com"}/users` },
  ],
  
  socialLinks: {
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || "#",
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "#",
    twitter: process.env.NEXT_PUBLIC_TWITTER_URL || "#",
    linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL || "#",
  },
  
  partner: {
    name: "Verve AI",
    url: "https://verveai.co",
    role: "Development Partner"
  }
};
