"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Container } from "./Container";
import { SearchBar, SearchModal } from "./SearchBar";
import { Button } from "@/components/ui";
import {
  Menu,
  X,
  Car,
  Bike,
  Truck,
  Search,
  User,
  Heart,
  Plus,
  Mountain,
  LogOut,
  Settings,
  ChevronDown,
  MessageSquare,
  Building2,
} from "lucide-react";
import { UnreadBadge } from "@/components/chat";

const navigation = [
  { name: "Autos", href: "/vehiculos?type=AUTO", icon: Car },
  { name: "Motos", href: "/vehiculos?type=MOTO", icon: Bike },
  { name: "Comerciales", href: "/vehiculos?type=COMERCIAL", icon: Truck },
];

export function Header() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isLoading = status === "loading";
  const isLoggedIn = !!session?.user;

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
      <Container>
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Mountain className="h-8 w-8 text-andino-600" />
            <span className="text-xl font-bold text-andino-700">
              PortalAndino
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-1.5 text-neutral-600 hover:text-andino-600 transition-colors font-medium"
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Desktop Search Bar */}
            <SearchBar className="w-64 lg:w-80" />
            <Link
              href="/cuenta/favoritos"
              className="p-2 text-neutral-600 hover:text-andino-600 hover:bg-neutral-50 rounded-lg transition-colors"
            >
              <Heart className="h-5 w-5" />
            </Link>

            {/* Messages Badge - Only for logged in users */}
            {isLoggedIn && <UnreadBadge />}

            {/* User Menu */}
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-neutral-100 animate-pulse" />
            ) : isLoggedIn ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 text-neutral-600 hover:text-andino-600 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-andino-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-andino-600" />
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-neutral-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-neutral-100">
                      <p className="font-medium text-neutral-900 truncate">
                        {session?.user?.name || "Usuario"}
                      </p>
                      <p className="text-sm text-neutral-500 truncate">
                        {session?.user?.email}
                      </p>
                    </div>
                    {session?.user?.dealerId && (
                      <Link
                        href="/dealer"
                        className="flex items-center gap-3 px-4 py-2 text-andino-600 bg-andino-50 hover:bg-andino-100 transition-colors font-medium"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Building2 className="w-4 h-4" />
                        Panel Concesionario
                      </Link>
                    )}
                    <Link
                      href={session?.user?.dealerId ? "/dealer/vehiculos" : "/cuenta/publicaciones"}
                      className="flex items-center gap-3 px-4 py-2 text-neutral-600 hover:bg-neutral-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Car className="w-4 h-4" />
                      Mis Publicaciones
                    </Link>
                    <Link
                      href={session?.user?.dealerId ? "/dealer/mensajes" : "/cuenta/mensajes"}
                      className="flex items-center gap-3 px-4 py-2 text-neutral-600 hover:bg-neutral-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <MessageSquare className="w-4 h-4" />
                      Mis Mensajes
                    </Link>
                    <Link
                      href="/cuenta/favoritos"
                      className="flex items-center gap-3 px-4 py-2 text-neutral-600 hover:bg-neutral-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Heart className="w-4 h-4" />
                      Mis Favoritos
                    </Link>
                    <Link
                      href="/cuenta/configuracion"
                      className="flex items-center gap-3 px-4 py-2 text-neutral-600 hover:bg-neutral-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Mi Cuenta
                    </Link>
                    <hr className="my-2 border-neutral-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 w-full text-left text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="p-2 text-neutral-600 hover:text-andino-600 hover:bg-neutral-50 rounded-lg transition-colors"
              >
                <User className="h-5 w-5" />
              </Link>
            )}

            <Link href="/publicar">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1.5" />
                Publicar
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2 text-neutral-600 hover:text-andino-600 hover:bg-neutral-50 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </nav>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-100">
            <div className="flex flex-col gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 text-neutral-600 hover:text-andino-600 hover:bg-neutral-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}
              <hr className="my-2 border-neutral-100" />
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSearchModalOpen(true);
                }}
                className="flex items-center gap-3 px-3 py-2 text-neutral-600 hover:text-andino-600 hover:bg-neutral-50 rounded-lg transition-colors w-full text-left"
              >
                <Search className="h-5 w-5" />
                Buscar
              </button>
              <Link
                href="/cuenta/favoritos"
                className="flex items-center gap-3 px-3 py-2 text-neutral-600 hover:text-andino-600 hover:bg-neutral-50 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Heart className="h-5 w-5" />
                Favoritos
              </Link>

              {isLoggedIn ? (
                <>
                  {session?.user?.dealerId && (
                    <Link
                      href="/dealer"
                      className="flex items-center gap-3 px-3 py-2 text-andino-600 bg-andino-50 hover:bg-andino-100 rounded-lg transition-colors font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Building2 className="h-5 w-5" />
                      Panel Concesionario
                    </Link>
                  )}
                  <Link
                    href={session?.user?.dealerId ? "/dealer/vehiculos" : "/cuenta/publicaciones"}
                    className="flex items-center gap-3 px-3 py-2 text-neutral-600 hover:text-andino-600 hover:bg-neutral-50 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Car className="h-5 w-5" />
                    Mis Publicaciones
                  </Link>
                  <Link
                    href={session?.user?.dealerId ? "/dealer/mensajes" : "/cuenta/mensajes"}
                    className="flex items-center gap-3 px-3 py-2 text-neutral-600 hover:text-andino-600 hover:bg-neutral-50 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <MessageSquare className="h-5 w-5" />
                    Mis Mensajes
                  </Link>
                  <Link
                    href="/cuenta/configuracion"
                    className="flex items-center gap-3 px-3 py-2 text-neutral-600 hover:text-andino-600 hover:bg-neutral-50 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="h-5 w-5" />
                    Mi Cuenta
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left"
                  >
                    <LogOut className="h-5 w-5" />
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-3 px-3 py-2 text-neutral-600 hover:text-andino-600 hover:bg-neutral-50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  Ingresar
                </Link>
              )}

              <hr className="my-2 border-neutral-100" />
              <Link
                href="/publicar"
                className="mx-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button fullWidth>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Publicar vehículo
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Container>

      {/* Search Modal */}
      {searchModalOpen && (
        <SearchModal onClose={() => setSearchModalOpen(false)} />
      )}
    </header>
  );
}
