"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onClose?: () => void;
}

export function SearchBar({
  className = "",
  placeholder = "Buscar vehículos...",
  autoFocus = false,
  onClose,
}: SearchBarProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/vehiculos?search=${encodeURIComponent(query.trim())}`);
      onClose?.();
    }
  };

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-neutral-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 bg-neutral-100 border border-transparent rounded-lg text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:bg-white focus:border-andino-500 focus:ring-2 focus:ring-andino-500/20 transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 p-0.5 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
}

// Expanded search modal for mobile/full-page search
export function SearchModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    inputRef.current?.focus();
    // Lock body scroll
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/vehiculos?search=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  const quickSearches = [
    { label: "Toyota Corolla", query: "Toyota Corolla" },
    { label: "SUV", query: "SUV" },
    { label: "Pickup", query: "Pickup" },
    { label: "Automático", query: "automático" },
    { label: "Híbrido", query: "híbrido" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 animate-in fade-in duration-200 overflow-hidden">
      <div className="bg-white w-full max-w-2xl mx-4 sm:mx-auto mt-20 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-300">
        <form onSubmit={handleSubmit} className="p-4">
          <div className="relative flex items-center">
            <Search className="absolute left-4 h-5 w-5 text-neutral-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="¿Qué vehículo estás buscando?"
              className="w-full pl-12 pr-12 py-4 bg-neutral-50 border border-neutral-200 rounded-xl text-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-andino-500 focus:ring-2 focus:ring-andino-500/20 transition-colors"
            />
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </form>

        {/* Quick searches */}
        <div className="px-4 pb-4">
          <p className="text-sm text-neutral-500 mb-2">Búsquedas populares:</p>
          <div className="flex flex-wrap gap-2">
            {quickSearches.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  router.push(`/vehiculos?search=${encodeURIComponent(item.query)}`);
                  onClose();
                }}
                className="px-3 py-1.5 text-sm bg-neutral-100 hover:bg-andino-100 text-neutral-700 hover:text-andino-700 rounded-full transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Keyboard hint */}
        <div className="px-4 py-3 bg-neutral-50 border-t border-neutral-100 text-xs text-neutral-500 flex items-center gap-4">
          <span>
            <kbd className="px-1.5 py-0.5 bg-white border border-neutral-200 rounded text-xs">Enter</kbd>
            {" "}para buscar
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-white border border-neutral-200 rounded text-xs">Esc</kbd>
            {" "}para cerrar
          </span>
        </div>
      </div>

      {/* Click outside to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}
