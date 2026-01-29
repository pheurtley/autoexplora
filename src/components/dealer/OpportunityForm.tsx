"use client";

import { useState, useEffect } from "react";
import { X, DollarSign, Calendar, TrendingUp, Car } from "lucide-react";
import { Button, Input, Select } from "@/components/ui";

interface Vehicle {
  id: string;
  title: string;
}

interface OpportunityFormProps {
  leadId: string;
  initialData?: {
    id: string;
    estimatedValue: number;
    probability: number;
    expectedCloseDate: string | null;
    status: string;
    notes: string | null;
    vehicleId: string | null;
  };
  onSave: () => void;
  onCancel: () => void;
}

const STATUS_OPTIONS = [
  { value: "OPEN", label: "Abierta" },
  { value: "WON", label: "Ganada" },
  { value: "LOST", label: "Perdida" },
];

const PROBABILITY_OPTIONS = [
  { value: "10", label: "10% - Muy baja" },
  { value: "25", label: "25% - Baja" },
  { value: "50", label: "50% - Media" },
  { value: "75", label: "75% - Alta" },
  { value: "90", label: "90% - Muy alta" },
];

export function OpportunityForm({
  leadId,
  initialData,
  onSave,
  onCancel,
}: OpportunityFormProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [vehicleId, setVehicleId] = useState(initialData?.vehicleId || "");
  const [estimatedValue, setEstimatedValue] = useState(
    initialData?.estimatedValue?.toString() || ""
  );
  const [probability, setProbability] = useState(
    initialData?.probability?.toString() || "50"
  );
  const [expectedCloseDate, setExpectedCloseDate] = useState(
    initialData?.expectedCloseDate?.split("T")[0] || ""
  );
  const [status, setStatus] = useState(initialData?.status || "OPEN");
  const [notes, setNotes] = useState(initialData?.notes || "");

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await fetch("/api/dealer/vehiculos");
        if (res.ok) {
          const data = await res.json();
          setVehicles(data.vehicles || []);
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      }
    };
    fetchVehicles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!estimatedValue || parseInt(estimatedValue) <= 0) {
      setError("El valor estimado es requerido");
      return;
    }

    setLoading(true);
    try {
      const url = initialData
        ? `/api/dealer/leads/${leadId}/opportunities/${initialData.id}`
        : `/api/dealer/leads/${leadId}/opportunities`;

      const res = await fetch(url, {
        method: initialData ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: vehicleId || null,
          estimatedValue: parseInt(estimatedValue),
          probability: parseInt(probability),
          expectedCloseDate: expectedCloseDate || null,
          status,
          notes: notes.trim() || null,
        }),
      });

      if (res.ok) {
        onSave();
      } else {
        const data = await res.json();
        setError(data.error || "Error al guardar");
      }
    } catch {
      setError("Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const vehicleOptions = [
    { value: "", label: "Sin vehículo específico" },
    ...vehicles.map((v) => ({ value: v.id, label: v.title })),
  ];

  return (
    <div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-neutral-900">
          {initialData ? "Editar Oportunidad" : "Nueva Oportunidad"}
        </h4>
        <button
          onClick={onCancel}
          className="p-1 hover:bg-neutral-200 rounded transition-colors"
        >
          <X className="h-4 w-4 text-neutral-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Vehicle */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 mb-1.5">
            <Car className="h-4 w-4" />
            Vehículo
          </label>
          <Select
            options={vehicleOptions}
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Estimated Value */}
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 mb-1.5">
            <DollarSign className="h-4 w-4" />
            Valor Estimado *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
              $
            </span>
            <Input
              type="number"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
              placeholder="15000000"
              disabled={loading}
              className="pl-7"
              required
            />
          </div>
        </div>

        {/* Probability and Close Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 mb-1.5">
              <TrendingUp className="h-4 w-4" />
              Probabilidad
            </label>
            <Select
              options={PROBABILITY_OPTIONS}
              value={probability}
              onChange={(e) => setProbability(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 mb-1.5">
              <Calendar className="h-4 w-4" />
              Cierre Esperado
            </label>
            <Input
              type="date"
              value={expectedCloseDate}
              onChange={(e) => setExpectedCloseDate(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {/* Status (only for editing) */}
        {initialData && (
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-1.5 block">
              Estado
            </label>
            <Select
              options={STATUS_OPTIONS}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={loading}
            />
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="text-sm font-medium text-neutral-700 mb-1.5 block">
            Notas
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas adicionales..."
            disabled={loading}
            className="w-full px-3 py-2 text-sm text-neutral-900 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-andino-500 focus:border-andino-500 placeholder:text-neutral-400"
          />
        </div>

        {/* Error */}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : initialData ? "Guardar" : "Crear"}
          </Button>
        </div>
      </form>
    </div>
  );
}
