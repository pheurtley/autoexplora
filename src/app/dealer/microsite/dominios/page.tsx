"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Globe,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui";

interface DealerDomain {
  id: string;
  domain: string;
  isCustom: boolean;
  isPrimary: boolean;
  status: "PENDING" | "VERIFIED" | "FAILED";
  verifiedAt: string | null;
  lastCheckedAt: string | null;
}

const CNAME_TARGET = "autoexplora.cl";

export default function DealerDomainsPage() {
  const [domains, setDomains] = useState<DealerDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState("");
  const [adding, setAdding] = useState(false);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [verifyError, setVerifyError] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const fetchDomains = () => {
    fetch("/api/dealer/microsite")
      .then((res) => res.json())
      .then((data) => {
        if (data.config?.domains) {
          setDomains(data.config.domains);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    setAdding(true);
    setError("");

    try {
      const res = await fetch("/api/dealer/microsite/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: newDomain.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al agregar");
      }

      setNewDomain("");
      fetchDomains();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al agregar dominio");
    } finally {
      setAdding(false);
    }
  };

  const handleVerify = async (domainId: string) => {
    setVerifying(domainId);
    setVerifyError((prev) => ({ ...prev, [domainId]: "" }));

    try {
      const res = await fetch(
        `/api/dealer/microsite/domains/${domainId}/verify`,
        { method: "POST" }
      );

      const data = await res.json();

      if (!data.verified && data.error) {
        setVerifyError((prev) => ({ ...prev, [domainId]: data.error }));
      }

      fetchDomains();
    } catch {
      setVerifyError((prev) => ({
        ...prev,
        [domainId]: "Error al verificar",
      }));
    } finally {
      setVerifying(null);
    }
  };

  const handleDelete = async (domain: DealerDomain) => {
    if (!confirm(`¿Eliminar el dominio "${domain.domain}"?`)) return;

    try {
      const res = await fetch(`/api/dealer/microsite/domains/${domain.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar");
      }
      fetchDomains();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(CNAME_TARGET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "FAILED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-amber-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return "Verificado";
      case "FAILED":
        return "Falló";
      default:
        return "Pendiente";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-andino-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/dealer/microsite"
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-neutral-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Dominios Personalizados
          </h1>
          <p className="text-neutral-600 text-sm mt-0.5">
            Conecta tu propio dominio a tu micrositio
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <h3 className="font-medium text-blue-900 text-sm mb-2">
          Instrucciones para conectar tu dominio
        </h3>
        <ol className="text-sm text-blue-800 space-y-1.5 list-decimal list-inside">
          <li>Agrega tu dominio en el formulario de abajo</li>
          <li>
            En tu proveedor DNS, crea un registro <strong>CNAME</strong> que
            apunte a:
          </li>
        </ol>
        <div className="mt-2 flex items-center gap-2 bg-white rounded-lg border border-blue-200 px-3 py-2">
          <code className="text-sm font-mono text-blue-900 flex-1">
            {CNAME_TARGET}
          </code>
          <button
            onClick={copyToClipboard}
            className="p-1 hover:bg-blue-50 rounded text-blue-600"
            title="Copiar"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
        <ol className="text-sm text-blue-800 space-y-1.5 list-decimal list-inside mt-2" start={3}>
          <li>Espera a que el DNS propague (puede tardar hasta 48 horas)</li>
          <li>Haz clic en &quot;Verificar&quot; para comprobar la configuración</li>
        </ol>
      </div>

      {/* Add Domain Form */}
      <form onSubmit={handleAdd} className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="tudominio.cl"
              className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-andino-500 focus:outline-none focus:ring-2 focus:ring-andino-500/20"
            />
          </div>
          <Button type="submit" disabled={adding || !newDomain.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            {adding ? "Agregando..." : "Agregar"}
          </Button>
        </div>
        {error && (
          <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
      </form>

      {/* Domains List */}
      {domains.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <Globe className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            Sin dominios personalizados
          </h3>
          <p className="text-neutral-500 text-sm">
            Agrega tu propio dominio para que tu sitio sea accesible desde él.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100">
          {domains.map((domain) => (
            <div key={domain.id} className="p-4">
              <div className="flex items-center gap-4">
                <Globe className="h-5 w-5 text-neutral-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-900 text-sm">
                    {domain.domain}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {getStatusIcon(domain.status)}
                    <span className="text-xs text-neutral-500">
                      {getStatusLabel(domain.status)}
                    </span>
                    {domain.lastCheckedAt && (
                      <span className="text-xs text-neutral-400">
                        · Última verificación:{" "}
                        {new Date(domain.lastCheckedAt).toLocaleDateString(
                          "es-CL"
                        )}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVerify(domain.id)}
                    disabled={verifying === domain.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${
                        verifying === domain.id ? "animate-spin" : ""
                      }`}
                    />
                    Verificar
                  </button>
                  <button
                    onClick={() => handleDelete(domain)}
                    className="p-1.5 hover:bg-red-50 rounded text-neutral-400 hover:text-red-600 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {verifyError[domain.id] && (
                <div className="mt-2 flex items-start gap-2 text-xs text-red-600 bg-red-50 rounded-lg p-2">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  {verifyError[domain.id]}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
