"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  Save,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  HelpCircle,
} from "lucide-react";
import {
  DEFAULT_FAQ_TEMPLATES,
  FAQ_VARIABLES,
  type FaqPageType,
} from "@/lib/faq-defaults";

interface FaqTemplate {
  id: string;
  pageType: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
}

const PAGE_TYPES: { key: FaqPageType; label: string }[] = [
  { key: "brand", label: "Marcas" },
  { key: "model", label: "Modelos" },
  { key: "region", label: "Regiones" },
];

export function FaqTemplateManager() {
  const [activeTab, setActiveTab] = useState<FaqPageType>("brand");
  const [templates, setTemplates] = useState<FaqTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showVariables, setShowVariables] = useState(false);

  // New template form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/faq-templates?pageType=${activeTab}`
      );
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error("Error fetching FAQ templates:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleAdd = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    setSaving(true);
    try {
      const response = await fetch("/api/admin/faq-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageType: activeTab,
          question: newQuestion.trim(),
          answer: newAnswer.trim(),
          order: templates.length,
        }),
      });

      if (response.ok) {
        setNewQuestion("");
        setNewAnswer("");
        setShowAddForm(false);
        await fetchTemplates();
      }
    } catch (error) {
      console.error("Error adding FAQ template:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editQuestion.trim() || !editAnswer.trim()) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/faq-templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: editQuestion.trim(),
          answer: editAnswer.trim(),
        }),
      });

      if (response.ok) {
        setEditingId(null);
        await fetchTemplates();
      }
    } catch (error) {
      console.error("Error updating FAQ template:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/faq-templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        await fetchTemplates();
      }
    } catch (error) {
      console.error("Error toggling FAQ template:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta plantilla FAQ?")) return;

    try {
      const response = await fetch(`/api/admin/faq-templates/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchTemplates();
      }
    } catch (error) {
      console.error("Error deleting FAQ template:", error);
    }
  };

  const handleResetDefaults = async () => {
    if (
      !confirm(
        "¿Eliminar todas las plantillas personalizadas y restablecer los valores por defecto? Las plantillas por defecto se usarán automáticamente."
      )
    )
      return;

    setSaving(true);
    try {
      // Delete all templates for this page type
      for (const template of templates) {
        await fetch(`/api/admin/faq-templates/${template.id}`, {
          method: "DELETE",
        });
      }
      await fetchTemplates();
    } catch (error) {
      console.error("Error resetting FAQ templates:", error);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (template: FaqTemplate) => {
    setEditingId(template.id);
    setEditQuestion(template.question);
    setEditAnswer(template.answer);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditQuestion("");
    setEditAnswer("");
  };

  const variables = FAQ_VARIABLES[activeTab];
  const defaults = DEFAULT_FAQ_TEMPLATES[activeTab];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-neutral-100 p-1 rounded-lg w-fit">
        {PAGE_TYPES.map((type) => (
          <button
            key={type.key}
            onClick={() => {
              setActiveTab(type.key);
              setShowAddForm(false);
              setEditingId(null);
            }}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === type.key
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Variables help */}
      <div>
        <button
          onClick={() => setShowVariables(!showVariables)}
          className="flex items-center gap-2 text-sm text-andino-600 hover:text-andino-700"
        >
          <HelpCircle className="h-4 w-4" />
          Variables disponibles
          {showVariables ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </button>
        {showVariables && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700 mb-2">
              Usa estas variables en las preguntas y respuestas. Se reemplazarán
              automáticamente con los valores reales:
            </p>
            <div className="flex flex-wrap gap-2">
              {variables.map((v) => (
                <span
                  key={v.key}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded text-xs"
                >
                  <code className="text-blue-700 font-mono">{v.key}</code>
                  <span className="text-neutral-500">= {v.label}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Templates list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-andino-600" />
        </div>
      ) : templates.length === 0 ? (
        <div className="border border-dashed border-neutral-300 rounded-lg p-6 text-center">
          <p className="text-sm text-neutral-500 mb-2">
            No hay plantillas personalizadas. Se usan los valores por defecto:
          </p>
          <div className="text-left space-y-2 max-w-xl mx-auto">
            {defaults.map((d, i) => (
              <div key={i} className="p-2 bg-neutral-50 rounded text-xs">
                <p className="font-medium text-neutral-700">{d.question}</p>
                <p className="text-neutral-500 mt-1">{d.answer}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`border rounded-lg p-4 ${
                template.isActive
                  ? "border-neutral-200 bg-white"
                  : "border-neutral-200 bg-neutral-50 opacity-60"
              }`}
            >
              {editingId === template.id ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">
                      Pregunta
                    </label>
                    <textarea
                      value={editQuestion}
                      onChange={(e) => setEditQuestion(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-andino-500 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">
                      Respuesta
                    </label>
                    <textarea
                      value={editAnswer}
                      onChange={(e) => setEditAnswer(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-andino-500 resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(template.id)}
                      disabled={saving}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-andino-600 text-white text-sm rounded-lg hover:bg-andino-700 disabled:opacity-50"
                    >
                      <Save className="h-3 w-3" />
                      Guardar
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1.5 text-sm text-neutral-600 hover:text-neutral-900"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => startEdit(template)}
                    >
                      <p className="font-medium text-sm text-neutral-900">
                        {template.question}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                        {template.answer}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() =>
                          handleToggleActive(template.id, template.isActive)
                        }
                        className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded"
                        title={
                          template.isActive ? "Desactivar" : "Activar"
                        }
                      >
                        {template.isActive ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 rounded"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      {showAddForm ? (
        <div className="border border-andino-200 bg-andino-50/30 rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Pregunta
            </label>
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              rows={2}
              placeholder="¿Pregunta con {variables}?"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-andino-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Respuesta
            </label>
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              rows={3}
              placeholder="Respuesta con {variables}..."
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-andino-500 resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={saving || !newQuestion.trim() || !newAnswer.trim()}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-andino-600 text-white text-sm rounded-lg hover:bg-andino-700 disabled:opacity-50"
            >
              <Save className="h-3 w-3" />
              Agregar
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewQuestion("");
                setNewAnswer("");
              }}
              className="px-3 py-1.5 text-sm text-neutral-600 hover:text-neutral-900"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 border border-neutral-300 text-sm text-neutral-700 rounded-lg hover:bg-neutral-50"
          >
            <Plus className="h-4 w-4" />
            Agregar plantilla
          </button>
          {templates.length > 0 && (
            <button
              onClick={handleResetDefaults}
              disabled={saving}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-neutral-300 text-sm text-neutral-500 rounded-lg hover:bg-neutral-50 disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              Restablecer valores por defecto
            </button>
          )}
        </div>
      )}
    </div>
  );
}
