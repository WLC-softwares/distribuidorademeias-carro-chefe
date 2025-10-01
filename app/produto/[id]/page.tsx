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

import { useCart } from "@/hooks";
import { getProductByIdAction, getProductsAction } from "@/controllers";
import { ImageCarousel, ProductCard } from "@/components/products";
import { CartDrawer } from "@/components/cart";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [tipoVenda, setTipoVenda] = useState<"varejo" | "atacado">("varejo");
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
          // Carregar produtos relacionados
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
        // Filtrar produtos da mesma categoria, excluindo o produto atual
        let related = allProducts.filter(
          (p) =>
            p.categoria === currentProduct.categoria &&
            p.id !== currentProduct.id &&
            p.ativo &&
            p.status === "ATIVO",
        );

        // Se não houver produtos da mesma categoria, pegar produtos aleatórios
        if (related.length === 0) {
          related = allProducts.filter(
            (p) =>
              p.id !== currentProduct.id && p.ativo && p.status === "ATIVO",
          );
        }

        // Embaralhar e pegar até 8 produtos
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

  const handleQuantidadeChange = (delta: number) => {
    const newQuantidade = quantidade + delta;

    if (newQuantidade >= 1 && product && newQuantidade <= product.quantidade) {
      setQuantidade(newQuantidade);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    try {
      addItem(product, quantidade, tipoVenda);
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
      addItem(product, quantidade, tipoVenda);
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

  const preco = product.preco;
  const precoTotal = preco * quantidade;
  const temEstoque = product.quantidade > 0 && product.status === "ATIVO";

  const categoriaLabels: Record<string, string> = {
    MEIAS_MASCULINAS: "Meias Masculinas",
    MEIAS_FEMININAS: "Meias Femininas",
    MEIAS_INFANTIS: "Meias Infantis",
    MEIAS_ESPORTIVAS: "Meias Esportivas",
    MEIAS_SOCIAIS: "Meias Sociais",
    MEIAS_TERMICAS: "Meias Térmicas",
    ACESSORIOS: "Acessórios",
    OUTROS: "Outros",
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Mensagem de Sucesso */}
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
                  {quantidade}x {product?.nome}
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Breadcrumb e Voltar */}
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

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna 1: Imagens */}
          <div className="lg:col-span-2">
            <Card className="p-4">
              <CardBody>
                <ImageCarousel
                  images={product.imagens || []}
                  productName={product.nome}
                />
              </CardBody>
            </Card>
          </div>

          {/* Coluna 2: Informações e Compra */}
          <div className="space-y-4">
            {/* Card de Informações */}
            <Card>
              <CardBody className="p-6 space-y-4">
                {/* Status e Categoria */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Chip
                    className={`font-semibold ${
                      tipoVenda === "atacado"
                        ? "bg-purple-600 text-white"
                        : "bg-green-600 text-white"
                    }`}
                    size="sm"
                    variant="solid"
                  >
                    {tipoVenda === "atacado" ? "Atacado" : "Varejo"}
                  </Chip>
                  <Chip size="sm" variant="flat">
                    {categoriaLabels[product.categoria]}
                  </Chip>
                  {product.sku && (
                    <span className="text-xs text-gray-500">
                      SKU: {product.sku}
                    </span>
                  )}
                </div>

                {/* Título */}
                <h1 className="text-xl font-medium text-gray-900">
                  {product.nome}
                </h1>

                {/* Preço */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-normal">R$</span>
                    <span className="text-5xl font-light">
                      {Math.floor(preco)}
                    </span>
                    <span className="text-2xl font-light">
                      {(preco % 1).toFixed(2).substring(1)}
                    </span>
                  </div>
                </div>

                {/* Toggle Varejo/Atacado */}
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-600 mb-3">
                    Selecione o tipo de compra:
                  </p>
                  <div className="flex gap-2">
                    <Button
                      className={`flex-1 ${tipoVenda === "varejo" ? "bg-green-600 text-white" : ""}`}
                      variant={tipoVenda === "varejo" ? "solid" : "bordered"}
                      onPress={() => setTipoVenda("varejo")}
                    >
                      Varejo
                    </Button>
                    <Button
                      className={`flex-1 ${tipoVenda === "atacado" ? "bg-purple-600 text-white" : ""}`}
                      variant={tipoVenda === "atacado" ? "solid" : "bordered"}
                      onPress={() => setTipoVenda("atacado")}
                    >
                      Atacado
                    </Button>
                  </div>
                </div>

                {/* Quantidade */}
                {temEstoque && (
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-600 mb-3">
                      Quantidade:
                      <span className="text-gray-500 ml-2">
                        ({product.quantidade} disponíveis)
                      </span>
                    </p>
                    <div className="flex items-center gap-3">
                      <Button
                        isIconOnly
                        isDisabled={quantidade <= 1}
                        size="sm"
                        variant="bordered"
                        onPress={() => handleQuantidadeChange(-1)}
                      >
                        <Minus size={16} />
                      </Button>
                      <Input
                        className="w-20"
                        classNames={{
                          input: "text-center",
                        }}
                        size="sm"
                        type="number"
                        value={quantidade.toString()}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);

                          if (val >= 1 && val <= product.quantidade) {
                            setQuantidade(val);
                          }
                        }}
                      />
                      <Button
                        isIconOnly
                        isDisabled={quantidade >= product.quantidade}
                        size="sm"
                        variant="bordered"
                        onPress={() => handleQuantidadeChange(1)}
                      >
                        <Plus size={16} />
                      </Button>
                    </div>

                    {quantidade > 1 && (
                      <p className="text-sm text-gray-600 mt-2">
                        Total:{" "}
                        <span className="font-semibold">
                          R$ {precoTotal.toFixed(2)}
                        </span>
                      </p>
                    )}
                  </div>
                )}

                {/* Botões de Ação */}
                <div className="space-y-2 pt-4">
                  {temEstoque ? (
                    <>
                      <Button
                        className="w-full font-semibold"
                        color="primary"
                        size="lg"
                        startContent={<ShoppingCart size={20} />}
                        onPress={handleAddToCart}
                      >
                        Adicionar ao carrinho
                      </Button>
                      <Button
                        className="w-full font-semibold"
                        color="secondary"
                        size="lg"
                        variant="flat"
                        onPress={handleBuyNow}
                      >
                        Comprar agora
                      </Button>
                    </>
                  ) : (
                    <Chip
                      className="w-full justify-center py-6"
                      color="danger"
                      variant="flat"
                    >
                      Produto indisponível
                    </Chip>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Descrição do Produto */}
        {product.descricao && (
          <Card className="mt-6">
            <CardBody className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Descrição do produto
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {product.descricao}
              </p>
            </CardBody>
          </Card>
        )}

        {/* Produtos Relacionados */}
        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Você também pode gostar
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  tipoVenda={tipoVenda}
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
