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

  const categoryLabels: Record<string, string> = {
    MENS_SOCKS: "Masculinas",
    WOMENS_SOCKS: "Femininas",
    KIDS_SOCKS: "Infantis",
    SPORTS_SOCKS: "Esportivas",
    DRESS_SOCKS: "Sociais",
    THERMAL_SOCKS: "Térmicas",
    ACCESSORIES: "Acessórios",
    OTHER: "Outros",
  };

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
      className="group relative hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer bg-white border border-gray-100"
      shadow="md"
    >
      <CardBody className="p-0" onClick={handleCardClick}>
        {/* Product Image */}
        <div className="relative w-full aspect-square overflow-hidden bg-white">
          <Image
            removeWrapper
            alt={product.name}
            className="w-full h-full object-contain p-6 z-0 group-hover:scale-105 transition-transform duration-300"
            fallbackSrc="/placeholder-product.png"
            src={mainImage}
          />

          {/* Sale Type Badge */}
          <div className="absolute top-2 left-2">
            <Chip
              className={`text-xs font-bold shadow-md ${saleType === "atacado"
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
        <div className="p-4 space-y-2">
          {/* Price */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-green-600">R$</span>
              <span className="text-4xl font-bold text-green-600">
                {Math.floor(price)}
              </span>
              <span className="text-2xl font-bold text-green-600">
                {(price % 1).toFixed(2).substring(1)}
              </span>
            </div>
          </div>

          {/* Product Name */}
          <h3
            className="text-sm text-gray-700 line-clamp-2 leading-tight font-medium"
            style={{ minHeight: "2.5rem" }}
          >
            {product.name}
          </h3>

          {/* Category */}
          <p className="text-xs text-gray-500 font-medium">
            {categoryLabels[product.category]}
          </p>

          {/* Add to Cart Button */}
          {hasStock ? (
            <Button
              className="w-full mt-3 font-bold"
              color="success"
              size="md"
              startContent={<ShoppingCart size={18} />}
              variant="shadow"
              onClick={handleAddToCart}
            >
              Adicionar
            </Button>
          ) : (
            <div className="mt-3">
              <Chip className="text-xs w-full" color="danger" size="md" variant="flat">
                {product.status === "OUT_OF_STOCK" ? "Esgotado" : "Indisponível"}
              </Chip>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
