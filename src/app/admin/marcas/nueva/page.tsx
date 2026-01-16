"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandForm } from "@/components/admin/BrandForm";

export default function NewBrandPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/marcas"
          className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a marcas
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">Nueva marca</h1>
        <p className="text-neutral-600 mt-1">
          Crea una nueva marca de vehículos
        </p>
      </div>

      {/* Form */}
      <BrandForm />
    </div>
  );
}
