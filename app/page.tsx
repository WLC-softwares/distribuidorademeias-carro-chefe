"use client";

import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { Checkbox } from "@heroui/checkbox";
import { Input } from "@heroui/input";
import { Pagination } from "@heroui/pagination";
import { Select, SelectItem } from "@heroui/select";
import { Package, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

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

  const [showFilters, setShowFilters] = useState(true);
  const [sortBy, setSortBy] = useState("relevance");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // const mockProdutos: Product[] = Array.from({ length: 100 }, (_, i) => {
  //   const categories: ProductCategory[] = [
  //     "MENS_SOCKS",
  //     "WOMENS_SOCKS",
  //     "KIDS_SOCKS",
  //     "SPORTS_SOCKS",
  //     "DRESS_SOCKS",
  //     "THERMAL_SOCKS",
  //     "ACCESSORIES",
  //     "OTHER",
  //   ];

  //   const nomes = [
  //     "Meias Cano Alto",
  //     "Meias Invisíveis",
  //     "Meias Esportivas",
  //     "Meias Térmicas",
  //     "Meias Sociais",
  //     "Kit 3 Pares de Meias",
  //     "Kit 6 Pares de Meias",
  //     "Meias Antiderrapante",
  //     "Meias Listradas",
  //     "Meias Estampadas",
  //     "Meias Básicas",
  //     "Meias de Algodão",
  //     "Meias de Lã",
  //     "Meias Coloridas",
  //     "Meias Brancas",
  //     "Meias Pretas",
  //     "Meias Cinza",
  //     "Meias Infantis Divertidas",
  //     "Meias Compressão",
  //     "Meias Cano Médio",
  //   ];

  //   const marcas = ["Lupo", "Puma", "Nike", "Adidas", "Fila", "Mash", "Trifil", "Puket"];
  //   const cores = ["Preta", "Branca", "Cinza", "Azul", "Vermelha", "Rosa", "Verde", "Amarela", "Laranja"];

  //   const category = categories[i % categories.length];
  //   const nome = nomes[i % nomes.length];
  //   const marca = marcas[i % marcas.length];
  //   const cor = cores[i % cores.length];

  //   const retailPrice = parseFloat((Math.random() * 50 + 10).toFixed(2));
  //   const wholesalePrice = parseFloat((retailPrice * 0.7).toFixed(2));

  //   return {
  //     id: `prod-${i + 1}`,
  //     name: `${marca} ${nome} ${cor}`,
  //     description: `${nome} ${cor} da marca ${marca}. Produto de alta qualidade, confortável e durável. Ideal para uso diário.`,
  //     retailPrice,
  //     wholesalePrice,
  //     quantity: Math.floor(Math.random() * 200) + 10,
  //     weight: parseFloat((Math.random() * 0.2 + 0.05).toFixed(3)),
  //     status: "ACTIVE" as const,
  //     category,
  //     sku: `SKU-${marca.substring(0, 3).toUpperCase()}-${(i + 1).toString().padStart(5, "0")}`,
  //     active: true,
  //     createdAt: new Date(),
  //     updatedAt: new Date(),
  //     images: [
  //       {
  //         id: `img-${i + 1}-1`,
  //         url: `https://placehold.co/400x400/e5e7eb/6b7280?text=${encodeURIComponent(marca + " " + nome)}`,
  //         alt: `${marca} ${nome} ${cor}`,
  //         order: 0,
  //         primary: true,
  //         productId: `prod-${i + 1}`,
  //         createdAt: new Date(),
  //       },
  //       {
  //         id: `img-${i + 1}-2`,
  //         url: `https://placehold.co/400x400/f3f4f6/9ca3af?text=${encodeURIComponent(marca)}`,
  //         alt: `${marca} ${nome} ${cor} - detalhe`,
  //         order: 1,
  //         primary: false,
  //         productId: `prod-${i + 1}`,
  //         createdAt: new Date(),
  //       },
  //     ],
  //   };
  // });

  // Exibir apenas o mock para teste
  const displayProducts = products;

  // Cálculo da paginação
  const totalPages = Math.ceil(displayProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = displayProducts.slice(startIndex, endIndex);

  // Reset da página quando mudar filtros
  const handleCategoryChange = (category: ProductCategory | "TODOS") => {
    setCategoryFilter(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Scroll suave para o topo ao mudar de página
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const categorias = [
    { value: "TODOS", label: "Todas as Categorias", emoji: "📦" },
    { value: "MENS_SOCKS", label: "Meias Masculinas", emoji: "👔" },
    { value: "WOMENS_SOCKS", label: "Meias Femininas", emoji: "👗" },
    { value: "KIDS_SOCKS", label: "Meias Infantis", emoji: "👶" },
    { value: "SPORTS_SOCKS", label: "Meias Esportivas", emoji: "⚽" },
    { value: "DRESS_SOCKS", label: "Meias Sociais", emoji: "🎩" },
    { value: "THERMAL_SOCKS", label: "Meias Térmicas", emoji: "🧥" },
    { value: "ACCESSORIES", label: "Acessórios", emoji: "🎁" },
    { value: "OTHER", label: "Outros", emoji: "📦" },
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
    <div className="min-h-screen bg-gray-50">
      {/* Carrossel de Banners */}
      <BannerCarousel autoPlayInterval={10000} banners={banners} />
      {/* Layout Principal com Sidebar */}
      <div className="container mx-auto px-4 py-4 max-w-[1400px]">
        <div className="flex gap-4">
          {/* Sidebar de Filtros */}
          <aside
            className={`${
              showFilters ? "w-64" : "w-0"
            } transition-all duration-300 overflow-hidden flex-shrink-0`}
          >
            <Card className="p-4 sticky top-24">
              {/* Título e Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b">
                <h3 className="font-bold text-gray-900">Filtros</h3>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() => setShowFilters(false)}
                >
                  ✕
                </Button>
              </div>

              {/* Tipo de Venda */}
              <div className="mb-6">
                <h4 className="font-semibold text-sm text-gray-900 mb-3">
                  Tipo de Venda
                </h4>
                <div className="flex flex-col gap-2">
                  <Checkbox
                    isSelected={saleType === "varejo"}
                    size="sm"
                    onValueChange={() => setSaleType("varejo")}
                  >
                    <span className="text-sm">Varejo</span>
                  </Checkbox>
                  <Checkbox
                    isSelected={saleType === "atacado"}
                    size="sm"
                    onValueChange={() => setSaleType("atacado")}
                  >
                    <span className="text-sm">Atacado</span>
                  </Checkbox>
                </div>
              </div>

              {/* Categorias */}
              <div className="mb-6">
                <h4 className="font-semibold text-sm text-gray-900 mb-3">
                  Categorias
                </h4>
                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                  {categorias.map((cat) => (
                    <Button
                      key={cat.value}
                      className={`justify-start text-sm h-auto py-2 ${
                        categoryFilter === cat.value
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "bg-transparent text-gray-700"
                      }`}
                      variant="light"
                      onPress={() =>
                        handleCategoryChange(
                          cat.value as ProductCategory | "TODOS",
                        )
                      }
                    >
                      <span className="mr-2">{cat.emoji}</span>
                      {cat.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Busca */}
              <div className="mb-4">
                <Input
                  classNames={{
                    input: "text-sm",
                    inputWrapper: "h-10",
                  }}
                  placeholder="Buscar..."
                  size="sm"
                  startContent={<Search size={16} />}
                  value={searchTerm}
                  onValueChange={handleSearchChange}
                />
              </div>
            </Card>
          </aside>

          {/* Área Principal de Conteúdo */}
          <main className="flex-1 min-w-0">
            {/* Header com Título e Ordenação */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-normal text-gray-900">Meias</h1>
                <p className="text-sm text-gray-600">
                  {displayProducts.length}{" "}
                  {displayProducts.length === 1 ? "resultado" : "resultados"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {!showFilters && (
                  <Button
                    size="sm"
                    startContent={<SlidersHorizontal size={16} />}
                    variant="bordered"
                    onPress={() => setShowFilters(true)}
                  >
                    Filtros
                  </Button>
                )}

                <Select
                  classNames={{
                    trigger: "h-10 min-w-[180px]",
                  }}
                  label="Ordenar por"
                  selectedKeys={[sortBy]}
                  size="sm"
                  variant="bordered"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <SelectItem key="relevance">Mais relevantes</SelectItem>
                  <SelectItem key="price-asc">Menor preço</SelectItem>
                  <SelectItem key="price-desc">Maior preço</SelectItem>
                  <SelectItem key="newest">Mais recentes</SelectItem>
                </Select>
              </div>
            </div>

            {/* Grid de Produtos */}
            {displayProducts.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
                <Package className="mx-auto text-gray-300 mb-4" size={60} />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Nenhum produto encontrado
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || categoryFilter !== "TODOS"
                    ? "Tente ajustar os filtros ou buscar por outros termos."
                    : "Nenhum produto disponível no momento."}
                </p>
                {(searchTerm || categoryFilter !== "TODOS") && (
                  <Button
                    color="primary"
                    onPress={() => {
                      setSearchTerm("");
                      handleCategoryChange("TODOS");
                    }}
                  >
                    Ver Todos os Produtos
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {paginatedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      saleType={saleType}
                    />
                  ))}
                </div>

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-8">
                    <Pagination
                      showControls
                      classNames={{
                        cursor: "bg-blue-600 text-white",
                      }}
                      color="primary"
                      page={currentPage}
                      total={totalPages}
                      onChange={setCurrentPage}
                    />
                    <p className="text-sm text-gray-600">
                      Mostrando {startIndex + 1}-
                      {Math.min(endIndex, displayProducts.length)} de{" "}
                      {displayProducts.length} produtos
                    </p>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
