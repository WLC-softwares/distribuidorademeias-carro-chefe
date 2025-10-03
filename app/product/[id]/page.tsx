"use client";

import type { Product } from "@/models";

import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import {
  ArrowLeft,
  CheckCircle,
  Minus,
  Package,
  Plus,
  ShoppingCart,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { CartDrawer } from "@/components/cart";
import { ImageCarousel, ProductCard } from "@/components/products";
import { getProductByIdAction, getProductsAction } from "@/controllers";
import { useCart } from "@/hooks";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [saleType, setSaleType] = useState<"varejo" | "atacado">("varejo");
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const data = await getProductByIdAction(params.id as string);

        if (data) {
          setProduct(data);
          // Load related products
          loadRelatedProducts(data);
        } else {
          setError("Produto não encontrado");
        }
      } catch (err) {
        console.error("Erro ao carregar produto:", err);
        setError("Erro ao carregar produto");
      } finally {
        setLoading(false);
      }
    }

    async function loadRelatedProducts(currentProduct: Product) {
      try {
        const allProducts = await getProductsAction();
        // Filter products from same category, excluding current product
        let related = allProducts.filter(
          (p) =>
            p.category === currentProduct.category &&
            p.id !== currentProduct.id &&
            p.active &&
            p.status === "ACTIVE",
        );

        // If no products from same category, get random products
        if (related.length === 0) {
          related = allProducts.filter(
            (p) =>
              p.id !== currentProduct.id && p.active && p.status === "ACTIVE",
          );
        }

        // Shuffle and get up to 8 products
        const shuffled = related.sort(() => Math.random() - 0.5);

        setRelatedProducts(shuffled.slice(0, 8));
      } catch (err) {
        console.error("Erro ao carregar produtos relacionados:", err);
      }
    }

    if (params.id) {
      loadProduct();
    }
  }, [params.id]);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;

    if (newQuantity >= 1 && product && newQuantity <= product.quantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    try {
      addItem(product, quantity, saleType);
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        setIsCartOpen(true);
      }, 800);
    } catch (err) {
      alert("Erro ao adicionar produto ao carrinho");
      console.error("Erro ao adicionar ao carrinho:", err);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;

    try {
      addItem(product, quantity, saleType);
      router.push("/checkout");
    } catch (err) {
      alert("Erro ao adicionar produto ao carrinho");
      console.error("Erro ao adicionar ao carrinho:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner color="primary" size="lg" />
        <span className="ml-3 text-gray-600">Carregando produto...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Package className="mx-auto text-gray-300 mb-4" size={64} />
          <h3 className="text-xl font-medium text-gray-800 mb-2">
            {error || "Produto não encontrado"}
          </h3>
          <Button color="primary" onPress={() => router.push("/")}>
            Voltar para a loja
          </Button>
        </div>
      </div>
    );
  }

  const price =
    saleType === "atacado" ? product.wholesalePrice : product.retailPrice;
  const totalPrice = price * quantity;
  const hasStock = product.quantity > 0 && product.status === "ACTIVE";

  const categoryLabels: Record<string, string> = {
    MENS_SOCKS: "Meias Masculinas",
    WOMENS_SOCKS: "Meias Femininas",
    KIDS_SOCKS: "Meias Infantis",
    SPORTS_SOCKS: "Meias Esportivas",
    DRESS_SOCKS: "Meias Sociais",
    THERMAL_SOCKS: "Meias Térmicas",
    ACCESSORIES: "Acessórios",
    OTHER: "Outros",
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right">
          <Card className="bg-green-50 border-2 border-green-600">
            <CardBody className="flex flex-row items-center gap-3 p-4">
              <CheckCircle className="text-green-600" size={24} />
              <div>
                <p className="font-semibold text-green-900">
                  Produto adicionado!
                </p>
                <p className="text-sm text-green-700">
                  {quantity}x {product?.name}
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Breadcrumb and Back */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3 max-w-7xl">
          <Button
            className="text-blue-600"
            startContent={<ArrowLeft size={18} />}
            variant="light"
            onPress={() => router.push("/")}
          >
            Voltar
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Column 1: Images - 3 colunas */}
          <div className="lg:col-span-3">
            <Card className="p-4">
              <CardBody>
                <ImageCarousel
                  images={product.images || []}
                  productName={product.name}
                />
              </CardBody>
            </Card>
          </div>

          {/* Column 2: Information and Purchase - 2 colunas */}
          <div className="lg:col-span-2 space-y-4">
            {/* Information Card */}
            <Card>
              <CardBody className="p-6 space-y-6">
                {/* Category and SKU */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Chip size="sm" color="warning" variant="flat">
                    {categoryLabels[product.category]}
                  </Chip>
                  {product.sku && (
                    <span className="text-xs text-gray-500">
                      SKU: {product.sku}
                    </span>
                  )}
                </div>

                {/* Title */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {product.name}
                  </h1>
                  {/* Stock Badge */}
                  {hasStock && product.quantity < 10 && (
                    <Chip size="sm" color="warning" variant="flat">
                      ⚠️ Apenas {product.quantity} disponíveis
                    </Chip>
                  )}
                </div>

                {/* Retail/Wholesale Toggle */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Tipo de compra:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      className={`p-4 rounded-lg border-2 transition-all ${saleType === "varejo"
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                        }`}
                      onClick={() => setSaleType("varejo")}
                    >
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">Varejo</p>
                        <p className="text-lg font-bold text-green-600 mt-1">
                          R$ {product.retailPrice.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Preço unitário
                        </p>
                      </div>
                    </button>
                    <button
                      className={`p-4 rounded-lg border-2 transition-all ${saleType === "atacado"
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                        }`}
                      onClick={() => setSaleType("atacado")}
                    >
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">Atacado</p>
                        <p className="text-lg font-bold text-purple-600 mt-1">
                          R$ {product.wholesalePrice.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Por unidade
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Price Display */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Preço</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-normal text-gray-700">R$</span>
                    <span className="text-4xl font-bold text-gray-900">
                      {Math.floor(price)}
                    </span>
                    <span className="text-2xl font-bold text-gray-900">
                      {(price % 1).toFixed(2).substring(1)}
                    </span>
                  </div>

                  {/* Parcelamento Simples */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                        <rect fill="#009EE3" height="24" rx="4" width="24" />
                        <path d="M13 8h3v8h-3V8z" fill="#fff" />
                        <path d="M8 12h3v4H8v-4z" fill="#fff" />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Parcele em até 12x no Mercado Pago
                        </p>
                        <p className="text-xs text-gray-600">
                          * Sujeito a juros
                        </p>
                      </div>
                    </div>
                  </div>

                  {quantity > 1 && (
                    <p className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-200">
                      Subtotal:{" "}
                      <span className="font-bold text-gray-900">
                        R$ {totalPrice.toFixed(2)}
                      </span>
                    </p>
                  )}
                </div>

                {/* Quantity */}
                {hasStock && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Quantidade
                    </p>
                    <div className="flex items-center gap-3">
                      <Button
                        isIconOnly
                        isDisabled={quantity <= 1}
                        size="lg"
                        variant="bordered"
                        onPress={() => handleQuantityChange(-1)}
                      >
                        <Minus size={18} />
                      </Button>
                      <Input
                        className="w-24"
                        classNames={{
                          input: "text-center text-lg font-semibold",
                        }}
                        size="lg"
                        type="number"
                        value={quantity.toString()}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);

                          if (val >= 1 && val <= product.quantity) {
                            setQuantity(val);
                          }
                        }}
                      />
                      <Button
                        isIconOnly
                        isDisabled={quantity >= product.quantity}
                        size="lg"
                        variant="bordered"
                        onPress={() => handleQuantityChange(1)}
                      >
                        <Plus size={18} />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3 pt-2">
                  {hasStock ? (
                    <>
                      <Button
                        className="w-full font-bold text-base"
                        color="primary"
                        size="lg"
                        startContent={<ShoppingCart size={22} />}
                        onPress={handleAddToCart}
                      >
                        Adicionar ao carrinho
                      </Button>
                      <Button
                        className="w-full font-bold text-base bg-purple-600 text-white"
                        size="lg"
                        onPress={handleBuyNow}
                      >
                        Comprar agora
                      </Button>
                    </>
                  ) : (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
                      <p className="font-semibold text-red-700">
                        Produto indisponível
                      </p>
                      <p className="text-sm text-red-600 mt-1">
                        Entre em contato para saber quando estará disponível
                      </p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Product Description */}
        {product.description && (
          <Card className="mt-6">
            <CardBody className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Descrição do Produto
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base">
                {product.description}
              </p>
            </CardBody>
          </Card>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Você também pode gostar
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  saleType={saleType}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
