"use client";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Spinner } from "@heroui/spinner";
import { Package, Search, ShoppingBag, Store } from "lucide-react";

import { BannerCarousel } from "@/components/banner";
import { ProductCard } from "@/components/products";
import { useProducts } from "@/hooks";
import { ProductCategory } from "@/models";

export default function Home() {
  const {
    products,
    loading,
    error,
    saleType,
    setSaleType,
    categoryFilter,
    setCategoryFilter,
    searchTerm,
    setSearchTerm,
  } = useProducts();

  const categorias = [
    { value: "TODOS", label: "Todas as Categorias" },
    { value: "MENS_SOCKS", label: "Meias Masculinas" },
    { value: "WOMENS_SOCKS", label: "Meias Femininas" },
    { value: "KIDS_SOCKS", label: "Meias Infantis" },
    { value: "SPORTS_SOCKS", label: "Meias Esportivas" },
    { value: "DRESS_SOCKS", label: "Meias Sociais" },
    { value: "THERMAL_SOCKS", label: "Meias Térmicas" },
    { value: "ACCESSORIES", label: "Acessórios" },
    { value: "OTHER", label: "Outros" },
  ];

  const banners = [
    {
      id: "1",
      image: "/banners-apresentacao/desktop/carro-chefe-desktop.png",
      imageMobile: "/banners-apresentacao/mobile/carro-chefe-mobile.png",
      alt: "Promoção 1 - Distribuidora de Meias",
      link: "/",
    },
    {
      id: "2",
      image: "/banners-apresentacao/desktop/carro-chefe-desktop-2.png",
      imageMobile: "/banners-apresentacao/mobile/carro-chefe-mobile-2.png",
      alt: "Promoção 2 - Ofertas Especiais",
      link: "/",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Carrossel de Banners */}
      <BannerCarousel autoPlayInterval={10000} banners={banners} />

      {/* Categorias em Destaque */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 border-b border-gray-200">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Explore por Categoria
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categorias.slice(1).map((cat) => (
              <Button
                key={cat.value}
                className={`h-auto py-4 px-3 flex flex-col gap-2 ${categoryFilter === cat.value
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border-2 border-gray-200"
                  }`}
                variant={categoryFilter === cat.value ? "solid" : "bordered"}
                onPress={() =>
                  setCategoryFilter(cat.value as ProductCategory | "TODOS")
                }
              >
                <span className="text-2xl">
                  {cat.value === "MENS_SOCKS" && "👔"}
                  {cat.value === "WOMENS_SOCKS" && "👗"}
                  {cat.value === "KIDS_SOCKS" && "👶"}
                  {cat.value === "SPORTS_SOCKS" && "⚽"}
                  {cat.value === "DRESS_SOCKS" && "🎩"}
                  {cat.value === "THERMAL_SOCKS" && "🧥"}
                  {cat.value === "ACCESSORIES" && "🎁"}
                  {cat.value === "OTHER" && "📦"}
                </span>
                <span className="text-xs font-semibold text-center leading-tight">
                  {cat.label}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Filtros Modernos */}
      <section className="bg-white border-b border-gray-200 shadow-sm sticky top-[86px] z-40">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          {/* Toggle Varejo/Atacado - Moderno e arredondado */}
          <div className="flex items-center justify-center mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full px-6 py-3 shadow-md border-2 border-gray-100">
              <Button
                className={`rounded-full font-bold transition-all ${saleType === "varejo"
                  ? "bg-blue-600 text-white shadow-lg scale-105"
                  : "bg-white text-gray-600"
                  }`}
                size="md"
                startContent={<Store size={18} />}
                onPress={() => setSaleType("varejo")}
              >
                Varejo
              </Button>

              <div className="h-8 w-px bg-gray-300" />

              <Button
                className={`rounded-full font-bold transition-all ${saleType === "atacado"
                  ? "bg-purple-600 text-white shadow-lg scale-105"
                  : "bg-white text-gray-600"
                  }`}
                size="md"
                startContent={<Package size={18} />}
                onPress={() => setSaleType("atacado")}
              >
                Atacado
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 items-center">
            {/* Busca com botão lupa */}
            <div className="flex-1 w-full">
              <Input
                classNames={{
                  input: "text-sm",
                  inputWrapper:
                    "bg-gray-50 border-2 border-gray-300 hover:border-blue-400 shadow-sm",
                }}
                endContent={
                  <Button
                    isIconOnly
                    className="bg-blue-600 text-white min-w-10"
                    size="sm"
                  >
                    <Search size={18} />
                  </Button>
                }
                placeholder="Buscar produtos..."
                radius="lg"
                size="lg"
                value={searchTerm}
                onValueChange={setSearchTerm}
              />
            </div>

            {/* Filtro de Categoria - Mais evidente */}
            <div className="w-full md:w-80">
              <Select
                classNames={{
                  trigger:
                    "bg-gray-50 border-2 border-gray-300 hover:border-blue-400 shadow-sm",
                }}
                label="Filtrar por categoria"
                radius="lg"
                selectedKeys={[categoryFilter]}
                size="lg"
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setCategoryFilter(
                    e.target.value as ProductCategory | "TODOS",
                  )
                }
              >
                {categorias.map((cat) => (
                  <SelectItem key={cat.value}>{cat.label}</SelectItem>
                ))}
              </Select>
            </div>
          </div>

          {/* Indicadores */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="text-blue-600" size={18} />
              <span className="text-sm font-semibold text-gray-700">
                {products.length}{" "}
                {products.length === 1
                  ? "produto encontrado"
                  : "produtos encontrados"}
              </span>
            </div>

            {searchTerm && (
              <Button
                className="text-blue-600 font-semibold"
                size="sm"
                variant="light"
                onPress={() => setSearchTerm("")}
              >
                Limpar busca
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Grid de Produtos - Otimizado */}
      <section className="container mx-auto px-4 py-6 max-w-7xl">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Spinner color="primary" size="lg" />
            <span className="ml-3 text-gray-700 font-medium">
              Carregando produtos...
            </span>
          </div>
        ) : error ? (
          <div className="bg-gradient-to-br from-red-50 to-white rounded-xl shadow-md p-12 text-center border-2 border-red-100">
            <p className="text-red-600 text-lg font-bold mb-4">{error}</p>
            <Button
              className="font-bold"
              color="danger"
              size="lg"
              variant="shadow"
              onPress={() => window.location.reload()}
            >
              Tentar novamente
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-md p-12 text-center border-2 border-gray-100">
            <Package className="mx-auto text-gray-300 mb-4" size={80} />
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Nenhum produto encontrado
            </h3>
            <p className="text-gray-600 text-lg">
              {searchTerm || categoryFilter !== "TODOS"
                ? "Tente ajustar os filtros ou buscar por outros termos."
                : "Nenhum produto disponível no momento."}
            </p>
            {(searchTerm || categoryFilter !== "TODOS") && (
              <Button
                className="mt-6 font-bold"
                color="primary"
                size="lg"
                variant="shadow"
                onPress={() => {
                  setSearchTerm("");
                  setCategoryFilter("TODOS");
                }}
              >
                Ver Todos os Produtos
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Título da seção de produtos */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {categoryFilter === "TODOS"
                  ? "Todos os Produtos"
                  : categorias.find((c) => c.value === categoryFilter)?.label}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Confira nossa seleção especial para você
              </p>
            </div>

            {/* Grid otimizado - menos espaço, mais produtos visíveis */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  saleType={saleType}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
