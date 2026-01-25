import Link from "next/link";
import { Container } from "@/components/layout";
import {
  Car,
  Truck,
  Bike,
  Zap,
  CarFront,
  Bus,
} from "lucide-react";

const categories = [
  {
    name: "SUV",
    slug: "SUV",
    icon: Truck,
    color: "bg-blue-100 text-blue-600",
  },
  {
    name: "Sedán",
    slug: "SEDAN",
    icon: Car,
    color: "bg-green-100 text-green-600",
  },
  {
    name: "Hatchback",
    slug: "HATCHBACK",
    icon: CarFront,
    color: "bg-purple-100 text-purple-600",
  },
  {
    name: "Pickup",
    slug: "PICKUP",
    icon: Truck,
    color: "bg-orange-100 text-orange-600",
  },
  {
    name: "Motos",
    slug: "MOTO",
    icon: Bike,
    color: "bg-red-100 text-red-600",
  },
  {
    name: "Eléctricos",
    slug: "ELECTRICO",
    icon: Zap,
    color: "bg-andino-100 text-andino-600",
  },
  {
    name: "Comerciales",
    slug: "COMERCIAL",
    icon: Bus,
    color: "bg-amber-100 text-amber-600",
  },
];

function CategoryItem({ category }: { category: (typeof categories)[number] }) {
  return (
    <Link
      href={`/vehiculos?category=${category.slug}`}
      className="group flex flex-col items-center p-4 bg-white rounded-xl border border-neutral-200 hover:border-andino-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${category.color} group-hover:scale-110 transition-transform duration-300`}
      >
        <category.icon className="h-6 w-6 transition-transform group-hover:scale-110" />
      </div>
      <span className="text-sm font-medium text-neutral-700 group-hover:text-andino-600 transition-colors">
        {category.name}
      </span>
    </Link>
  );
}

export function CategoryCarousel() {
  return (
    <section className="py-12 bg-neutral-50 overflow-hidden">
      <Container>
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">
          Explorar por categoría
        </h2>

        {/* Mobile: CSS horizontal scroll */}
        <div className="md:hidden overflow-x-auto -mx-4 px-4 scrollbar-hide">
          <div className="flex gap-3 w-max">
            {categories.map((category) => (
              <CategoryItem key={category.slug} category={category} />
            ))}
          </div>
        </div>

        {/* Desktop: Grid */}
        <div className="hidden md:grid md:grid-cols-7 gap-4">
          {categories.map((category) => (
            <CategoryItem key={category.slug} category={category} />
          ))}
        </div>
      </Container>
    </section>
  );
}
