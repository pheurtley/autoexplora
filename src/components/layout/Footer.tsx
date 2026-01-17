"use client";

import Link from "next/link";
import { Container } from "./Container";
import { Facebook, Instagram, Youtube, Twitter, Search } from "lucide-react";
import { useSiteConfig, LogoSize } from "@/components/providers/SiteConfigProvider";

const LOGO_SIZE_CLASSES: Record<LogoSize, string> = {
  xs: "h-5 w-5",       // 20px
  sm: "h-6 w-6",       // 24px
  md: "h-8 w-8",       // 32px
  lg: "h-10 w-10",     // 40px
  xl: "h-12 w-12",     // 48px
  "2xl": "h-16 w-16",  // 64px
  "3xl": "h-20 w-20",  // 80px
  "4xl": "h-24 w-24",  // 96px
  "5xl": "h-32 w-32",  // 128px
  "6xl": "h-48 w-48",  // 192px
  "7xl": "h-64 w-64",  // 256px
};

const footerLinks = {
  vehiculos: {
    title: "Vehículos",
    links: [
      { name: "Autos", href: "/vehiculos?vehicleType=AUTO" },
      { name: "Motos", href: "/vehiculos?vehicleType=MOTO" },
      { name: "Comerciales", href: "/vehiculos?vehicleType=COMERCIAL" },
      { name: "Nuevos", href: "/vehiculos?condition=NUEVO" },
      { name: "Usados", href: "/vehiculos?condition=USADO" },
      { name: "Concesionarios", href: "/concesionarios" },
    ],
  },
  marcas: {
    title: "Marcas Populares",
    links: [
      { name: "Toyota", href: "/vehiculos?brand=toyota" },
      { name: "Chevrolet", href: "/vehiculos?brand=chevrolet" },
      { name: "Hyundai", href: "/vehiculos?brand=hyundai" },
      { name: "Kia", href: "/vehiculos?brand=kia" },
      { name: "Nissan", href: "/vehiculos?brand=nissan" },
    ],
  },
  regiones: {
    title: "Por Región",
    links: [
      { name: "Santiago", href: "/vehiculos?region=metropolitana" },
      { name: "Valparaíso", href: "/vehiculos?region=valparaiso" },
      { name: "Concepción", href: "/vehiculos?region=biobio" },
      { name: "La Serena", href: "/vehiculos?region=coquimbo" },
      { name: "Temuco", href: "/vehiculos?region=la-araucania" },
    ],
  },
  ayuda: {
    title: "Ayuda",
    links: [
      { name: "Cómo publicar", href: "/ayuda/como-publicar" },
      { name: "Preguntas frecuentes", href: "/ayuda/faq" },
      { name: "Contacto", href: "/contacto" },
      { name: "Términos y condiciones", href: "/terminos" },
      { name: "Privacidad", href: "/privacidad" },
    ],
  },
};

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "#" },
  { name: "Instagram", icon: Instagram, href: "#" },
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "Youtube", icon: Youtube, href: "#" },
];

export function Footer() {
  const { config } = useSiteConfig();
  const logoSrc = config.logo; // Use configured logo, no fallback
  const logoSizeClass = LOGO_SIZE_CLASSES[config.footerLogoSize] || LOGO_SIZE_CLASSES.md;

  return (
    <footer className="bg-neutral-900 text-neutral-300 mt-auto">
      <Container>
        <div className="py-12">
          {/* Top Section */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                {logoSrc ? (
                  <img src={logoSrc} alt={config.siteName} className={`${logoSizeClass} rounded-full object-cover`} />
                ) : (
                  <Search className="h-8 w-8 text-white" />
                )}
                {config.showSiteNameInFooter && (
                  <span className="text-xl font-bold text-white">
                    {config.siteName}
                  </span>
                )}
              </Link>
              <p className="text-sm text-neutral-400 mb-4">
                {config.siteTagline || "El marketplace de vehículos más grande de Chile. Compra y vende de forma segura."}
              </p>
              {/* Social Links */}
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="p-2 bg-neutral-800 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
                    aria-label={social.name}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links Columns */}
            {Object.values(footerLinks).map((section) => (
              <div key={section.title}>
                <h3 className="font-semibold text-white mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-neutral-400 hover:text-white transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Section */}
          <div className="pt-8 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-neutral-500">
              © {new Date().getFullYear()} {config.siteName}. Todos los derechos
              reservados.
            </p>
            <div className="flex gap-6 text-sm text-neutral-500">
              <Link href="/terminos" className="hover:text-white transition-colors">
                Términos
              </Link>
              <Link href="/privacidad" className="hover:text-white transition-colors">
                Privacidad
              </Link>
              <Link href="/cookies" className="hover:text-white transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
