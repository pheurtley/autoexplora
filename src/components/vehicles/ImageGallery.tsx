"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";

interface VehicleImage {
  id: string;
  url: string;
  order: number;
}

interface ImageGalleryProps {
  images: VehicleImage[];
  title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  const currentImage = images[currentIndex];

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const goToPrevious = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setIsZoomed(false);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [images.length, isTransitioning]);

  const goToNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setIsZoomed(false);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [images.length, isTransitioning]);

  const goToIndex = (index: number) => {
    if (index === currentIndex || isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setIsZoomed(false);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Handle keyboard navigation
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "Escape") {
        setIsFullscreen(false);
        setIsZoomed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, goToPrevious, goToNext]);

  // Lock body scroll when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  // Scroll thumbnail into view
  useEffect(() => {
    if (thumbnailsRef.current && isFullscreen) {
      const thumbnail = thumbnailsRef.current.children[currentIndex] as HTMLElement;
      if (thumbnail) {
        thumbnail.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [currentIndex, isFullscreen]);

  // Preload adjacent images
  useEffect(() => {
    if (images.length <= 1) return;

    const preloadIndexes = [
      currentIndex === 0 ? images.length - 1 : currentIndex - 1,
      currentIndex === images.length - 1 ? 0 : currentIndex + 1,
    ];

    preloadIndexes.forEach((index) => {
      const img = new window.Image();
      img.src = images[index].url;
    });
  }, [currentIndex, images]);

  // Touch handlers for swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && !isZoomed) {
      goToNext();
    }
    if (isRightSwipe && !isZoomed) {
      goToPrevious();
    }
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  if (images.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="aspect-[16/10] bg-neutral-100 flex items-center justify-center text-neutral-400">
          Sin imágenes disponibles
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {/* Main Image */}
        <div
          className="relative aspect-[16/10] bg-neutral-100 cursor-pointer group"
          onClick={() => setIsFullscreen(true)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          role="button"
          tabIndex={0}
          aria-label="Ver imagen en pantalla completa"
        >
          <div
            className={`relative w-full h-full transition-opacity duration-300 ${
              isTransitioning ? "opacity-80" : "opacity-100"
            }`}
          >
            <Image
              src={currentImage.url}
              alt={`${title} - Imagen ${currentIndex + 1}`}
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 66vw"
              priority={currentIndex === 0}
            />
          </div>

          {/* Click to expand hint */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-black/50 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2">
              <ZoomIn className="w-4 h-4" />
              Click para ampliar
            </div>
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="w-5 h-5 text-neutral-700" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="w-5 h-5 text-neutral-700" />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/60 text-white text-sm rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="p-3 border-t border-neutral-100">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => goToIndex(index)}
                  className={`relative w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    index === currentIndex
                      ? "border-andino-600 ring-2 ring-andino-200"
                      : "border-transparent hover:border-neutral-300"
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={`${title} - Miniatura ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-in fade-in duration-200"
          role="dialog"
          aria-label="Galería de imágenes en pantalla completa"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between p-4 text-white">
            <div className="text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleZoom}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                aria-label={isZoomed ? "Alejar" : "Acercar"}
              >
                {isZoomed ? (
                  <ZoomOut className="w-5 h-5" />
                ) : (
                  <ZoomIn className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => {
                  setIsFullscreen(false);
                  setIsZoomed(false);
                }}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Image Container */}
          <div
            className="flex-1 relative flex items-center justify-center overflow-hidden"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
                  aria-label="Imagen siguiente"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Image */}
            <div
              className={`relative transition-all duration-300 ease-out ${
                isZoomed
                  ? "w-full h-full cursor-zoom-out"
                  : "w-full h-full max-w-5xl max-h-[70vh] mx-4 cursor-zoom-in"
              }`}
              onClick={toggleZoom}
            >
              <Image
                src={currentImage.url}
                alt={`${title} - Imagen ${currentIndex + 1}`}
                fill
                className={`transition-all duration-300 ${
                  isZoomed ? "object-contain" : "object-contain"
                }`}
                sizes="100vw"
                priority
              />
            </div>
          </div>

          {/* Thumbnails Strip */}
          {images.length > 1 && (
            <div className="p-4 bg-black/50">
              <div
                ref={thumbnailsRef}
                className="flex gap-2 overflow-x-auto justify-center pb-1 scrollbar-hide"
              >
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => goToIndex(index)}
                    className={`relative w-16 h-12 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      index === currentIndex
                        ? "border-white ring-2 ring-white/50 opacity-100"
                        : "border-transparent opacity-50 hover:opacity-80"
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={`${title} - Miniatura ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Keyboard hints */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/50 text-xs hidden md:block">
            Usa las flechas ← → para navegar • ESC para cerrar
          </div>
        </div>
      )}
    </>
  );
}
