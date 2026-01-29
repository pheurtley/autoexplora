import { MessageTemplateEditor } from "@/components/dealer/MessageTemplateEditor";

export default function DealerTemplatesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Configuración</h1>
        <p className="text-neutral-600 text-sm mt-1">
          Gestiona las plantillas de mensajes para responder a tus leads.
        </p>
      </div>
      <MessageTemplateEditor />
    </div>
  );
}
