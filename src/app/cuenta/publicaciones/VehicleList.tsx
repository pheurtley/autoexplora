"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VehicleListItem } from "@/components/cuenta/VehicleListItem";

interface Vehicle {
  id: string;
  slug: string;
  title: string;
  price: number;
  year: number;
  status: string;
  views: number;
  publishedAt: Date;
  brand: { name: string };
  model: { name: string };
  region: { name: string };
  images: { url: string }[];
}

interface VehicleListProps {
  initialVehicles: Vehicle[];
}

export function VehicleList({ initialVehicles }: VehicleListProps) {
  const router = useRouter();
  const [vehicles, setVehicles] = useState(initialVehicles);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/vehiculos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setVehicles((prev) =>
          prev.map((v) => (v.id === id ? { ...v, status } : v))
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/vehiculos/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setVehicles((prev) => prev.filter((v) => v.id !== id));
        router.refresh();
      }
    } catch (error) {
      console.error("Error deleting vehicle:", error);
    }
  };

  return (
    <div className="space-y-4">
      {vehicles.map((vehicle) => (
        <VehicleListItem
          key={vehicle.id}
          vehicle={vehicle}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
