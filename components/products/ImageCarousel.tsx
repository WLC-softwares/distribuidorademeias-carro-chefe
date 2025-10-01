'use client';

import type { ProductImage } from '@/models';
import { Button } from '@heroui/button';
import { Image } from '@heroui/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ImageCarouselProps {
    images: ProductImage[];
    productName: string;
}

export function ImageCarousel({ images, productName }: ImageCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Ordenar imagens (principal primeiro)
    const sortedImages = [...images].sort((a, b) => {
        if (a.principal) return -1;
        if (b.principal) return 1;
        return a.ordem - b.ordem;
    });

    // Auto-play do carrossel
    useEffect(() => {
        if (!isAutoPlaying || sortedImages.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % sortedImages.length);
        }, 4000); // Troca a cada 4 segundos

        return () => clearInterval(interval);
    }, [isAutoPlaying, sortedImages.length]);

    const goToPrevious = () => {
        setIsAutoPlaying(false);
        setCurrentIndex((prev) => (prev - 1 + sortedImages.length) % sortedImages.length);
    };

    const goToNext = () => {
        setIsAutoPlaying(false);
        setCurrentIndex((prev) => (prev + 1) % sortedImages.length);
    };

    const goToSlide = (index: number) => {
        setIsAutoPlaying(false);
        setCurrentIndex(index);
    };

    if (sortedImages.length === 0) {
        return (
            <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <Image
                    src="/placeholder-product.png"
                    alt={productName}
                    className="w-full h-full object-contain p-8"
                    removeWrapper
                />
            </div>
        );
    }

    return (
        <div className="relative w-full">
            {/* Imagem Principal */}
            <div className="relative w-full aspect-square bg-white rounded-lg overflow-hidden">
                <Image
                    src={sortedImages[currentIndex]?.url || '/placeholder-product.png'}
                    alt={sortedImages[currentIndex]?.alt || productName}
                    className="w-full h-full object-contain p-8"
                    removeWrapper
                />

                {/* Botões de Navegação */}
                {sortedImages.length > 1 && (
                    <>
                        <Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                            onPress={goToPrevious}
                        >
                            <ChevronLeft size={20} />
                        </Button>

                        <Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                            onPress={goToNext}
                        >
                            <ChevronRight size={20} />
                        </Button>
                    </>
                )}

                {/* Indicadores */}
                {sortedImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {sortedImages.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`h-2 rounded-full transition-all ${index === currentIndex
                                        ? 'w-8 bg-blue-600'
                                        : 'w-2 bg-gray-300 hover:bg-gray-400'
                                    }`}
                                aria-label={`Ir para imagem ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Miniaturas */}
            {sortedImages.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                    {sortedImages.map((image, index) => (
                        <button
                            key={image.id}
                            onClick={() => goToSlide(index)}
                            className={`flex-shrink-0 w-20 h-20 rounded border-2 transition-all overflow-hidden ${index === currentIndex
                                    ? 'border-blue-600'
                                    : 'border-gray-200 hover:border-gray-400'
                                }`}
                        >
                            <Image
                                src={image.url}
                                alt={image.alt || `${productName} - ${index + 1}`}
                                className="w-full h-full object-contain p-1"
                                removeWrapper
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

