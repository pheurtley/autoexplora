"use client";

import { useState } from "react";
import { Menu, Mountain } from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";

interface AdminLayoutClientProps {
  children: React.ReactNode;
}

export function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-neutral-100">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="flex-1 overflow-auto">
        {/* Mobile header with hamburger */}
        <div className="lg:hidden flex items-center gap-3 p-4 border-b border-neutral-200 bg-white sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-neutral-100 transition-colors"
            aria-label="Abrir menú"
          >
            <Menu className="w-6 h-6 text-neutral-700" />
          </button>
          <Mountain className="h-6 w-6 text-andino-600" />
          <span className="font-semibold text-neutral-900">Panel Admin</span>
        </div>

        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
