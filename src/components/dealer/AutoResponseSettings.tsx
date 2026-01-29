"use client";

import { useState, useEffect, useCallback } from "react";
import { Zap, Mail, Clock, Save, Info } from "lucide-react";
import { Button, Input, Select } from "@/components/ui";
import { cn } from "@/lib/utils";

interface Template {
  id: string;
  name: string;
  channel: string;
}

interface AutoResponseConfig {
  enabled: boolean;
  emailTemplateId: string | null;
  whatsappMessage: string | null;
  delayMinutes: number;
}

export function AutoResponseSettings() {
  const [config, setConfig] = useState<AutoResponseConfig>({
    enabled: false,
    emailTemplateId: null,
    whatsappMessage: null,
    delayMinutes: 0,
  });
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [configRes, templatesRes] = await Promise.all([
        fetch("/api/dealer/auto-response"),
        fetch("/api/dealer/templates"),
      ]);

      if (configRes.ok) {
        const data = await configRes.json();
        if (data.config) {
          setConfig(data.config);
        }
      }

      if (templatesRes.ok) {
        const data = await templatesRes.json();
        setTemplates(
          (data.templates || []).filter(
            (t: Template) => t.channel === "EMAIL"
          )
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/dealer/auto-response", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Error saving config:", error);
    } finally {
      setSaving(false);
    }
  };

  const templateOptions = [
    { value: "", label: "Seleccionar plantilla..." },
    ...templates.map((t) => ({ value: t.id, label: t.name })),
  ];

  const delayOptions = [
    { value: "0", label: "Inmediato" },
    { value: "5", label: "5 minutos" },
    { value: "15", label: "15 minutos" },
    { value: "30", label: "30 minutos" },
    { value: "60", label: "1 hora" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-2 border-andino-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-andino-100 flex items-center justify-center">
          <Zap className="h-5 w-5 text-andino-600" />
        </div>
        <div>
          <h2 className="font-semibold text-neutral-900">Respuesta Automática</h2>
          <p className="text-sm text-neutral-500">
            Envía una respuesta automática cuando llega un nuevo lead
          </p>
        </div>
      </div>

      {/* Enable Toggle */}
      <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-200 mb-6">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-6 rounded-full relative cursor-pointer transition-colors",
              config.enabled ? "bg-andino-600" : "bg-neutral-300"
            )}
            onClick={() => setConfig({ ...config, enabled: !config.enabled })}
          >
            <div
              className={cn(
                "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform",
                config.enabled ? "translate-x-5" : "translate-x-1"
              )}
            />
          </div>
          <span className="font-medium text-neutral-900">
            {config.enabled ? "Habilitado" : "Deshabilitado"}
          </span>
        </div>
      </div>

      {config.enabled && (
        <div className="space-y-6">
          {/* Info Box */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">¿Cómo funciona?</p>
              <p>
                Cuando un visitante envíe una consulta desde tu micrositio, se
                enviará automáticamente un email de respuesta usando la
                plantilla seleccionada.
              </p>
            </div>
          </div>

          {/* Email Template */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2">
              <Mail className="h-4 w-4" />
              Plantilla de Email
            </label>
            {templates.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                No tienes plantillas de email. Crea una primero en la sección de
                plantillas.
              </div>
            ) : (
              <Select
                options={templateOptions}
                value={config.emailTemplateId || ""}
                onChange={(e) =>
                  setConfig({ ...config, emailTemplateId: e.target.value || null })
                }
              />
            )}
          </div>

          {/* Delay */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-2">
              <Clock className="h-4 w-4" />
              Retraso antes de enviar
            </label>
            <Select
              options={delayOptions}
              value={config.delayMinutes.toString()}
              onChange={(e) =>
                setConfig({ ...config, delayMinutes: parseInt(e.target.value) })
              }
            />
            <p className="text-xs text-neutral-500 mt-1">
              Si respondes manualmente antes de este tiempo, no se enviará la
              respuesta automática.
            </p>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-neutral-200">
        {saved && (
          <span className="text-sm text-green-600">Cambios guardados</span>
        )}
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Guardando..." : "Guardar Configuración"}
        </Button>
      </div>
    </div>
  );
}
