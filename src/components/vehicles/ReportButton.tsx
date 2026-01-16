"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Flag, X } from "lucide-react";
import { Button } from "@/components/ui";

interface ReportButtonProps {
  vehicleId: string;
}

const reportReasons = [
  { value: "FRAUD", label: "Fraude / Estafa" },
  { value: "INAPPROPRIATE", label: "Contenido inapropiado" },
  { value: "DUPLICATE", label: "Publicación duplicada" },
  { value: "WRONG_INFO", label: "Información incorrecta" },
  { value: "SOLD", label: "Ya fue vendido" },
  { value: "OTHER", label: "Otro motivo" },
];

export function ReportButton({ vehicleId }: ReportButtonProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      setError("Selecciona una razón");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/reportes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId,
          reason,
          description: description || undefined,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(false);
          setReason("");
          setDescription("");
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.error || "Error al enviar el reporte");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Error al enviar el reporte");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    if (!session) {
      // Redirect to login
      window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    setIsOpen(true);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 text-sm text-neutral-500 hover:text-red-600 transition-colors"
      >
        <Flag className="h-4 w-4" />
        Reportar
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <h2 className="text-lg font-semibold text-neutral-900">
                Reportar publicación
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {success ? (
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Flag className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-lg font-medium text-neutral-900">
                  Reporte enviado
                </p>
                <p className="text-neutral-600 mt-1">
                  Gracias por ayudarnos a mantener la plataforma segura
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    ¿Por qué reportas esta publicación?
                  </label>
                  <div className="space-y-2">
                    {reportReasons.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors"
                      >
                        <input
                          type="radio"
                          name="reason"
                          value={option.value}
                          checked={reason === option.value}
                          onChange={(e) => setReason(e.target.value)}
                          className="w-4 h-4 text-andino-600 focus:ring-andino-500"
                        />
                        <span className="text-sm text-neutral-700">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Descripción adicional (opcional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    maxLength={1000}
                    placeholder="Cuéntanos más detalles..."
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-andino-500 focus:border-andino-500"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                    {error}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !reason}
                    className="flex-1"
                  >
                    {loading ? "Enviando..." : "Enviar reporte"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
