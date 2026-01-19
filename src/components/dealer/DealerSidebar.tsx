"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  MessageCircle,
  BarChart3,
  Users,
  Settings,
  Building2,
  ChevronRight,
  LogOut,
  X,
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
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  { href: "/dealer", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dealer/vehiculos", label: "Vehículos", icon: Car },
  { href: "/dealer/mensajes", label: "Mensajes", icon: MessageCircle },
  { href: "/dealer/estadisticas", label: "Estadísticas", icon: BarChart3 },
  { href: "/dealer/equipo", label: "Equipo", icon: Users, ownerOnly: true },
  { href: "/dealer/perfil", label: "Perfil", icon: Settings },
];

export function DealerSidebar({
  dealer,
  userRole,
  isOpen = false,
  onClose,
}: DealerSidebarProps) {
  const pathname = usePathname();

  const isOwner = userRole === "OWNER";

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
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              // Skip owner-only items for non-owners
              if (item.ownerOnly && !isOwner) return null;

              const isActive =
                pathname === item.href ||
                (item.href !== "/dealer" && pathname.startsWith(item.href));
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
            })}
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
