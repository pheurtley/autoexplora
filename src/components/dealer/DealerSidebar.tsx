"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  MessageCircle,
  MessageSquare,
  BarChart3,
  Users,
  Settings,
  Building2,
  ChevronRight,
  ChevronDown,
  LogOut,
  X,
  Globe,
  Search,
  CheckSquare,
  DollarSign,
  Calendar,
  FileText,
  Zap,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

interface DealerSidebarProps {
  dealer: {
    tradeName: string;
    logo?: string | null;
    status: string;
  };
  userRole?: string | null;
  micrositeActive?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  ownerOnly?: boolean;
  micrositeOnly?: boolean;
}

interface NavSection {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
  collapsible?: boolean;
}

// Main navigation items (always visible)
const mainNavItems: NavItem[] = [
  { href: "/dealer", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dealer/vehiculos", label: "Vehículos", icon: Car },
  { href: "/dealer/mensajes", label: "Mensajes", icon: MessageCircle },
];

// CRM section items
const crmItems: NavItem[] = [
  { href: "/dealer/leads", label: "Leads", icon: MessageSquare },
  { href: "/dealer/leads/tareas", label: "Tareas", icon: CheckSquare },
  { href: "/dealer/leads/oportunidades", label: "Oportunidades", icon: DollarSign },
  { href: "/dealer/leads/test-drives", label: "Test Drives", icon: Calendar },
  { href: "/dealer/configuracion/templates", label: "Plantillas", icon: FileText },
  { href: "/dealer/configuracion/respuesta-automatica", label: "Auto-respuesta", icon: Zap },
];

// Other navigation items
const otherNavItems: NavItem[] = [
  { href: "/dealer/estadisticas", label: "Estadísticas", icon: BarChart3 },
  { href: "/dealer/seo", label: "SEO", icon: Search },
  { href: "/dealer/microsite", label: "Mi Sitio Web", icon: Globe },
  { href: "/dealer/equipo", label: "Equipo", icon: Users, ownerOnly: true },
  { href: "/dealer/perfil", label: "Perfil", icon: Settings },
];

export function DealerSidebar({
  dealer,
  userRole,
  micrositeActive = false,
  isOpen = false,
  onClose,
}: DealerSidebarProps) {
  const pathname = usePathname();
  const [crmExpanded, setCrmExpanded] = useState(() => {
    // Start expanded if we're on a CRM page
    return pathname.startsWith("/dealer/leads") ||
           pathname.startsWith("/dealer/configuracion/templates") ||
           pathname.startsWith("/dealer/configuracion/respuesta-automatica");
  });

  const isOwner = userRole === "OWNER";

  const handleLinkClick = () => {
    onClose?.();
  };

  const isItemActive = (href: string) => {
    return pathname === href || (href !== "/dealer" && pathname.startsWith(href));
  };

  const isCrmSectionActive = crmItems.some(item => isItemActive(item.href));

  const renderNavItem = (item: NavItem) => {
    // Skip owner-only items for non-owners
    if (item.ownerOnly && !isOwner) return null;
    // Skip microsite-only items when microsite is inactive
    if (item.micrositeOnly && !micrositeActive) return null;

    const isActive = isItemActive(item.href);
    const Icon = item.icon;

    return (
      <li key={item.href}>
        <Link
          href={item.href}
          onClick={handleLinkClick}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            isActive
              ? "bg-andino-50 text-andino-700"
              : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
          )}
        >
          <Icon className="w-5 h-5" />
          {item.label}
          {isActive && (
            <ChevronRight className="w-4 h-4 ml-auto" />
          )}
        </Link>
      </li>
    );
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
          "w-64 min-h-screen bg-white border-r border-neutral-200 flex flex-col",
          "transform transition-transform duration-200 ease-in-out lg:transform-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <Link
              href="/dealer"
              className="flex items-center gap-3 flex-1 min-w-0"
              onClick={handleLinkClick}
            >
              <div className="w-10 h-10 rounded-lg bg-andino-100 flex items-center justify-center overflow-hidden">
                {dealer.logo ? (
                  <Image
                    src={dealer.logo}
                    alt={dealer.tradeName}
                    width={40}
                    height={40}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Building2 className="w-5 h-5 text-andino-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-neutral-900 truncate">
                  {dealer.tradeName}
                </p>
                <p className="text-xs text-neutral-500">Panel de Automotora</p>
              </div>
            </Link>
            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 -mr-2 rounded-lg hover:bg-neutral-100 transition-colors"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5 text-neutral-500" />
            </button>
          </div>
        </div>

        {/* Pending Status Alert */}
        {dealer.status === "PENDING" && (
          <div className="p-4 bg-amber-50 border-b border-amber-200">
            <p className="text-xs text-amber-700">
              Tu cuenta está pendiente de aprobación.
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {/* Main Items */}
          <ul className="space-y-1">
            {mainNavItems.map(renderNavItem)}
          </ul>

          {/* CRM Section */}
          <div className="mt-4">
            <button
              onClick={() => setCrmExpanded(!crmExpanded)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isCrmSectionActive
                  ? "bg-andino-50 text-andino-700"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              )}
            >
              <Briefcase className="w-5 h-5" />
              <span className="flex-1 text-left">CRM</span>
              {crmExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {crmExpanded && (
              <ul className="mt-1 ml-4 pl-4 border-l border-neutral-200 space-y-1">
                {crmItems.map((item) => {
                  const isActive = isItemActive(item.href);
                  const Icon = item.icon;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={handleLinkClick}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-andino-50 text-andino-700"
                            : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Other Items */}
          <ul className="mt-4 space-y-1">
            {otherNavItems.map(renderNavItem)}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200">
          <Link
            href="/"
            onClick={handleLinkClick}
            className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            Volver al Sitio
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-3 py-2 mt-1 text-sm text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}
