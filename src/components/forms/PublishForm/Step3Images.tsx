"use client";

import { ImageUpload, type UploadedImage } from "./ImageUpload";
import { Camera } from "lucide-react";
import type { PublishFormData, PublishFormImage } from "@/lib/validations";

interface Step3ImagesProps {
  data: PublishFormData;
  onChange: (field: keyof PublishFormData, value: PublishFormImage[]) => void;
  errors: Record<string, string>;
}

export function Step3Images({ data, onChange, errors }: Step3ImagesProps) {
  const handleImagesChange = (images: UploadedImage[]) => {
    // Filter out uploading images and convert to PublishFormImage format
    const validImages: PublishFormImage[] = images
      .filter((img) => !img.isUploading && img.publicId)
      .map((img) => ({
        id: img.id,
        url: img.url,
        publicId: img.publicId,
        isPrimary: img.isPrimary,
        order: img.order,
      }));
    onChange("images", validImages);
  };

  // Convert PublishFormImage[] to UploadedImage[] for the ImageUpload component
  const uploadedImages: UploadedImage[] = data.images.map((img) => ({
    id: img.id,
    url: img.url,
    publicId: img.publicId,
    isPrimary: img.isPrimary,
    order: img.order,
    isUploading: false,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-andino-100 flex items-center justify-center">
          <Camera className="w-5 h-5 text-andino-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">
            Fotos del vehículo
          </h2>
          <p className="text-sm text-neutral-600">
            Sube fotos de buena calidad para atraer más compradores
          </p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-amber-800 mb-2">
          Tips para mejores fotos:
        </h3>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• Fotografía en un lugar bien iluminado</li>
          <li>• Incluye fotos del exterior, interior y motor</li>
          <li>• Muestra cualquier detalle importante o imperfección</li>
          <li>• La primera foto será la imagen principal del anuncio</li>
        </ul>
      </div>

      <ImageUpload
        images={uploadedImages}
        onChange={handleImagesChange}
        error={errors.images}
      />
    </div>
  );
}
