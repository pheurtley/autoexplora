"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Flag,
  Users,
  Mountain,
  ChevronLeft,
  Tag,
  MapPin,
  Settings,
  ChevronDown,
  ChevronRight,
  Building2,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  name: string;
  items: NavItem[];
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
    name: "Concesionarios",
    href: "/admin/concesionarios",
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
      name: "Marcas",
      href: "/admin/marcas",
      icon: Tag,
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

export function AdminSidebar() {
  const pathname = usePathname();
  const [catalogOpen, setCatalogOpen] = useState(
    pathname.startsWith("/admin/marcas") || pathname.startsWith("/admin/regiones")
  );

  const isItemActive = (href: string) =>
    pathname === href || (href !== "/admin" && pathname.startsWith(href));

  return (
    <aside className="w-64 bg-neutral-900 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-neutral-800">
        <Link href="/admin" className="flex items-center gap-2">
          <Mountain className="h-8 w-8 text-andino-400" />
          <div>
            <span className="text-lg font-bold text-white">PortalAndino</span>
            <span className="block text-xs text-neutral-400">Panel Admin</span>
          </div>
        </Link>
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
          className="flex items-center gap-2 px-3 py-2.5 text-neutral-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver al sitio
        </Link>
      </div>
    </aside>
  );
}
