"use client";

import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Image } from "@heroui/image";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

import { useCart } from "@/hooks";
import { Product } from "@/models";

interface ProductCardProps {
  product: Product;
  saleType: "varejo" | "atacado";
}

export function ProductCard({ product, saleType }: ProductCardProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const mainImage =
    product.images?.find((img) => img.primary)?.url ||
    "/placeholder-product.png";

  const price =
    saleType === "atacado" ? product.wholesalePrice : product.retailPrice;

  const hasStock = product.quantity > 0 && product.status === "ACTIVE";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasStock) {
      addItem(product, 1, saleType);
    }
  };

  const handleCardClick = () => {
    router.push(`/product/${product.id}`);
  };

  return (
    <Card
      className="group relative hover:shadow-lg transition-all duration-300 bg-white border border-gray-200"
      shadow="sm"
    >
      <CardBody className="p-0">
        {/* Product Image */}
        <div
          className="relative w-full aspect-square overflow-hidden bg-gray-50 cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={handleCardClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleCardClick();
            }
          }}
        >
          <Image
            removeWrapper
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 z-0"
            fallbackSrc="/placeholder-product.png"
            src={mainImage}
          />

          {/* Sale Type Badge - Top Left */}
          <div className="absolute top-2 left-2 z-10">
            <Chip
              className={`text-xs font-bold shadow-md ${
                saleType === "atacado"
                  ? "bg-purple-600 text-white"
                  : "bg-blue-600 text-white"
              }`}
              radius="sm"
              size="sm"
              variant="solid"
            >
              {saleType === "atacado" ? "Atacado" : "Varejo"}
            </Chip>
          </div>
        </div>

        {/* Product Information */}
        <div className="p-3 space-y-2">
          {/* Product Name */}
          <button
            className="text-sm text-gray-700 line-clamp-2 leading-snug cursor-pointer hover:text-blue-600 transition-colors text-left w-full"
            style={{ minHeight: "2.5rem" }}
            type="button"
            onClick={handleCardClick}
          >
            {product.name}
          </button>

          {/* Current Price */}
          <div
            className="flex items-baseline gap-1 cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={handleCardClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCardClick();
              }
            }}
          >
            <span className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors">
              R$ {price.toFixed(2).replace(".", ",")}
            </span>
          </div>

          {/* Add to Cart Button */}
          {hasStock ? (
            <Button
              className="w-full mt-2 font-semibold"
              color="primary"
              size="sm"
              startContent={<ShoppingCart size={16} />}
              variant="flat"
              onClick={handleAddToCart}
            >
              Adicionar ao Carrinho
            </Button>
          ) : (
            <div className="mt-2">
              <Chip
                className="text-xs w-full justify-center"
                color="danger"
                size="sm"
                variant="flat"
              >
                {product.status === "OUT_OF_STOCK"
                  ? "Esgotado"
                  : "Indisponível"}
              </Chip>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
