"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, Heart, Settings, User, MessageSquare } from "lucide-react";

interface AccountSidebarProps {
  userName?: string | null;
  userEmail?: string | null;
}

const menuItems = [
  {
    href: "/cuenta/publicaciones",
    label: "Mis Publicaciones",
    icon: Car,
  },
  {
    href: "/cuenta/mensajes",
    label: "Mis Mensajes",
    icon: MessageSquare,
  },
  {
    href: "/cuenta/favoritos",
    label: "Mis Favoritos",
    icon: Heart,
  },
  {
    href: "/cuenta/configuracion",
    label: "Mi Cuenta",
    icon: Settings,
  },
];

export function AccountSidebar({ userName, userEmail }: AccountSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 shrink-0">
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {/* User Info */}
        <div className="p-4 bg-andino-50 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-andino-600 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-neutral-900 truncate">
                {userName || "Usuario"}
              </p>
              <p className="text-sm text-neutral-500 truncate">{userEmail}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${
                    isActive
                      ? "bg-andino-100 text-andino-700 font-medium"
                      : "text-neutral-600 hover:bg-neutral-100"
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
