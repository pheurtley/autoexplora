"use client";

import { useState } from "react";
import { Zap, ChevronDown, ChevronUp, Car, Calendar, MapPin, DollarSign, Info, ThumbsUp } from "lucide-react";

interface MessageTemplatesProps {
  onSelectTemplate: (message: string) => void;
  vehicleTitle?: string;
  disabled?: boolean;
}

interface Template {
  id: string;
  icon: typeof Car;
  label: string;
  message: string;
  category: "availability" | "scheduling" | "info" | "general";
}

const defaultTemplates: Template[] = [
  {
    id: "available",
    icon: ThumbsUp,
    label: "Disponible",
    message: "¡Hola! Sí, el vehículo está disponible. ¿Te gustaría agendar una visita para verlo?",
    category: "availability",
  },
  {
    id: "not_available",
    icon: Car,
    label: "No disponible",
    message: "Hola, lamentablemente este vehículo ya no está disponible. ¿Te puedo ayudar con algún otro vehículo de nuestro inventario?",
    category: "availability",
  },
  {
    id: "schedule_visit",
    icon: Calendar,
    label: "Agendar visita",
    message: "¡Perfecto! Estamos disponibles de lunes a sábado de 9:00 a 18:00 hrs. ¿Qué día y horario te acomoda para venir a ver el vehículo?",
    category: "scheduling",
  },
  {
    id: "location",
    icon: MapPin,
    label: "Ubicación",
    message: "Nos encontramos en nuestra sucursal. Te comparto la dirección exacta para que puedas llegar sin problemas. ¿Necesitas alguna referencia adicional?",
    category: "info",
  },
  {
    id: "price_negotiable",
    icon: DollarSign,
    label: "Precio negociable",
    message: "El precio publicado es conversable. Te invito a que vengas a ver el vehículo y podemos llegar a un acuerdo que nos beneficie a ambos.",
    category: "info",
  },
  {
    id: "more_info",
    icon: Info,
    label: "Más información",
    message: "Con gusto te cuento más detalles del vehículo. ¿Qué información específica te gustaría saber? (kilometraje real, historial de mantenciones, dueños anteriores, etc.)",
    category: "info",
  },
];

export function MessageTemplates({ onSelectTemplate, vehicleTitle, disabled }: MessageTemplatesProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get personalized templates (replace placeholders with vehicle info)
  const templates = defaultTemplates.map((template) => ({
    ...template,
    message: vehicleTitle
      ? template.message.replace("el vehículo", `el ${vehicleTitle}`)
      : template.message,
  }));

  // Quick templates (first 3) always visible
  const quickTemplates = templates.slice(0, 3);
  const moreTemplates = templates.slice(3);

  const handleSelectTemplate = (message: string) => {
    onSelectTemplate(message);
    setIsExpanded(false);
  };

  return (
    <div className="border-t border-neutral-100 bg-neutral-50/50">
      {/* Quick Templates Row */}
      <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-1 text-xs text-neutral-500 shrink-0">
          <Zap className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Respuestas rápidas:</span>
        </div>

        {quickTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => handleSelectTemplate(template.message)}
            disabled={disabled}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-200 rounded-full text-xs font-medium text-neutral-700 hover:bg-andino-50 hover:border-andino-200 hover:text-andino-700 transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <template.icon className="w-3.5 h-3.5" />
            {template.label}
          </button>
        ))}

        {/* Expand button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-andino-600 hover:text-andino-700 transition-colors shrink-0"
        >
          {isExpanded ? (
            <>
              Menos
              <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              Más
              <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {/* Expanded Templates */}
      {isExpanded && (
        <div className="px-4 pb-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-wrap gap-2">
            {moreTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template.message)}
                disabled={disabled}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-200 rounded-full text-xs font-medium text-neutral-700 hover:bg-andino-50 hover:border-andino-200 hover:text-andino-700 transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <template.icon className="w-3.5 h-3.5" />
                {template.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
