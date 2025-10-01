'use client';

import { BannerCarousel } from '@/components/banner';
import { ProductCard } from '@/components/products';
import { useProducts } from '@/hooks';
import { CategoriaProduto } from '@/models';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { Spinner } from '@heroui/spinner';
import { Switch } from '@heroui/switch';
import { Package, Search, ShoppingBag, Store } from 'lucide-react';

export default function Home() {
  const {
    products,
    loading,
    error,
    tipoVenda,
    setTipoVenda,
    categoriaFiltro,
    setCategoriaFiltro,
    searchTerm,
    setSearchTerm,
  } = useProducts();

  const categorias = [
    { value: 'TODOS', label: 'Todas as Categorias' },
    { value: 'MEIAS_MASCULINAS', label: 'Meias Masculinas' },
    { value: 'MEIAS_FEMININAS', label: 'Meias Femininas' },
    { value: 'MEIAS_INFANTIS', label: 'Meias Infantis' },
    { value: 'MEIAS_ESPORTIVAS', label: 'Meias Esportivas' },
    { value: 'MEIAS_SOCIAIS', label: 'Meias Sociais' },
    { value: 'MEIAS_TERMICAS', label: 'Meias Térmicas' },
    { value: 'ACESSORIOS', label: 'Acessórios' },
    { value: 'OUTROS', label: 'Outros' },
  ];

  const banners = [
    {
      id: '1',
      image: '/banners-apresentacao/carro-chefe-apresentacao1.jpeg',
      alt: 'Promoção 1 - Distribuidora de Meias',
      link: '/',
    },
    {
      id: '2',
      image: '/banners-apresentacao/carro-chefe-apresentacao2.webp',
      alt: 'Promoção 2 - Ofertas Especiais',
      link: '/',
    },
    // Adicione mais banners aqui conforme necessário
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Carrossel de Banners */}
      <BannerCarousel banners={banners} autoPlayInterval={5000} />

      {/* Filtros - Estilo ML */}
      <section className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-2 sm:px-4 py-4 max-w-7xl">
          {/* Toggle Varejo/Atacado */}
          <div className="flex items-center justify-center mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3 bg-gray-50 rounded-full px-4 py-2 border border-gray-200">
              <div className="flex items-center gap-2">
                <Store size={18} className={tipoVenda === 'varejo' ? 'text-blue-600' : 'text-gray-400'} />
                <span className={`text-sm font-medium transition-all ${tipoVenda === 'varejo' ? 'text-blue-600' : 'text-gray-500'}`}>
                  Varejo
                </span>
              </div>

              <Switch
                isSelected={tipoVenda === 'atacado'}
                onValueChange={(checked: boolean) => setTipoVenda(checked ? 'atacado' : 'varejo')}
                size="sm"
                color="secondary"
              />

              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium transition-all ${tipoVenda === 'atacado' ? 'text-purple-600' : 'text-gray-500'}`}>
                  Atacado
                </span>
                <Package size={18} className={tipoVenda === 'atacado' ? 'text-purple-600' : 'text-gray-400'} />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 items-center">
            {/* Busca */}
            <div className="flex-1 w-full">
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onValueChange={setSearchTerm}
                startContent={<Search size={18} className="text-gray-400" />}
                classNames={{
                  input: 'text-sm',
                  inputWrapper: 'bg-gray-50 border border-gray-300 hover:border-gray-400 shadow-none',
                }}
                radius="sm"
              />
            </div>

            {/* Filtro de Categoria */}
            <div className="w-full md:w-64">
              <Select
                placeholder="Categoria"
                selectedKeys={[categoriaFiltro]}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategoriaFiltro(e.target.value as CategoriaProduto | 'TODOS')}
                classNames={{
                  trigger: 'bg-gray-50 border border-gray-300 hover:border-gray-400',
                }}
                radius="sm"
              >
                {categorias.map((cat) => (
                  <SelectItem key={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>

          {/* Indicadores */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <ShoppingBag size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600">
                {products.length} {products.length === 1 ? 'resultado' : 'resultados'}
              </span>
            </div>

            {searchTerm && (
              <Button
                size="sm"
                variant="light"
                onPress={() => setSearchTerm('')}
                className="text-blue-600"
              >
                Limpar busca
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Grid de Produtos - Estilo ML */}
      <section className="container mx-auto px-2 sm:px-4 py-6 max-w-7xl">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner size="lg" color="primary" />
            <span className="ml-3 text-gray-600">Carregando produtos...</span>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-red-600 text-lg font-medium mb-4">{error}</p>
            <Button
              color="primary"
              onPress={() => window.location.reload()}
            >
              Tentar novamente
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-800 mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-gray-600">
              {searchTerm || categoriaFiltro !== 'TODOS'
                ? 'Tente ajustar os filtros ou buscar por outros termos.'
                : 'Nenhum produto disponível no momento.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                tipoVenda={tipoVenda}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
