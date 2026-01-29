"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  X,
  Mail,
  Phone,
  Car,
  Clock,
  ExternalLink,
  AlertTriangle,
  DollarSign,
  Calendar,
} from "lucide-react";
import { Button, Input, Badge, Select } from "@/components/ui";
import { Lead } from "./LeadCard";
import { LeadAssignSelect } from "./LeadAssignSelect";
import { LeadActivityForm } from "./LeadActivityForm";
import { LeadActivityTimeline } from "./LeadActivityTimeline";
import { LeadTaskList } from "./LeadTaskList";
import { LeadOpportunityList } from "./LeadOpportunityList";
import { cn } from "@/lib/utils";

interface TeamMember {
  id: string;
  name: string | null;
}

interface Activity {
  id: string;
  type: string;
  content: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
  };
}

interface LeadDetailModalProps {
  lead: Lead;
  teamMembers: TeamMember[];
  onClose: () => void;
  onUpdate: (lead: Lead) => void;
}

const STATUS_OPTIONS = [
  { value: "NEW", label: "Nuevo" },
  { value: "CONTACTED", label: "Contactado" },
  { value: "QUALIFIED", label: "Calificado" },
  { value: "CONVERTED", label: "Convertido" },
  { value: "LOST", label: "Perdido" },
];

const STATUS_COLORS: Record<string, string> = {
  NEW: "info",
  CONTACTED: "warning",
  QUALIFIED: "warning",
  CONVERTED: "success",
  LOST: "default",
};

export function LeadDetailModal({
  lead,
  teamMembers,
  onClose,
  onUpdate,
}: LeadDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"details" | "activities" | "tasks" | "opportunities">("details");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [notes, setNotes] = useState(lead.notes || "");
  const [estimatedValue, setEstimatedValue] = useState(
    lead.estimatedValue?.toString() || ""
  );
  const [saving, setSaving] = useState(false);

  const fetchActivities = useCallback(async () => {
    setActivitiesLoading(true);
    try {
      const res = await fetch(`/api/dealer/leads/${lead.id}/activities`);
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setActivitiesLoading(false);
    }
  }, [lead.id]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/dealer/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const data = await res.json();
        onUpdate(data.lead);
        fetchActivities();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleAssign = async (userId: string | null) => {
    try {
      const res = await fetch(`/api/dealer/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedToId: userId }),
      });

      if (res.ok) {
        const data = await res.json();
        onUpdate(data.lead);
        fetchActivities();
      }
    } catch (error) {
      console.error("Error assigning lead:", error);
    }
  };

  const handleSaveDetails = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/dealer/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: notes || null,
          estimatedValue: estimatedValue ? parseInt(estimatedValue) : null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onUpdate(data.lead);
      }
    } catch (error) {
      console.error("Error saving details:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-neutral-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-neutral-900">{lead.name}</h2>
              {lead.isDuplicate && (
                <Badge variant="warning" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Duplicado
                </Badge>
              )}
            </div>
            <p className="text-sm text-neutral-500">
              Lead desde {new Date(lead.createdAt).toLocaleDateString("es-CL")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        {/* Contact Info Bar */}
        <div className="flex items-center gap-4 px-4 py-3 bg-neutral-50 border-b border-neutral-200 text-sm">
          <a
            href={`mailto:${lead.email}`}
            className="flex items-center gap-1.5 text-neutral-600 hover:text-andino-600 transition-colors"
          >
            <Mail className="h-4 w-4" />
            {lead.email}
          </a>
          {lead.phone && (
            <a
              href={`tel:${lead.phone}`}
              className="flex items-center gap-1.5 text-neutral-600 hover:text-andino-600 transition-colors"
            >
              <Phone className="h-4 w-4" />
              {lead.phone}
            </a>
          )}
          {lead.vehicle && (
            <Link
              href={`/vehiculos/${lead.vehicle.slug}`}
              target="_blank"
              className="flex items-center gap-1.5 text-andino-600 hover:text-andino-700 transition-colors"
            >
              <Car className="h-4 w-4" />
              {lead.vehicle.title}
              <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>

        {/* Status and Assignment */}
        <div className="grid grid-cols-2 gap-4 px-4 py-3 border-b border-neutral-200">
          <div>
            <label className="text-xs font-medium text-neutral-500 mb-1.5 block">
              Estado
            </label>
            <Select
              options={STATUS_OPTIONS}
              value={lead.status}
              onChange={(e) => handleStatusChange(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-500 mb-1.5 block">
              Asignado a
            </label>
            <LeadAssignSelect
              currentAssignee={lead.assignedTo}
              teamMembers={teamMembers}
              onAssign={handleAssign}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-200 overflow-x-auto">
          {[
            { value: "details", label: "Detalles" },
            { value: "activities", label: "Actividad" },
            { value: "tasks", label: "Tareas" },
            { value: "opportunities", label: "Oportunidades" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as typeof activeTab)}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors",
                activeTab === tab.value
                  ? "text-andino-600 border-b-2 border-andino-600"
                  : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "details" && (
            <div className="space-y-4">
              {/* Message */}
              <div>
                <label className="text-xs font-medium text-neutral-500 mb-1.5 block">
                  Mensaje Original
                </label>
                <p className="text-sm text-neutral-700 bg-neutral-50 rounded-lg p-3 border border-neutral-100 whitespace-pre-line">
                  {lead.message}
                </p>
              </div>

              {/* Estimated Value */}
              <div>
                <label className="text-xs font-medium text-neutral-500 mb-1.5 block">
                  Valor Estimado
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    type="number"
                    placeholder="0"
                    value={estimatedValue}
                    onChange={(e) => setEstimatedValue(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-medium text-neutral-500 mb-1.5 block">
                  Notas Internas
                </label>
                <textarea
                  rows={3}
                  placeholder="Agregar notas..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-neutral-900 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-andino-500 focus:border-andino-500 placeholder:text-neutral-400"
                />
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSaveDetails}
                disabled={saving}
                variant="outline"
                className="w-full"
              >
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-200 text-xs text-neutral-500">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Creado:{" "}
                  {new Date(lead.createdAt).toLocaleString("es-CL")}
                </div>
                {lead.lastContactAt && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    Último contacto:{" "}
                    {new Date(lead.lastContactAt).toLocaleString("es-CL")}
                  </div>
                )}
                {lead.nextFollowUp && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Próximo seguimiento:{" "}
                    {new Date(lead.nextFollowUp).toLocaleString("es-CL")}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "activities" && (
            <div className="space-y-4">
              {/* Add Activity */}
              <LeadActivityForm
                leadId={lead.id}
                onActivityAdded={fetchActivities}
              />

              {/* Activity Timeline */}
              <div className="pt-4 border-t border-neutral-200">
                <LeadActivityTimeline
                  activities={activities}
                  loading={activitiesLoading}
                />
              </div>
            </div>
          )}

          {activeTab === "tasks" && (
            <LeadTaskList
              leadId={lead.id}
              teamMembers={teamMembers}
            />
          )}

          {activeTab === "opportunities" && (
            <LeadOpportunityList leadId={lead.id} />
          )}
        </div>
      </div>
    </div>
  );
}
