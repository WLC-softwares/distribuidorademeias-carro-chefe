"use client";

import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Image } from "@heroui/image";
import { Input } from "@heroui/input";
import { Pagination } from "@heroui/pagination";
import { Select, SelectItem } from "@heroui/select";
import { Spinner } from "@heroui/spinner";
import { AlertCircle, Search, ShoppingBag, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getUserSalesAction } from "@/controllers";
import { useSession } from "@/hooks";

interface Sale {
  id: string;
  saleNumber: string;
  status: string;
  total: number;
  createdAt: Date;
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    product: {
      name: string;
      images: { url: string }[];
    };
  }[];
}

const statusMap: Record<
  string,
  { color: "default" | "warning" | "success" | "danger"; label: string }
> = {
  PENDING: { color: "warning", label: "Aguardando Pagamento" },
  PROCESSING: { color: "warning", label: "Processando" },
  PAID: { color: "success", label: "Pago" },
  SHIPPED: { color: "success", label: "Enviado" },
  DELIVERED: { color: "success", label: "Entregue" },
  CANCELED: { color: "danger", label: "Cancelado" },
  REFUNDED: { color: "default", label: "Reembolsado" },
};

const ITEMS_PER_PAGE = 5;

export default function PedidosPage() {
  const { user, isLoading } = useSession();
  const [pedidos, setPedidos] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchPedidos = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const vendas = await getUserSalesAction(user.id);

        setPedidos(vendas as any);
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchPedidos();
    }
  }, [user?.id]);

  // Filtrar pedidos
  const filteredPedidos = useMemo(() => {
    return pedidos.filter((pedido) => {
      const matchesSearch =
        pedido.saleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pedido.items.some((item) =>
          item.product.name.toLowerCase().includes(searchTerm.toLowerCase()),
        );

      const matchesStatus =
        statusFilter === "all" || pedido.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [pedidos, searchTerm, statusFilter]);

  // Calcular pedidos paginados
  const paginatedPedidos = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;

    return filteredPedidos.slice(start, end);
  }, [filteredPedidos, currentPage]);

  const totalPages = Math.ceil(filteredPedidos.length / ITEMS_PER_PAGE);

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner color="warning" size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Compras</h1>
      </div>

      {/* Barra de Busca e Filtros */}
      <Card className="shadow-sm">
        <CardBody className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Campo de busca */}
            <div className="w-full md:w-96">
              <Input
                classNames={{
                  input: "text-sm",
                  inputWrapper: "h-10",
                }}
                placeholder="Busque por compra, marca e mais..."
                startContent={<Search className="text-gray-400" size={18} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filtros */}
            <div className="flex gap-3 w-full md:w-auto">
              <Select
                className="w-full md:w-40"
                classNames={{
                  trigger: "h-10",
                  value: "text-sm",
                }}
                placeholder="Status"
                selectedKeys={statusFilter === "all" ? [] : [statusFilter]}
                onChange={(e) => setStatusFilter(e.target.value || "all")}
              >
                <SelectItem key="all">Todos</SelectItem>
                <SelectItem key="PENDING">Pendente</SelectItem>
                <SelectItem key="PAID">Pago</SelectItem>
                <SelectItem key="SHIPPED">Enviado</SelectItem>
                <SelectItem key="DELIVERED">Entregue</SelectItem>
                <SelectItem key="CANCELED">Cancelado</SelectItem>
              </Select>
            </div>

            {/* Contador de compras */}
            <div className="ml-auto">
              <span className="text-sm text-gray-600 font-medium">
                {filteredPedidos.length}{" "}
                {filteredPedidos.length === 1 ? "compra" : "compras"}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Lista de Pedidos */}
      {filteredPedidos.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <ShoppingBag className="text-gray-400" size={48} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-700">
                  {pedidos.length === 0
                    ? "Nenhum pedido encontrado"
                    : "Nenhum pedido corresponde aos filtros"}
                </h3>
                <p className="text-gray-600 mt-2">
                  {pedidos.length === 0
                    ? "Você ainda não fez nenhum pedido"
                    : "Tente ajustar os filtros de busca"}
                </p>
              </div>
              {pedidos.length === 0 && (
                <Button
                  as="a"
                  className="mt-4 font-semibold"
                  color="warning"
                  href="/"
                >
                  Começar a Comprar
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedPedidos.map((pedido) => {
              const isDelivered = pedido.status === "DELIVERED";
              const isShipped = pedido.status === "SHIPPED";
              const isPending = pedido.status === "PENDING";

              return (
                <Card
                  key={pedido.id}
                  className={`hover:shadow-md transition-shadow ${
                    isPending ? "border-2 border-warning-200" : ""
                  }`}
                >
                  <CardBody className="p-6">
                    {/* Data do pedido */}
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-sm text-gray-600 font-medium">
                        {new Date(pedido.createdAt).toLocaleDateString(
                          "pt-BR",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>

                    {/* Alerta de Pagamento Pendente */}
                    {isPending && (
                      <div className="mb-4 p-3 bg-warning-50 rounded-lg border border-warning-200">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-warning-500 rounded-full">
                            <AlertCircle className="text-white" size={16} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-warning-700">
                              Aguardando Pagamento
                            </p>
                            <p className="text-xs text-warning-600 mt-0.5">
                              Complete o pagamento para que seu pedido seja
                              processado
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Status de entrega */}
                    {(isDelivered || isShipped) && (
                      <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-green-500 rounded-full">
                            <Truck className="text-white" size={16} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-green-700">
                              {isDelivered ? "Entregue" : "Enviado"}
                            </p>
                            <p className="text-xs text-green-600 mt-0.5">
                              {isDelivered
                                ? `Chegou no dia ${new Date(pedido.createdAt).toLocaleDateString("pt-BR")}`
                                : "A caminho"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Itens do Pedido */}
                    <div className="space-y-4">
                      {pedido.items.map((item, index) => (
                        <div key={item.id}>
                          <div className="flex gap-4">
                            <Image
                              alt={item.product.name}
                              className="rounded-lg object-cover flex-shrink-0"
                              height={80}
                              src={
                                item.product.images[0]?.url ||
                                "/placeholder.png"
                              }
                              width={80}
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-800 text-sm line-clamp-2">
                                {item.product.name}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {item.quantity}{" "}
                                {item.quantity === 1 ? "unidade" : "unidades"}
                              </p>
                            </div>
                          </div>
                          {index < pedido.items.length - 1 && (
                            <Divider className="my-3" />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Rodapé com ações e status */}
                    <Divider className="my-4" />
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Chip
                          color={statusMap[pedido.status]?.color || "default"}
                          size="sm"
                          variant="flat"
                        >
                          {statusMap[pedido.status]?.label || pedido.status}
                        </Chip>
                        <span className="text-xs text-gray-500">
                          Pedido #{pedido.saleNumber}
                        </span>
                      </div>

                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          as="a"
                          className="flex-1 sm:flex-none"
                          color="primary"
                          href={`/user/orders/${pedido.id}`}
                          size="sm"
                          variant="bordered"
                        >
                          Ver compra
                        </Button>
                        <Button
                          className="flex-1 sm:flex-none"
                          color="primary"
                          size="sm"
                          variant="flat"
                        >
                          Comprar novamente
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center py-6">
              <Pagination
                showControls
                color="warning"
                page={currentPage}
                total={totalPages}
                onChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
