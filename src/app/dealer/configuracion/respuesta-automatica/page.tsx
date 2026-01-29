import { AutoResponseSettings } from "@/components/dealer/AutoResponseSettings";

export default function DealerAutoResponsePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Configuración</h1>
        <p className="text-neutral-600 text-sm mt-1">
          Configura respuestas automáticas para nuevos leads.
        </p>
      </div>
      <AutoResponseSettings />
    </div>
  );
}
