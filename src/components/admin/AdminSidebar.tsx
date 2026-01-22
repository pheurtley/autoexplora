"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Flag,
  Users,
  ChevronLeft,
  Tag,
  MapPin,
  Settings,
  ChevronDown,
  ChevronRight,
  Building2,
  X,
  Search,
  Layers,
  Tags,
  Database,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  name: string;
  items: NavItem[];
}

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const mainNavigation: NavItem[] = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Vehículos",
    href: "/admin/vehiculos",
    icon: Car,
  },
  {
    name: "Automotoras",
    href: "/admin/automotoras",
    icon: Building2,
  },
  {
    name: "Reportes",
    href: "/admin/reportes",
    icon: Flag,
  },
  {
    name: "Usuarios",
    href: "/admin/usuarios",
    icon: Users,
  },
];

const catalogNavigation: NavGroup = {
  name: "Catálogos",
  items: [
    {
      name: "Dashboard",
      href: "/admin/catalogo",
      icon: Database,
    },
    {
      name: "Marcas",
      href: "/admin/marcas",
      icon: Tag,
    },
    {
      name: "Modelos",
      href: "/admin/modelos",
      icon: Layers,
    },
    {
      name: "Versiones",
      href: "/admin/versiones",
      icon: Tags,
    },
    {
      name: "Regiones",
      href: "/admin/regiones",
      icon: MapPin,
    },
  ],
};

const settingsNavigation: NavItem[] = [
  {
    name: "Configuración",
    href: "/admin/configuracion",
    icon: Settings,
  },
];

export function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { config } = useSiteConfig();
  const [catalogOpen, setCatalogOpen] = useState(
    pathname.startsWith("/admin/catalogo") ||
    pathname.startsWith("/admin/marcas") ||
    pathname.startsWith("/admin/modelos") ||
    pathname.startsWith("/admin/versiones") ||
    pathname.startsWith("/admin/regiones")
  );

  const logoSrc = config.logo; // Use configured logo, no fallback

  const isItemActive = (href: string) =>
    pathname === href || (href !== "/admin" && pathname.startsWith(href));

  const handleLinkClick = () => {
    onClose?.();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50",
          "w-64 bg-neutral-900 min-h-screen flex flex-col",
          "transform transition-transform duration-200 ease-in-out lg:transform-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-4 border-b border-neutral-800">
          <div className="flex items-center justify-between">
            <Link
              href="/admin"
              className="flex items-center gap-2 flex-1"
              onClick={handleLinkClick}
            >
              <div className="h-8 w-8 rounded-full bg-white p-0.5 flex items-center justify-center">
                {logoSrc ? (
                  <Image src={logoSrc} alt={config.siteName} width={28} height={28} className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <Search className="h-5 w-5 text-andino-600" />
                )}
              </div>
              <div>
                <span className="text-lg font-bold text-white">{config.siteName}</span>
                <span className="block text-xs text-neutral-400">Panel Admin</span>
              </div>
            </Link>
            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 -mr-2 rounded-lg hover:bg-neutral-800 transition-colors"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5 text-neutral-400" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {/* Main Navigation */}
          <ul className="space-y-1">
            {mainNavigation.map((item) => {
              const isActive = isItemActive(item.href);

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                      isActive
                        ? "bg-andino-600 text-white"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Divider */}
          <div className="my-4 border-t border-neutral-800" />

          {/* Catalog Navigation (Collapsible) */}
          <div>
            <button
              onClick={() => setCatalogOpen(!catalogOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <span className="flex items-center gap-3">
                <Tag className="h-5 w-5" />
                {catalogNavigation.name}
              </span>
              {catalogOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {catalogOpen && (
              <ul className="mt-1 ml-4 space-y-1">
                {catalogNavigation.items.map((item) => {
                  const isActive = isItemActive(item.href);

                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={handleLinkClick}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-andino-600 text-white"
                            : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-neutral-800" />

          {/* Settings Navigation */}
          <ul className="space-y-1">
            {settingsNavigation.map((item) => {
              const isActive = isItemActive(item.href);

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                      isActive
                        ? "bg-andino-600 text-white"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Back to site */}
        <div className="p-4 border-t border-neutral-800">
          <Link
            href="/"
            onClick={handleLinkClick}
            className="flex items-center gap-2 px-3 py-2.5 text-neutral-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver al sitio
          </Link>
        </div>
      </aside>
    </>
  );
}
