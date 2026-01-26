"use client";

import { useState, useMemo } from "react";
import {
  Combobox as HeadlessCombobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
} from "@headlessui/react";
import { cn } from "@/lib/utils";
import { ChevronDown, Check, Search, Loader2 } from "lucide-react";

export interface ComboboxOption {
  value: string;
  label: string;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
  label,
  error,
  disabled = false,
  loading = false,
  className,
}: ComboboxProps) {
  const [query, setQuery] = useState("");

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value) || null,
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    if (query === "") {
      return options;
    }
    const normalizedQuery = query.toLowerCase().trim();
    return options.filter((option) =>
      option.label.toLowerCase().includes(normalizedQuery)
    );
  }, [options, query]);

  const handleChange = (option: ComboboxOption | null) => {
    onChange(option?.value || "");
    setQuery("");
  };

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <HeadlessCombobox
        value={selectedOption}
        onChange={handleChange}
        disabled={disabled}
      >
        <div className="relative">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
              <Search className="h-4 w-4" />
            </div>
            <ComboboxInput
              className={cn(
                "block w-full appearance-none rounded-lg border border-neutral-300 bg-white py-2.5 pl-9 pr-10 text-neutral-900 transition-colors",
                "placeholder:text-neutral-500",
                "focus:border-andino-500 focus:outline-none focus:ring-2 focus:ring-andino-500/20",
                "disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500",
                error && "border-error focus:border-error focus:ring-error/20"
              )}
              placeholder={placeholder}
              displayValue={(option: ComboboxOption | null) =>
                option?.label || ""
              }
              onChange={(event) => setQuery(event.target.value)}
            />
            <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </ComboboxButton>
          </div>

          <ComboboxOptions
            className={cn(
              "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-neutral-200 bg-white py-1 shadow-lg",
              "focus:outline-none"
            )}
          >
            {loading ? (
              <div className="px-4 py-3 text-sm text-neutral-500 text-center">
                <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                Cargando...
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-neutral-500 text-center">
                {query ? "No se encontraron resultados" : "Sin opciones"}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <ComboboxOption
                  key={option.value}
                  value={option}
                  className={({ active, selected }) =>
                    cn(
                      "relative cursor-pointer select-none py-2.5 pl-10 pr-4 text-sm",
                      active && "bg-andino-50 text-andino-900",
                      selected && "font-medium",
                      !active && !selected && "text-neutral-900"
                    )
                  }
                >
                  {({ selected }) => (
                    <>
                      <span className="block truncate">{option.label}</span>
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-andino-600">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </>
                  )}
                </ComboboxOption>
              ))
            )}
          </ComboboxOptions>
        </div>
      </HeadlessCombobox>
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
}
