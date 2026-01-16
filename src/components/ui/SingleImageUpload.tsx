"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, ImageIcon, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_IMAGE_SIZE_MB } from "@/lib/constants";

interface SingleImageUploadProps {
  value?: string;
  publicId?: string;
  onChange: (url: string, publicId: string) => void;
  onRemove: () => void;
  folder: string;
  aspectRatio?: "square" | "banner";
  maxSizeMB?: number;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function SingleImageUpload({
  value,
  publicId,
  onChange,
  onRemove,
  folder,
  aspectRatio = "square",
  maxSizeMB = MAX_IMAGE_SIZE_MB,
  placeholder,
  className,
  disabled = false,
}: SingleImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const uploadFile = async (file: File): Promise<{ url: string; publicId: string } | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al subir imagen");
      }

      const data = await response.json();
      return {
        url: data.url,
        publicId: data.publicId,
      };
    } catch (err) {
      console.error("Upload error:", err);
      throw err;
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Validate file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`La imagen no puede superar ${maxSizeMB}MB`);
        return;
      }

      setUploading(true);
      setError("");

      try {
        const result = await uploadFile(file);
        if (result) {
          onChange(result.url, result.publicId);
        }
      } catch (err) {
        setError("Error al subir la imagen. Intenta nuevamente.");
      } finally {
        setUploading(false);
      }
    },
    [folder, maxSizeMB, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxSize: maxSizeMB * 1024 * 1024,
    disabled: disabled || uploading,
    multiple: false,
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove();
    setError("");
  };

  const aspectClasses = {
    square: "aspect-square",
    banner: "aspect-[3/1]",
  };

  const defaultPlaceholder = aspectRatio === "square"
    ? "Logo (400×400px recomendado)"
    : "Banner (1200×400px recomendado)";

  // Has image - show preview with overlay
  if (value) {
    return (
      <div className={cn("relative group", className)}>
        <div
          className={cn(
            "relative overflow-hidden rounded-lg border border-neutral-200 bg-white",
            aspectClasses[aspectRatio]
          )}
        >
          <img
            src={value}
            alt="Preview"
            className={cn(
              "w-full h-full",
              aspectRatio === "square" ? "object-contain p-2" : "object-cover"
            )}
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <label
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center cursor-pointer hover:bg-neutral-100 transition-colors"
              title="Cambiar imagen"
            >
              <Pencil className="w-5 h-5 text-neutral-700" />
              <input
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onDrop([file]);
                  }
                }}
                disabled={disabled || uploading}
              />
            </label>
            <button
              type="button"
              onClick={handleRemove}
              className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors"
              title="Eliminar imagen"
              disabled={disabled}
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Loading overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-andino-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
        )}
      </div>
    );
  }

  // Empty state - show dropzone
  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={cn(
          "relative overflow-hidden rounded-lg border-2 border-dashed cursor-pointer transition-colors",
          aspectClasses[aspectRatio],
          isDragActive
            ? "border-andino-500 bg-andino-50"
            : "border-neutral-300 bg-neutral-50 hover:border-andino-400 hover:bg-andino-50/50",
          (disabled || uploading) && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />

        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          {uploading ? (
            <div className="w-8 h-8 border-2 border-andino-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <ImageIcon className="w-10 h-10 text-neutral-400 mb-2" />
              <p className="text-sm text-neutral-600 text-center">
                <span className="font-medium text-andino-600">
                  Click para subir
                </span>{" "}
                o arrastra
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                {placeholder || defaultPlaceholder}
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">
                PNG, JPG o WEBP (máx. {maxSizeMB}MB)
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
      )}
    </div>
  );
}
