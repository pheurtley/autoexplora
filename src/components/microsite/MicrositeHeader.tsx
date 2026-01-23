"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Phone } from "lucide-react";
import type { DealerSiteConfigWithRelations } from "@/lib/microsite/get-dealer-config";

interface MicrositeHeaderProps {
  config: DealerSiteConfigWithRelations;
}

export function MicrositeHeader({ config }: MicrositeHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navPages = config.pages.filter((p) => p.showInNav);

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Name */}
          <Link href="/" className="flex items-center gap-3">
            {config.logo ? (
              <Image
                src={config.logo}
                alt={config.dealer.tradeName}
                width={40}
                height={40}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: "var(--ms-primary)" }}
              >
                {config.dealer.tradeName.charAt(0)}
              </div>
            )}
            <span className="font-semibold text-neutral-900 text-lg">
              {config.dealer.tradeName}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Inicio
            </Link>
            <Link
              href="/vehiculos"
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Vehículos
            </Link>
            {navPages.map((page) => (
              <Link
                key={page.id}
                href={`/${page.slug}`}
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                {page.title}
              </Link>
            ))}
            <Link
              href="/contacto"
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Contacto
            </Link>
            {config.contactPhone && (
              <a
                href={`tel:${config.contactPhone}`}
                className="flex items-center gap-1.5 text-sm font-medium transition-colors"
                style={{ color: "var(--ms-primary)" }}
              >
                <Phone className="h-4 w-4" />
                {config.contactPhone}
              </a>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-600 hover:text-neutral-900"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 py-4 space-y-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-lg"
            >
              Inicio
            </Link>
            <Link
              href="/vehiculos"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-lg"
            >
              Vehículos
            </Link>
            {navPages.map((page) => (
              <Link
                key={page.id}
                href={`/${page.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-lg"
              >
                {page.title}
              </Link>
            ))}
            <Link
              href="/contacto"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-lg"
            >
              Contacto
            </Link>
            {config.contactPhone && (
              <a
                href={`tel:${config.contactPhone}`}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium"
                style={{ color: "var(--ms-primary)" }}
              >
                <Phone className="h-4 w-4" />
                {config.contactPhone}
              </a>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
