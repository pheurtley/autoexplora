"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Plus, DollarSign, TrendingUp, Trophy } from "lucide-react";
import { Button, Select } from "@/components/ui";
import { OpportunityCard } from "@/components/dealer/OpportunityCard";
import { OpportunityForm } from "@/components/dealer/OpportunityForm";

interface Opportunity {
  id: string;
  estimatedValue: number;
  probability: number;
  expectedCloseDate: string | null;
  status: string;
  notes: string | null;
  lead: {
    id: string;
    name: string;
  };
  vehicle: {
    id: string;
    title: string;
    slug: string;
  } | null;
}

export default function DealerOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      const res = await fetch(`/api/dealer/opportunities?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOpportunities(data.opportunities || []);
      }
    } catch (error) {
      console.error("Error fetching opportunities:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  // Calculate stats
  const openOpportunities = opportunities.filter((o) => o.status === "OPEN");
  const totalPipelineValue = openOpportunities.reduce(
    (sum, o) => sum + o.estimatedValue,
    0
  );
  const weightedPipelineValue = openOpportunities.reduce(
    (sum, o) => sum + (o.estimatedValue * o.probability) / 100,
    0
  );
  const wonThisMonth = opportunities.filter((o) => {
    if (o.status !== "WON") return false;
    // TODO: Add date filter
    return true;
  });
  const wonValue = wonThisMonth.reduce((sum, o) => sum + o.estimatedValue, 0);

  const statusOptions = [
    { value: "all", label: "Todas" },
    { value: "OPEN", label: "Abiertas" },
    { value: "WON", label: "Ganadas" },
    { value: "LOST", label: "Perdidas" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Oportunidades</h1>
          <p className="text-neutral-600 text-sm mt-1">
            Gestiona el pipeline de ventas de tus leads.
          </p>
        </div>
        <Button onClick={fetchOpportunities} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Pipeline Total</p>
              <p className="text-xl font-bold text-neutral-900">
                ${totalPipelineValue.toLocaleString("es-CL")}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Pipeline Ponderado</p>
              <p className="text-xl font-bold text-neutral-900">
                ${weightedPipelineValue.toLocaleString("es-CL", { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Ventas Cerradas</p>
              <p className="text-xl font-bold text-green-600">
                ${wonValue.toLocaleString("es-CL")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-40"
        />
        <span className="text-sm text-neutral-500">
          {opportunities.length} oportunidades
        </span>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-2 border-andino-600 border-t-transparent rounded-full" />
        </div>
      ) : opportunities.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <DollarSign className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            Sin oportunidades
          </h3>
          <p className="text-sm text-neutral-500 max-w-md mx-auto">
            Crea oportunidades desde los leads para hacer seguimiento de ventas potenciales.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {opportunities.map((opportunity) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              onEdit={() => setEditingOpportunity(opportunity)}
            />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingOpportunity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setEditingOpportunity(null)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-4">
              <OpportunityForm
                leadId={editingOpportunity.lead.id}
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
          </div>
        </div>
      )}
    </div>
  );
}
