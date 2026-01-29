"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, DollarSign, TrendingUp, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui";
import { OpportunityForm } from "./OpportunityForm";
import { cn } from "@/lib/utils";

interface Opportunity {
  id: string;
  estimatedValue: number;
  probability: number;
  expectedCloseDate: string | null;
  status: string;
  notes: string | null;
  vehicle: {
    id: string;
    title: string;
  } | null;
}

interface LeadOpportunityListProps {
  leadId: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  OPEN: { bg: "bg-blue-50", text: "text-blue-700", icon: "text-blue-500" },
  WON: { bg: "bg-green-50", text: "text-green-700", icon: "text-green-500" },
  LOST: { bg: "bg-neutral-50", text: "text-neutral-600", icon: "text-neutral-400" },
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Abierta",
  WON: "Ganada",
  LOST: "Perdida",
};

export function LeadOpportunityList({ leadId }: LeadOpportunityListProps) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);

  const fetchOpportunities = useCallback(async () => {
    try {
      const res = await fetch(`/api/dealer/leads/${leadId}/opportunities`);
      if (res.ok) {
        const data = await res.json();
        setOpportunities(data.opportunities || []);
      }
    } catch (error) {
      console.error("Error fetching opportunities:", error);
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const handleDelete = async (opportunityId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta oportunidad?")) return;

    try {
      const res = await fetch(`/api/dealer/leads/${leadId}/opportunities/${opportunityId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchOpportunities();
      }
    } catch (error) {
      console.error("Error deleting opportunity:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-6 w-6 border-2 border-andino-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Opportunity Button */}
      {!showForm && !editingOpportunity && (
        <Button
          variant="outline"
          onClick={() => setShowForm(true)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Oportunidad
        </Button>
      )}

      {/* New Opportunity Form */}
      {showForm && (
        <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
          <OpportunityForm
            leadId={leadId}
            onSave={() => {
              setShowForm(false);
              fetchOpportunities();
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Edit Opportunity Form */}
      {editingOpportunity && (
        <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
          <OpportunityForm
            leadId={leadId}
            initialData={{
              id: editingOpportunity.id,
              estimatedValue: editingOpportunity.estimatedValue,
              probability: editingOpportunity.probability,
              expectedCloseDate: editingOpportunity.expectedCloseDate,
              status: editingOpportunity.status,
              notes: editingOpportunity.notes,
              vehicleId: editingOpportunity.vehicle?.id || null,
            }}
            onSave={() => {
              setEditingOpportunity(null);
              fetchOpportunities();
            }}
            onCancel={() => setEditingOpportunity(null)}
          />
        </div>
      )}

      {/* Opportunities List */}
      {opportunities.length > 0 && !showForm && !editingOpportunity && (
        <div className="space-y-3">
          {opportunities.map((opp) => {
            const colors = STATUS_COLORS[opp.status] || STATUS_COLORS.OPEN;
            const weightedValue = (opp.estimatedValue * opp.probability) / 100;

            return (
              <div
                key={opp.id}
                className={cn(
                  "p-4 rounded-lg border cursor-pointer transition-colors hover:border-andino-300",
                  colors.bg
                )}
                onClick={() => setEditingOpportunity(opp)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Status Badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", colors.bg, colors.text)}>
                        {opp.status === "WON" && <Trophy className="inline h-3 w-3 mr-1" />}
                        {STATUS_LABELS[opp.status]}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {opp.probability}% probabilidad
                      </span>
                    </div>

                    {/* Value */}
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className={cn("h-4 w-4", colors.icon)} />
                        <span className={cn("text-lg font-bold", colors.text)}>
                          ${opp.estimatedValue.toLocaleString("es-CL")}
                        </span>
                      </div>
                      {opp.status === "OPEN" && (
                        <div className="flex items-center gap-1 text-xs text-neutral-500">
                          <TrendingUp className="h-3 w-3" />
                          Ponderado: ${weightedValue.toLocaleString("es-CL", { maximumFractionDigits: 0 })}
                        </div>
                      )}
                    </div>

                    {/* Vehicle */}
                    {opp.vehicle && (
                      <p className="text-sm text-neutral-600 truncate">
                        {opp.vehicle.title}
                      </p>
                    )}

                    {/* Expected Close Date */}
                    {opp.expectedCloseDate && opp.status === "OPEN" && (
                      <p className="text-xs text-neutral-500 mt-1">
                        Cierre esperado: {new Date(opp.expectedCloseDate).toLocaleDateString("es-CL")}
                      </p>
                    )}

                    {/* Notes */}
                    {opp.notes && (
                      <p className="text-xs text-neutral-500 mt-2 line-clamp-2">
                        {opp.notes}
                      </p>
                    )}
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(opp.id);
                    }}
                    className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-white rounded transition-colors"
                    title="Eliminar oportunidad"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {opportunities.length === 0 && !showForm && (
        <div className="text-center py-8">
          <DollarSign className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
          <p className="text-sm text-neutral-500 mb-1">
            No hay oportunidades para este lead
          </p>
          <p className="text-xs text-neutral-400">
            Crea una oportunidad para hacer seguimiento del valor potencial de venta
          </p>
        </div>
      )}
    </div>
  );
}
