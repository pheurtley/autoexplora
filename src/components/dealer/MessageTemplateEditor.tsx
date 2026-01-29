"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Mail,
  MessageCircle,
  Eye,
  X,
  Save,
  Info,
} from "lucide-react";
import { Button, Input, Select } from "@/components/ui";
import {
  TEMPLATE_VARIABLES,
  getTemplatePreview,
} from "@/lib/template-interpolation";
import { cn } from "@/lib/utils";

interface Template {
  id: string;
  name: string;
  channel: string;
  subject: string | null;
  content: string;
  variables: string[];
  isActive: boolean;
}

const CHANNEL_OPTIONS = [
  { value: "EMAIL", label: "Email" },
  { value: "WHATSAPP", label: "WhatsApp" },
];

export function MessageTemplateEditor() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [channel, setChannel] = useState("EMAIL");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/dealer/templates");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const resetForm = () => {
    setName("");
    setChannel("EMAIL");
    setSubject("");
    setContent("");
    setEditingTemplate(null);
    setShowForm(false);
    setShowPreview(false);
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setName(template.name);
    setChannel(template.channel);
    setSubject(template.subject || "");
    setContent(template.content);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !content.trim()) return;

    setSaving(true);
    try {
      const url = editingTemplate
        ? `/api/dealer/templates/${editingTemplate.id}`
        : "/api/dealer/templates";

      const res = await fetch(url, {
        method: editingTemplate ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          channel,
          subject: channel === "EMAIL" ? subject.trim() : null,
          content: content.trim(),
        }),
      });

      if (res.ok) {
        resetForm();
        fetchTemplates();
      }
    } catch (error) {
      console.error("Error saving template:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta plantilla?")) return;

    try {
      const res = await fetch(`/api/dealer/templates/${templateId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchTemplates();
      }
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  const handleToggleActive = async (template: Template) => {
    try {
      const res = await fetch(`/api/dealer/templates/${template.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !template.isActive }),
      });

      if (res.ok) {
        fetchTemplates();
      }
    } catch (error) {
      console.error("Error toggling template:", error);
    }
  };

  const insertVariable = (variable: string) => {
    setContent((prev) => prev + `{${variable}}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-2 border-andino-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">
            Plantillas de Mensajes
          </h2>
          <p className="text-sm text-neutral-500">
            Crea plantillas para respuestas rápidas
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Plantilla
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-neutral-900">
              {editingTemplate ? "Editar Plantilla" : "Nueva Plantilla"}
            </h3>
            <button
              onClick={resetForm}
              className="p-1 hover:bg-neutral-200 rounded transition-colors"
            >
              <X className="h-4 w-4 text-neutral-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1.5 block">
                  Nombre de la plantilla
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Agradecimiento inicial"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1.5 block">
                  Canal
                </label>
                <Select
                  options={CHANNEL_OPTIONS}
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                />
              </div>
            </div>

            {channel === "EMAIL" && (
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1.5 block">
                  Asunto del email
                </label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ej: Gracias por tu consulta, {nombre}"
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-neutral-700">
                  Contenido
                </label>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-xs text-andino-600 hover:text-andino-700 flex items-center gap-1"
                >
                  <Eye className="h-3 w-3" />
                  {showPreview ? "Ocultar preview" : "Ver preview"}
                </button>
              </div>
              <textarea
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Hola {nombre}, gracias por tu interés en {vehiculo}..."
                className="w-full px-3 py-2 text-sm text-neutral-900 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-andino-500 focus:border-andino-500 placeholder:text-neutral-400"
                required
              />
            </div>

            {/* Variables Help */}
            <div className="bg-white rounded-lg border border-neutral-200 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-neutral-700 mb-3">
                <Info className="h-4 w-4" />
                Variables disponibles
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(TEMPLATE_VARIABLES).map(([key, description]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => insertVariable(key)}
                    className="px-2 py-1 text-xs bg-neutral-100 hover:bg-neutral-200 rounded transition-colors"
                    title={description}
                  >
                    {`{${key}}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            {showPreview && content && (
              <div className="bg-white rounded-lg border border-neutral-200 p-4">
                <p className="text-xs font-medium text-neutral-500 mb-2">
                  Vista previa
                </p>
                {channel === "EMAIL" && subject && (
                  <p className="text-sm font-medium text-neutral-900 mb-2">
                    Asunto: {getTemplatePreview(subject)}
                  </p>
                )}
                <p className="text-sm text-neutral-700 whitespace-pre-line">
                  {getTemplatePreview(content)}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Templates List */}
      {templates.length === 0 && !showForm ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <Mail className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            Sin plantillas
          </h3>
          <p className="text-sm text-neutral-500 max-w-md mx-auto mb-4">
            Crea plantillas para responder rápidamente a los leads.
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Crear primera plantilla
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className={cn(
                "bg-white rounded-lg border p-4",
                template.isActive ? "border-neutral-200" : "border-neutral-100 bg-neutral-50"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {template.channel === "EMAIL" ? (
                      <Mail className="h-4 w-4 text-blue-500" />
                    ) : (
                      <MessageCircle className="h-4 w-4 text-green-500" />
                    )}
                    <p className="font-medium text-neutral-900">{template.name}</p>
                    {!template.isActive && (
                      <span className="text-xs bg-neutral-200 text-neutral-600 px-2 py-0.5 rounded">
                        Inactiva
                      </span>
                    )}
                  </div>
                  {template.subject && (
                    <p className="text-sm text-neutral-600 mb-1">
                      Asunto: {template.subject}
                    </p>
                  )}
                  <p className="text-sm text-neutral-500 line-clamp-2">
                    {template.content}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleActive(template)}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      template.isActive
                        ? "text-green-600 hover:bg-green-50"
                        : "text-neutral-400 hover:bg-neutral-100"
                    )}
                    title={template.isActive ? "Desactivar" : "Activar"}
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full border-2",
                        template.isActive
                          ? "bg-green-500 border-green-500"
                          : "border-neutral-300"
                      )}
                    />
                  </button>
                  <button
                    onClick={() => handleEdit(template)}
                    className="p-2 text-neutral-500 hover:text-andino-600 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
