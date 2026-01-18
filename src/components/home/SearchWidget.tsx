"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { Search, Car, Bike, Truck } from "lucide-react";

const vehicleTypes = [
  { id: "AUTO", label: "Autos", icon: Car },
  { id: "MOTO", label: "Motos", icon: Bike },
  { id: "COMERCIAL", label: "Comerciales", icon: Truck },
];

export function SearchWidget() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState("AUTO");
  const [brand, setBrand] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("type", selectedType);
    if (brand) params.set("brand", brand);
    if (priceMax) params.set("priceMax", priceMax);
    router.push(`/vehiculos?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 max-w-4xl mx-auto animate-scale-in animation-delay-100 overflow-hidden">
      {/* Vehicle Type Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {vehicleTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`group flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
              selectedType === type.id
                ? "bg-andino-600 text-white shadow-md shadow-andino-600/25"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:shadow-sm"
            }`}
          >
            <type.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
            {type.label}
          </button>
        ))}
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Marca
            </label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-neutral-900 focus:border-andino-500 focus:outline-none focus:ring-2 focus:ring-andino-500/20 transition-all hover:border-neutral-400"
            >
              <option value="">Todas las marcas</option>
              <option value="toyota">Toyota</option>
              <option value="chevrolet">Chevrolet</option>
              <option value="hyundai">Hyundai</option>
              <option value="kia">Kia</option>
              <option value="nissan">Nissan</option>
              <option value="suzuki">Suzuki</option>
              <option value="mazda">Mazda</option>
              <option value="ford">Ford</option>
              <option value="volkswagen">Volkswagen</option>
              <option value="honda">Honda</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Precio máximo
            </label>
            <select
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-neutral-900 focus:border-andino-500 focus:outline-none focus:ring-2 focus:ring-andino-500/20 transition-all hover:border-neutral-400"
            >
              <option value="">Sin límite</option>
              <option value="5000000">$5.000.000</option>
              <option value="10000000">$10.000.000</option>
              <option value="15000000">$15.000.000</option>
              <option value="20000000">$20.000.000</option>
              <option value="30000000">$30.000.000</option>
              <option value="50000000">$50.000.000</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              type="submit"
              fullWidth
              size="lg"
              className="hover:shadow-lg hover:shadow-andino-600/25 active:scale-[0.98] transition-all"
            >
              <Search className="h-5 w-5 mr-2" />
              Buscar
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
