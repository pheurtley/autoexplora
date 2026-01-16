"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Star, GripVertical, Loader2 } from "lucide-react";
import type { UploadedImage } from "./ImageUpload";

interface ImagePreviewProps {
  images: UploadedImage[];
  onRemove: (id: string) => void;
  onSetPrimary: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function ImagePreview({
  images,
  onRemove,
  onSetPrimary,
  onReorder,
}: ImagePreviewProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null) {
      onReorder(draggedIndex, dragOverIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {images.map((image, index) => (
        <div
          key={image.id}
          draggable={!image.isUploading}
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          onDragLeave={handleDragLeave}
          className={`
            relative aspect-[4/3] rounded-lg overflow-hidden group
            ${draggedIndex === index ? "opacity-50" : ""}
            ${dragOverIndex === index ? "ring-2 ring-andino-500 ring-offset-2" : ""}
            ${!image.isUploading ? "cursor-move" : ""}
          `}
        >
          {/* Image */}
          <Image
            src={image.url}
            alt={`Imagen ${index + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />

          {/* Uploading overlay */}
          {image.isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          )}

          {/* Primary badge */}
          {image.isPrimary && !image.isUploading && (
            <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Star className="h-3 w-3 fill-current" />
              Principal
            </div>
          )}

          {/* Order number */}
          {!image.isUploading && (
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              {index + 1}
            </div>
          )}

          {/* Actions overlay */}
          {!image.isUploading && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
              {/* Drag handle */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/90 rounded-lg p-1.5 shadow-sm">
                  <GripVertical className="h-4 w-4 text-neutral-600" />
                </div>
              </div>

              {/* Action buttons */}
              <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!image.isPrimary && (
                  <button
                    type="button"
                    onClick={() => onSetPrimary(image.id)}
                    className="bg-white/90 hover:bg-amber-500 hover:text-white rounded-lg p-1.5 shadow-sm transition-colors"
                    title="Marcar como principal"
                  >
                    <Star className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onRemove(image.id)}
                  className="bg-white/90 hover:bg-red-500 hover:text-white rounded-lg p-1.5 shadow-sm transition-colors"
                  title="Eliminar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
