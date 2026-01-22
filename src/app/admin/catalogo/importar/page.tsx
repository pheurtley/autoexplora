"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function CatalogImportExportPage() {
  const [exporting, setExporting] = useState<string | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    details?: { created: number; updated: number; errors: number };
  } | null>(null);

  const handleExport = async (type: "brands" | "models" | "versions" | "all") => {
    setExporting(type);
    try {
      const response = await fetch(`/api/admin/catalogo/export?type=${type}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `catalogo-${type}-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert("Error al exportar");
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("Error al exportar");
    } finally {
      setExporting(null);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    setImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append("file", importFile);

      const response = await fetch("/api/admin/catalogo/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setImportResult({
          success: true,
          message: "Importación completada exitosamente",
          details: data,
        });
        setImportFile(null);
      } else {
        setImportResult({
          success: false,
          message: data.error || "Error durante la importación",
        });
      }
    } catch (error) {
      console.error("Import error:", error);
      setImportResult({
        success: false,
        message: "Error de conexión durante la importación",
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/catalogo"
          className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900 mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al dashboard
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">
          Importar / Exportar Catálogo
        </h1>
        <p className="text-neutral-600 mt-1">
          Descarga el catálogo en formato CSV o importa datos nuevos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Section */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Download className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900">Exportar</h2>
          </div>

          <p className="text-sm text-neutral-600 mb-6">
            Descarga el catálogo completo o parcial en formato CSV para edición
            externa o respaldo.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => handleExport("brands")}
              disabled={exporting !== null}
              className="w-full flex items-center justify-between px-4 py-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-blue-500" />
                <div className="text-left">
                  <p className="font-medium text-neutral-900">Solo Marcas</p>
                  <p className="text-xs text-neutral-500">ID, nombre, slug, logo</p>
                </div>
              </div>
              {exporting === "brands" ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-andino-600"></div>
              ) : (
                <Download className="w-4 h-4 text-neutral-400" />
              )}
            </button>

            <button
              onClick={() => handleExport("models")}
              disabled={exporting !== null}
              className="w-full flex items-center justify-between px-4 py-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-purple-500" />
                <div className="text-left">
                  <p className="font-medium text-neutral-900">Solo Modelos</p>
                  <p className="text-xs text-neutral-500">
                    ID, nombre, slug, marca
                  </p>
                </div>
              </div>
              {exporting === "models" ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-andino-600"></div>
              ) : (
                <Download className="w-4 h-4 text-neutral-400" />
              )}
            </button>

            <button
              onClick={() => handleExport("versions")}
              disabled={exporting !== null}
              className="w-full flex items-center justify-between px-4 py-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-amber-500" />
                <div className="text-left">
                  <p className="font-medium text-neutral-900">Solo Versiones</p>
                  <p className="text-xs text-neutral-500">
                    ID, nombre, modelo, marca, especificaciones
                  </p>
                </div>
              </div>
              {exporting === "versions" ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-andino-600"></div>
              ) : (
                <Download className="w-4 h-4 text-neutral-400" />
              )}
            </button>

            <button
              onClick={() => handleExport("all")}
              disabled={exporting !== null}
              className="w-full flex items-center justify-between px-4 py-3 bg-andino-50 border border-andino-200 rounded-lg hover:bg-andino-100 disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-andino-600" />
                <div className="text-left">
                  <p className="font-medium text-andino-900">Catálogo Completo</p>
                  <p className="text-xs text-andino-600">
                    Marcas, modelos y versiones en un archivo
                  </p>
                </div>
              </div>
              {exporting === "all" ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-andino-600"></div>
              ) : (
                <Download className="w-4 h-4 text-andino-500" />
              )}
            </button>
          </div>
        </div>

        {/* Import Section */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900">Importar</h2>
          </div>

          <p className="text-sm text-neutral-600 mb-6">
            Sube un archivo CSV para agregar o actualizar datos del catálogo.
            Los registros existentes se actualizarán si coincide el ID.
          </p>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="hidden"
                id="import-file"
              />
              <label
                htmlFor="import-file"
                className="cursor-pointer block"
              >
                <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-neutral-700">
                  {importFile ? importFile.name : "Seleccionar archivo CSV"}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Arrastra aquí o haz clic para seleccionar
                </p>
              </label>
            </div>

            {importFile && (
              <button
                onClick={handleImport}
                disabled={importing}
                className="w-full py-2.5 bg-andino-600 text-white font-medium rounded-lg hover:bg-andino-700 disabled:opacity-50"
              >
                {importing ? "Importando..." : "Iniciar importación"}
              </button>
            )}

            {importResult && (
              <div
                className={`p-4 rounded-lg ${
                  importResult.success
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  {importResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  )}
                  <p
                    className={`font-medium ${
                      importResult.success ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {importResult.message}
                  </p>
                </div>
                {importResult.details && (
                  <div className="mt-2 text-sm text-green-700">
                    <p>Creados: {importResult.details.created}</p>
                    <p>Actualizados: {importResult.details.updated}</p>
                    {importResult.details.errors > 0 && (
                      <p className="text-red-700">
                        Errores: {importResult.details.errors}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Format Instructions */}
          <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
            <h3 className="text-sm font-medium text-neutral-900 mb-2">
              Formato del archivo
            </h3>
            <p className="text-xs text-neutral-600 mb-2">
              El CSV debe tener las siguientes columnas según el tipo:
            </p>
            <ul className="text-xs text-neutral-600 space-y-1">
              <li>
                <strong>Marcas:</strong> name, slug (opcional), logo (opcional)
              </li>
              <li>
                <strong>Modelos:</strong> name, brand_name o brand_id
              </li>
              <li>
                <strong>Versiones:</strong> name, model_name, brand_name,
                engineSize, horsePower, transmission, drivetrain, trimLevel
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
