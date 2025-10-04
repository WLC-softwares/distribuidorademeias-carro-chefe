"use client";

import type { Product } from "@/models";

import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import { ArrowLeft, CheckCircle, Minus, Package, Plus } from "lucide-react";
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
  const [otherProducts, setOtherProducts] = useState<Product[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const data = await getProductByIdAction(params.id as string);

        if (data) {
          setProduct(data);
          // Load other products
          loadOtherProducts(data);
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

    async function loadOtherProducts(currentProduct: Product) {
      try {
        const allProducts = await getProductsAction();

        const others = allProducts.filter(
          (p) =>
            p.id !== currentProduct.id && p.active && p.status === "ACTIVE",
        );

        const shuffled = others.sort(() => Math.random() - 0.5);

        setOtherProducts(shuffled.slice(0, 8));
      } catch (err) {
        console.error("Erro ao carregar outros produtos:", err);
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
    <div className="bg-white min-h-screen">
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
            onPress={() => router.back()}
          >
            Voltar
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Column 1: Images - 7 colunas */}
          <div className="lg:col-span-7">
            <Card className="p-6 bg-white">
              <CardBody>
                <ImageCarousel
                  images={product.images || []}
                  productName={product.name}
                />
              </CardBody>
            </Card>
          </div>

          {/* Column 2: Information and Purchase - 5 colunas */}
          <div className="lg:col-span-5 space-y-4">
            {/* Information Card */}
            <Card>
              <CardBody className="p-6 space-y-4">
                {/* Category */}
                <div className="text-sm text-gray-600">
                  {categoryLabels[product.category]}
                </div>

                {/* Title */}
                <div>
                  <h1 className="text-xl font-normal text-gray-900 leading-relaxed">
                    {product.name}
                  </h1>
                </div>

                {/* Stock Badge */}
                {hasStock && product.quantity < 10 ? (
                  <div className="text-sm text-yellow-600">
                    ⚠️ Últimas {product.quantity} unidades disponíveis
                  </div>
                ) : (
                  <div className="text-sm text-blue-600">
                    ✅ {product.quantity} unidades disponíveis
                  </div>
                )}

                {/* Retail/Wholesale Toggle */}
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-600 mb-3">Tipo de compra:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      className={`p-3 rounded-lg border-2 transition-all ${
                        saleType === "varejo"
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      onClick={() => setSaleType("varejo")}
                    >
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">
                          Varejo
                        </p>
                        <p className="text-base font-bold text-gray-900 mt-1">
                          R$ {product.retailPrice.toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                    </button>
                    <button
                      className={`p-3 rounded-lg border-2 transition-all ${
                        saleType === "atacado"
                          ? "border-purple-600 bg-purple-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      onClick={() => setSaleType("atacado")}
                    >
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">
                          Atacado
                        </p>
                        <p className="text-base font-bold text-gray-900 mt-1">
                          R${" "}
                          {product.wholesalePrice.toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  {/* Preço Atual */}
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-4xl font-light text-gray-900">
                      R$ {price.toFixed(2).replace(".", ",")}
                    </span>
                  </div>

                  {/* Parcelamento com Mercado Pago */}
                  <div className="bg-blue-50 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
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
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        Subtotal ({quantity}{" "}
                        {quantity === 1 ? "unidade" : "unidades"}):{" "}
                        <span className="font-bold text-gray-900">
                          R$ {totalPrice.toFixed(2).replace(".", ",")}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Quantity */}
                {hasStock && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm text-gray-600">Quantidade:</span>
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={quantity <= 1}
                          onClick={() => handleQuantityChange(-1)}
                        >
                          <Minus size={16} />
                        </button>
                        <input
                          className="w-16 text-center border-x border-gray-300 py-2 outline-none"
                          max={product.quantity}
                          min={1}
                          type="number"
                          value={quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);

                            if (val >= 1 && val <= product.quantity) {
                              setQuantity(val);
                            }
                          }}
                        />
                        <button
                          className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={quantity >= product.quantity}
                          onClick={() => handleQuantityChange(1)}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <span className="text-sm text-gray-600">
                        ({product.quantity} disponíveis)
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  {hasStock ? (
                    <>
                      <Button
                        className="w-full font-semibold text-base bg-blue-500 text-white hover:bg-blue-600"
                        size="lg"
                        onPress={handleBuyNow}
                      >
                        Comprar agora
                      </Button>
                      <Button
                        className="w-full font-semibold text-base"
                        color="primary"
                        size="lg"
                        variant="bordered"
                        onPress={handleAddToCart}
                      >
                        Adicionar ao carrinho
                      </Button>
                    </>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                      <p className="font-medium text-red-700">
                        Produto indisponível
                      </p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Características e Descrição */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Características do Produto */}
          <div className="lg:col-span-7">
            <Card>
              <CardBody className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Características do produto
                </h2>
                <div className="space-y-3">
                  <div className="flex py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600 w-40">
                      Categoria
                    </span>
                    <span className="text-sm text-gray-900 font-medium">
                      {categoryLabels[product.category]}
                    </span>
                  </div>
                  {product.sku && (
                    <div className="flex py-2 border-b border-gray-200">
                      <span className="text-sm text-gray-600 w-40">SKU</span>
                      <span className="text-sm text-gray-900 font-medium">
                        {product.sku}
                      </span>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Descrição */}
            {product.description && (
              <Card className="mt-6">
                <CardBody className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Descrição
                  </h2>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                    {product.description}
                  </p>
                </CardBody>
              </Card>
            )}
          </div>
        </div>

        {/* Other Products */}
        {otherProducts.length > 0 && (
          <Card className="mt-8">
            <CardBody className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Outros produtos
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {otherProducts.map((otherProduct) => (
                  <ProductCard
                    key={otherProduct.id}
                    product={otherProduct}
                    saleType={saleType}
                  />
                ))}
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
