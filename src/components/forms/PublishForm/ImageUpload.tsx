"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui";
import { ImagePreview } from "./ImagePreview";
import {
  Upload,
  ImagePlus,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  MAX_IMAGES_PER_VEHICLE,
  MIN_IMAGES_PER_VEHICLE,
  MAX_IMAGE_SIZE_MB,
  ACCEPTED_IMAGE_TYPES,
} from "@/lib/constants";

export interface UploadedImage {
  id: string;
  url: string;
  publicId: string;
  isPrimary: boolean;
  order: number;
  isUploading?: boolean;
  error?: string;
}

interface ImageUploadProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  error?: string;
}

export function ImageUpload({ images, onChange, error }: ImageUploadProps) {
  const [uploadingCount, setUploadingCount] = useState(0);

  const uploadFile = async (file: File): Promise<UploadedImage | null> => {
    const formData = new FormData();
    formData.append("file", file);

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
        id: data.publicId,
        url: data.url,
        publicId: data.publicId,
        isPrimary: false,
        order: 0,
      };
    } catch (err) {
      console.error("Upload error:", err);
      return null;
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Check if we can add more images
      const availableSlots = MAX_IMAGES_PER_VEHICLE - images.length;
      if (availableSlots <= 0) {
        return;
      }

      const filesToUpload = acceptedFiles.slice(0, availableSlots);
      setUploadingCount(filesToUpload.length);

      // Create temporary placeholders
      const tempImages: UploadedImage[] = filesToUpload.map((file, index) => ({
        id: `temp-${Date.now()}-${index}`,
        url: URL.createObjectURL(file),
        publicId: "",
        isPrimary: images.length === 0 && index === 0,
        order: images.length + index,
        isUploading: true,
      }));

      onChange([...images, ...tempImages]);

      // Upload files in parallel
      const uploadPromises = filesToUpload.map(async (file, index) => {
        const result = await uploadFile(file);
        return { index, result };
      });

      const results = await Promise.all(uploadPromises);

      // Update images with uploaded results
      const currentImages = [...images];
      const newImages: UploadedImage[] = [];

      results.forEach(({ index, result }) => {
        if (result) {
          result.isPrimary = images.length === 0 && index === 0;
          result.order = images.length + index;
          newImages.push(result);
        }
      });

      onChange([...currentImages, ...newImages]);
      setUploadingCount(0);
    },
    [images, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxSize: MAX_IMAGE_SIZE_MB * 1024 * 1024,
    disabled: images.length >= MAX_IMAGES_PER_VEHICLE || uploadingCount > 0,
  });

  const handleRemove = (id: string) => {
    const newImages = images.filter((img) => img.id !== id);
    // If we removed the primary, make the first one primary
    if (newImages.length > 0 && !newImages.some((img) => img.isPrimary)) {
      newImages[0].isPrimary = true;
    }
    // Reorder
    newImages.forEach((img, index) => {
      img.order = index;
    });
    onChange(newImages);
  };

  const handleSetPrimary = (id: string) => {
    const newImages = images.map((img) => ({
      ...img,
      isPrimary: img.id === id,
    }));
    onChange(newImages);
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    // Update order
    newImages.forEach((img, index) => {
      img.order = index;
    });
    onChange(newImages);
  };

  const uploadedImages = images.filter((img) => !img.isUploading);
  const isMinMet = uploadedImages.length >= MIN_IMAGES_PER_VEHICLE;
  const canAddMore = images.length < MAX_IMAGES_PER_VEHICLE;

  return (
    <div className="space-y-4">
      {/* Status indicators */}
      <div className="flex items-center gap-4 text-sm">
        <div
          className={`flex items-center gap-1 ${
            isMinMet ? "text-green-600" : "text-amber-600"
          }`}
        >
          {isMinMet ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span>
            {uploadedImages.length} de {MIN_IMAGES_PER_VEHICLE} mínimo
          </span>
        </div>
        <div className="text-neutral-500">
          Máximo {MAX_IMAGES_PER_VEHICLE} imágenes
        </div>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive ? "border-andino-500 bg-andino-50" : "border-neutral-300 hover:border-andino-400"}
          ${!canAddMore || uploadingCount > 0 ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-3">
          {uploadingCount > 0 ? (
            <>
              <div className="w-12 h-12 rounded-full bg-andino-100 flex items-center justify-center animate-pulse">
                <Upload className="h-6 w-6 text-andino-600" />
              </div>
              <p className="text-neutral-600">
                Subiendo {uploadingCount} {uploadingCount === 1 ? "imagen" : "imágenes"}...
              </p>
            </>
          ) : isDragActive ? (
            <>
              <div className="w-12 h-12 rounded-full bg-andino-100 flex items-center justify-center">
                <ImagePlus className="h-6 w-6 text-andino-600" />
              </div>
              <p className="text-andino-600 font-medium">Suelta las imágenes aquí</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
                <ImagePlus className="h-6 w-6 text-neutral-400" />
              </div>
              <div>
                <p className="text-neutral-700 font-medium">
                  Arrastra imágenes aquí o haz clic para seleccionar
                </p>
                <p className="text-sm text-neutral-500 mt-1">
                  JPG, PNG o WebP • Máximo {MAX_IMAGE_SIZE_MB}MB por imagen
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}

      {/* Image previews */}
      {images.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-neutral-600">
            Usa las flechas o arrastra para reordenar • Haz clic en la X para eliminar • La imagen #1 será la principal
          </p>
          <ImagePreview
            images={images}
            onRemove={handleRemove}
            onSetPrimary={handleSetPrimary}
            onReorder={handleReorder}
          />
        </div>
      )}
    </div>
  );
}
