"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface Banner {
  id: string;
  image: string;
  imageMobile?: string; // Imagem opcional para mobile
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
    <div className="relative w-full h-[220px] sm:h-[280px] md:h-[350px] lg:h-[400px] xl:h-[450px] overflow-hidden">
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
          <div className="relative w-full h-full cursor-pointer group">
            {/* Imagem Mobile - exibida apenas em telas pequenas */}
            {banner.imageMobile && (
              <Image
                fill
                alt={banner.alt}
                className="md:hidden object-cover object-center"
                priority={index === 0}
                quality={90}
                sizes="100vw"
                src={banner.imageMobile}
              />
            )}

            {/* Imagem Desktop - exibida em telas médias e grandes */}
            <Image
              fill
              alt={banner.alt}
              className={`${banner.imageMobile ? "hidden md:block" : "block"} object-cover object-center`}
              priority={index === 0}
              quality={90}
              sizes="(max-width: 768px) 100vw, (max-width: 1536px) 100vw, 1920px"
              src={banner.image}
            />

            {/* Overlay sutil no hover - apenas em desktop */}
            <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>
      ))}
    </div>
  );
}
