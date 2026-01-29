"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { RefreshCw, Plus, Search, Filter } from "lucide-react";
import { Button, Input, Select } from "@/components/ui";
import { LeadColumn } from "./LeadColumn";
import { Lead, LeadCardOverlay } from "./LeadCard";
import { LeadDetailModal } from "./LeadDetailModal";

interface TeamMember {
  id: string;
  name: string | null;
}

const LEAD_STATUSES = [
  { value: "NEW", label: "Nuevo", color: "blue" },
  { value: "CONTACTED", label: "Contactado", color: "purple" },
  { value: "QUALIFIED", label: "Calificado", color: "amber" },
  { value: "CONVERTED", label: "Convertido", color: "green" },
  { value: "LOST", label: "Perdido", color: "neutral" },
] as const;

export function LeadKanban() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [assignedFilter, setAssignedFilter] = useState<string>("all");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (assignedFilter && assignedFilter !== "all") {
        params.append("assignedTo", assignedFilter);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const res = await fetch(`/api/dealer/leads?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  }, [assignedFilter, searchQuery]);

  const fetchTeamMembers = useCallback(async () => {
    try {
      const res = await fetch("/api/dealer/team-members");
      if (res.ok) {
        const data = await res.json();
        setTeamMembers(data.members || []);
      }
    } catch (error) {
      console.error("Error fetching team:", error);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
    fetchTeamMembers();
  }, [fetchLeads, fetchTeamMembers]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchLeads]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const leadId = active.id as string;
    const newStatus = over.id as string;

    // Find the lead
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.status === newStatus) return;

    // Optimistic update
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );

    // API call
    try {
      const res = await fetch(`/api/dealer/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        // Revert on error
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status: lead.status } : l))
        );
      }
    } catch {
      // Revert on error
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: lead.status } : l))
      );
    }
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
  };

  const handleLeadUpdate = (updatedLead: Lead) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === updatedLead.id ? updatedLead : l))
    );
    setSelectedLead(updatedLead);
  };

  const getLeadsByStatus = (status: string) => {
    return leads.filter((lead) => lead.status === status);
  };

  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null;

  const assignOptions = [
    { value: "all", label: "Todos" },
    { value: "me", label: "Mis leads" },
    { value: "unassigned", label: "Sin asignar" },
    ...teamMembers.map((m) => ({
      value: m.id,
      label: m.name || "Sin nombre",
    })),
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">CRM Leads</h1>
          <p className="text-neutral-600 text-sm mt-1">
            Gestiona tus leads con vista Kanban. Arrastra para cambiar estado.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchLeads} variant="outline" disabled={loading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Buscar leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-neutral-500" />
          <Select
            options={assignOptions}
            value={assignedFilter}
            onChange={(e) => setAssignedFilter(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-2 border-andino-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {LEAD_STATUSES.map((status) => (
              <LeadColumn
                key={status.value}
                id={status.value}
                title={status.label}
                color={`border-t-${status.color}-500`}
                leads={getLeadsByStatus(status.value)}
                onLeadClick={handleLeadClick}
              />
            ))}
          </div>

          <DragOverlay>
            {activeLead ? <LeadCardOverlay lead={activeLead} /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          teamMembers={teamMembers}
          onClose={() => setSelectedLead(null)}
          onUpdate={handleLeadUpdate}
        />
      )}
    </div>
  );
}
