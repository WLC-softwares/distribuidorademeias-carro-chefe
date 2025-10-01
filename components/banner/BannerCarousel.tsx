"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface Banner {
  id: string;
  image: string;
  alt: string;
  link?: string;
}

interface BannerCarouselProps {
  banners: Banner[];
  autoPlayInterval?: number;
}

export function BannerCarousel({
  banners,
  autoPlayInterval = 5000,
}: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying || banners.length <= 1) return;

    const interval = setInterval(() => {
      goToNext();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isAutoPlaying, banners.length, autoPlayInterval]);

  const goToPrevious = () => {
    if (isTransitioning) return;
    setIsAutoPlaying(false);
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsAutoPlaying(false);
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handleBannerClick = (banner: Banner) => {
    if (banner.link) {
      window.location.href = banner.link;
    }
  };

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-500 overflow-hidden pt-16 pb-2">
      <div className="relative w-full max-w-screen-2xl mx-auto px-2 sm:px-4 md:px-6">
        {/* Slides Container */}
        <div className="relative w-full h-[280px] sm:h-[320px] md:h-[360px] lg:h-[400px] overflow-hidden rounded-lg md:rounded-xl shadow-lg">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                index === currentIndex
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95"
              }`}
              role="button"
              tabIndex={index === currentIndex ? 0 : -1}
              onClick={() => handleBannerClick(banner)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleBannerClick(banner);
                }
              }}
            >
              <div className="relative w-full h-full cursor-pointer group flex items-center justify-center">
                <Image
                  fill
                  alt={banner.alt}
                  className="object-contain"
                  priority={index === 0}
                  quality={100}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1536px"
                  src={banner.image}
                />
                {/* Overlay sutil no hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          ))}
        </div>

        {/* Indicadores */}
        {banners.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-md z-[2]">
            {banners.map((_, index) => (
              <button
                key={index}
                aria-label={`Ir para banner ${index + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-6 h-1.5 bg-blue-600"
                    : "w-1.5 h-1.5 bg-gray-400 hover:bg-gray-600"
                }`}
                disabled={isTransitioning}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
