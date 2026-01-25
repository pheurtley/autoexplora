"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { useTracking } from "@/hooks";
import {
  Share2,
  Link2,
  Check,
  Facebook,
  MessageCircle,
} from "lucide-react";

interface ShareButtonsProps {
  title: string;
  url: string;
  description?: string;
  vehicleId?: string;
}

export function ShareButtons({ title, url, description, vehicleId }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const { trackShare } = useTracking();

  const fullUrl = typeof window !== "undefined"
    ? `${window.location.origin}${url}`
    : url;

  const shareText = description || `Mira este vehículo: ${title}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      trackShare("copy", { vehicleId });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(`${shareText}\n${fullUrl}`);
    trackShare("whatsapp", { vehicleId });
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const handleFacebookShare = () => {
    const fbUrl = encodeURIComponent(fullUrl);
    trackShare("facebook", { vehicleId });
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${fbUrl}`, "_blank", "width=600,height=400");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: fullUrl,
        });
      } catch (error) {
        // User cancelled or error
        if ((error as Error).name !== "AbortError") {
          console.error("Error sharing:", error);
        }
      }
    } else {
      setShowOptions(!showOptions);
    }
  };

  // Check if native share is available
  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={handleNativeShare}
        className="gap-2"
      >
        <Share2 className="h-4 w-4" />
        Compartir
      </Button>

      {/* Dropdown for non-native share */}
      {!hasNativeShare && showOptions && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 min-w-[180px] z-50">
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-green-600">Enlace copiado</span>
              </>
            ) : (
              <>
                <Link2 className="h-4 w-4" />
                <span>Copiar enlace</span>
              </>
            )}
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <MessageCircle className="h-4 w-4 text-green-500" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handleFacebookShare}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <Facebook className="h-4 w-4 text-blue-600" />
            <span>Facebook</span>
          </button>
        </div>
      )}

      {/* Click outside to close */}
      {!hasNativeShare && showOptions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowOptions(false)}
        />
      )}
    </div>
  );
}
