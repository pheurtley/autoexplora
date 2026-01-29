"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Clock, Car } from "lucide-react";
import { Button, Input, Select } from "@/components/ui";

interface Vehicle {
  id: string;
  title: string;
}

interface TestDriveSchedulerProps {
  leadId: string;
  initialData?: {
    id: string;
    vehicleId: string;
    scheduledAt: string;
    duration: number;
    status: string;
    notes: string | null;
  };
  onSave: () => void;
  onCancel: () => void;
}

const DURATION_OPTIONS = [
  { value: "15", label: "15 minutos" },
  { value: "30", label: "30 minutos" },
  { value: "45", label: "45 minutos" },
  { value: "60", label: "1 hora" },
];

const STATUS_OPTIONS = [
  { value: "SCHEDULED", label: "Programado" },
  { value: "COMPLETED", label: "Completado" },
  { value: "CANCELLED", label: "Cancelado" },
  { value: "NO_SHOW", label: "No asistió" },
];

export function TestDriveScheduler({
  leadId,
  initialData,
  onSave,
  onCancel,
}: TestDriveSchedulerProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [vehicleId, setVehicleId] = useState(initialData?.vehicleId || "");
  const [date, setDate] = useState(
    initialData?.scheduledAt
      ? new Date(initialData.scheduledAt).toISOString().split("T")[0]
      : ""
  );
  const [time, setTime] = useState(
    initialData?.scheduledAt
      ? new Date(initialData.scheduledAt).toTimeString().slice(0, 5)
      : ""
  );
  const [duration, setDuration] = useState(
    initialData?.duration?.toString() || "30"
  );
  const [status, setStatus] = useState(initialData?.status || "SCHEDULED");
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

    if (!vehicleId) {
      setError("Selecciona un vehículo");
      return;
    }

    if (!date || !time) {
      setError("Fecha y hora son requeridos");
      return;
    }

    const scheduledAt = new Date(`${date}T${time}`);
    if (scheduledAt < new Date() && !initialData) {
      setError("La fecha debe ser futura");
      return;
    }

    setLoading(true);
    try {
      const url = initialData
        ? `/api/dealer/leads/${leadId}/test-drives/${initialData.id}`
        : `/api/dealer/leads/${leadId}/test-drives`;

      const res = await fetch(url, {
        method: initialData ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId,
          scheduledAt: scheduledAt.toISOString(),
          duration: parseInt(duration),
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

  const vehicleOptions = vehicles.map((v) => ({ value: v.id, label: v.title }));
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-neutral-900">
          {initialData ? "Editar Test Drive" : "Agendar Test Drive"}
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
            Vehículo *
          </label>
          <Select
            options={[{ value: "", label: "Seleccionar vehículo..." }, ...vehicleOptions]}
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 mb-1.5">
              <Calendar className="h-4 w-4" />
              Fecha *
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={today}
              disabled={loading}
              required
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 mb-1.5">
              <Clock className="h-4 w-4" />
              Hora *
            </label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={loading}
              required
            />
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="text-sm font-medium text-neutral-700 mb-1.5 block">
            Duración
          </label>
          <Select
            options={DURATION_OPTIONS}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            disabled={loading}
          />
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
            placeholder="Instrucciones o comentarios..."
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
            {loading ? "Guardando..." : initialData ? "Guardar" : "Agendar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
