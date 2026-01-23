"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  Mail,
  Phone,
  Clock,
  RefreshCw,
  Car,
} from "lucide-react";
import { Button } from "@/components/ui";

interface DealerLead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  source: string;
  status: string;
  readAt: string | null;
  respondedAt: string | null;
  createdAt: string;
  vehicle: { title: string; slug: string } | null;
}

export default function DealerLeadsPage() {
  const [leads, setLeads] = useState<DealerLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dealer/microsite/leads");
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (leadId: string) => {
    try {
      const res = await fetch(`/api/dealer/microsite/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CONTACTED" }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) =>
            l.id === leadId
              ? { ...l, status: "CONTACTED", readAt: new Date().toISOString() }
              : l
          )
        );
      }
    } catch {
      // silent
    }
  };

  const newCount = leads.filter((l) => l.status === "NEW").length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Leads
            {newCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-[1.25rem] px-1.5">
                {newCount}
              </span>
            )}
          </h1>
          <p className="text-neutral-600 text-sm mt-1">
            Consultas recibidas desde el formulario de contacto de tu micrositio.
          </p>
        </div>
        <Button onClick={fetchLeads} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-2 border-andino-600 border-t-transparent rounded-full" />
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <MessageSquare className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Sin consultas</h3>
          <p className="text-sm text-neutral-500 max-w-md mx-auto">
            Cuando un visitante complete el formulario de contacto en tu micrositio, las consultas aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className={`bg-white rounded-xl border p-5 ${
                lead.status === "NEW"
                  ? "border-blue-200 bg-blue-50/50"
                  : "border-neutral-200"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <p className="font-semibold text-neutral-900">{lead.name}</p>
                    {lead.status === "NEW" && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        Nuevo
                      </span>
                    )}
                    {lead.status === "CONTACTED" && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        Leído
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 mb-3">
                    <a
                      href={`mailto:${lead.email}`}
                      className="flex items-center gap-1.5 hover:text-andino-600 transition-colors"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {lead.email}
                    </a>
                    {lead.phone && (
                      <a
                        href={`tel:${lead.phone}`}
                        className="flex items-center gap-1.5 hover:text-andino-600 transition-colors"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {lead.phone}
                      </a>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(lead.createdAt).toLocaleDateString("es-CL", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {lead.vehicle && (
                    <p className="text-sm text-andino-600 mb-2 flex items-center gap-1.5">
                      <Car className="h-3.5 w-3.5" />
                      {lead.vehicle.title}
                    </p>
                  )}
                  <p className="text-sm text-neutral-700 whitespace-pre-line bg-neutral-50 rounded-lg p-3 border border-neutral-100">
                    {lead.message}
                  </p>
                </div>
                {lead.status === "NEW" && (
                  <button
                    onClick={() => handleMarkRead(lead.id)}
                    className="text-xs px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors shrink-0 font-medium"
                  >
                    Marcar leído
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
