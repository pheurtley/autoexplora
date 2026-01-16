"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Star, GripVertical, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
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

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = "move";
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      onReorder(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const moveImage = (index: number, direction: "left" | "right") => {
    const newIndex = direction === "left" ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < images.length) {
      onReorder(index, newIndex);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {images.map((image, index) => (
        <div
          key={image.id}
          draggable={!image.isUploading}
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          onDragLeave={handleDragLeave}
          className={`
            relative aspect-[4/3] rounded-lg overflow-hidden group border-2
            ${draggedIndex === index ? "opacity-50 border-neutral-300" : "border-transparent"}
            ${dragOverIndex === index ? "border-andino-500 bg-andino-50" : ""}
            ${!image.isUploading ? "cursor-grab active:cursor-grabbing" : ""}
          `}
        >
          {/* Image */}
          <Image
            src={image.url}
            alt={`Imagen ${index + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            draggable={false}
          />

          {/* Uploading overlay */}
          {image.isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          )}

          {/* Primary badge */}
          {image.isPrimary && !image.isUploading && (
            <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Star className="h-3 w-3 fill-current" />
              Principal
            </div>
          )}

          {/* Delete button - always visible */}
          {!image.isUploading && (
            <button
              type="button"
              onClick={() => onRemove(image.id)}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md transition-colors z-10"
              title="Eliminar imagen"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Bottom controls bar */}
          {!image.isUploading && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-6">
              <div className="flex items-center justify-between">
                {/* Order number and reorder buttons */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveImage(index, "left")}
                    disabled={index === 0}
                    className={`p-1 rounded transition-colors ${
                      index === 0
                        ? "text-white/30 cursor-not-allowed"
                        : "text-white hover:bg-white/20"
                    }`}
                    title="Mover a la izquierda"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-white text-sm font-medium min-w-[20px] text-center">
                    {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => moveImage(index, "right")}
                    disabled={index === images.length - 1}
                    className={`p-1 rounded transition-colors ${
                      index === images.length - 1
                        ? "text-white/30 cursor-not-allowed"
                        : "text-white hover:bg-white/20"
                    }`}
                    title="Mover a la derecha"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Set as primary button */}
                {!image.isPrimary && (
                  <button
                    type="button"
                    onClick={() => onSetPrimary(image.id)}
                    className="text-white hover:text-amber-400 p-1 rounded hover:bg-white/20 transition-colors"
                    title="Marcar como principal"
                  >
                    <Star className="h-4 w-4" />
                  </button>
                )}

                {/* Drag handle indicator */}
                <div className="text-white/60 hidden sm:block" title="Arrastra para reordenar">
                  <GripVertical className="h-4 w-4" />
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
