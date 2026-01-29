"use client";

import { useState } from "react";
import { X, Calendar, Flag } from "lucide-react";
import { Button, Input, Select } from "@/components/ui";

interface TeamMember {
  id: string;
  name: string | null;
}

interface LeadTaskFormProps {
  leadId: string;
  teamMembers: TeamMember[];
  onTaskCreated: () => void;
  onCancel: () => void;
}

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Baja" },
  { value: "MEDIUM", label: "Media" },
  { value: "HIGH", label: "Alta" },
];

export function LeadTaskForm({
  leadId,
  teamMembers,
  onTaskCreated,
  onCancel,
}: LeadTaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedToId, setAssignedToId] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("El título es requerido");
      return;
    }

    if (!assignedToId) {
      setError("Debes asignar la tarea a alguien");
      return;
    }

    if (!dueAt) {
      setError("La fecha de vencimiento es requerida");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/dealer/leads/${leadId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          assignedToId,
          dueAt: new Date(dueAt).toISOString(),
          priority,
        }),
      });

      if (res.ok) {
        onTaskCreated();
      } else {
        const data = await res.json();
        setError(data.error || "Error al crear tarea");
      }
    } catch {
      setError("Error al crear tarea");
    } finally {
      setLoading(false);
    }
  };

  const assigneeOptions = teamMembers.map((m) => ({
    value: m.id,
    label: m.name || "Sin nombre",
  }));

  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-neutral-900">Nueva Tarea</h4>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 hover:bg-neutral-200 rounded transition-colors"
        >
          <X className="h-4 w-4 text-neutral-500" />
        </button>
      </div>

      <div className="space-y-3">
        {/* Title */}
        <div>
          <Input
            placeholder="Título de la tarea *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Description */}
        <div>
          <textarea
            placeholder="Descripción (opcional)"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 text-sm text-neutral-900 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-andino-500 focus:border-andino-500 placeholder:text-neutral-400"
          />
        </div>

        {/* Assignee and Due Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-neutral-500 mb-1 block">Asignar a *</label>
            <Select
              options={[{ value: "", label: "Seleccionar..." }, ...assigneeOptions]}
              value={assignedToId}
              onChange={(e) => setAssignedToId(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-xs text-neutral-500 mb-1 block">Vencimiento *</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
              <Input
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                min={today}
                disabled={loading}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="text-xs text-neutral-500 mb-1 block">Prioridad</label>
          <div className="flex gap-2">
            {PRIORITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPriority(opt.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  priority === opt.value
                    ? opt.value === "HIGH"
                      ? "bg-red-100 text-red-700"
                      : opt.value === "MEDIUM"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-neutral-100 text-neutral-700"
                    : "text-neutral-500 hover:bg-neutral-100"
                }`}
              >
                <Flag className="h-3 w-3" />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creando..." : "Crear Tarea"}
          </Button>
        </div>
      </div>
    </form>
  );
}
