"use client";

import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Spinner } from "@heroui/spinner";
import {
  Eye,
  Filter,
  MapPin,
  Package,
  Search,
  Truck,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Divider } from "@heroui/divider";

import { CreateShipmentFromSaleModal } from "@/components/shipping";
import { getAllSalesAction, updateSaleStatusAction } from "@/controllers";
import { formatCurrency } from "@/utils";

interface Sale {
  id: string;
  saleNumber: string;
  status: string;
  total: number;
  subtotal: number;
  discount: number;
  paymentMethod: string;
  createdAt: Date;
  user: {
    name: string;
    email: string;
  };
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    total: number;
    product: {
      id: string;
      name: string;
      images: { url: string }[];
    };
  }[];
  shippingZipCode?: string | null;
  shippingStreet?: string | null;
  shippingNumber?: string | null;
  shippingComplement?: string | null;
  shippingNeighborhood?: string | null;
  shippingCity?: string | null;
  shippingState?: string | null;
  shippingCountry?: string | null;
  melhorEnvioOrderId?: string | null;
  trackingCode?: string | null;
  shippingService?: string | null;
  shippingCompany?: string | null;
  shippingCost?: number | null;
  serviceId?: string | null;
}

const statusOptions = [
  { value: "PENDING", label: "Pendente" },
  { value: "PROCESSING", label: "Processando" },
  { value: "PAID", label: "Paga" },
  { value: "SHIPPED", label: "Enviada" },
  { value: "DELIVERED", label: "Entregue" },
  { value: "CANCELED", label: "Cancelada" },
  { value: "REFUNDED", label: "Reembolsada" },
];

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [selectedSales, setSelectedSales] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<string>("");
  const [createShipmentModal, setCreateShipmentModal] = useState<{
    isOpen: boolean;
    saleId: string;
    saleNumber: string;
    destinationCep: string;
    shippingService?: string | null;
    shippingCompany?: string | null;
    shippingCost?: number | null;
    serviceId?: string | null;
  }>({
    isOpen: false,
    saleId: "",
    saleNumber: "",
    destinationCep: "",
    shippingService: null,
    shippingCompany: null,
    shippingCost: null,
    serviceId: null,
  });

  const fetchSales = async () => {
    try {
      setLoading(true);
      const sales = await getAllSalesAction();

      setSales(sales as any);
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
      toast.error("Erro ao buscar vendas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleStatusChange = async (saleId: string, newStatus: string) => {
    try {
      setUpdatingStatus(saleId);
      await updateSaleStatusAction(saleId, newStatus);
      toast.success("Status atualizado com sucesso!");
      await fetchSales();
    } catch (_error) {
      toast.error("Erro ao atualizar status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (selectedSales.size === 0) {
      toast.error("Selecione pelo menos uma venda");

      return;
    }
    if (!bulkStatus) {
      toast.error("Selecione um status");

      return;
    }

    try {
      setUpdatingStatus("bulk");
      const promises = Array.from(selectedSales).map((saleId) =>
        updateSaleStatusAction(saleId, bulkStatus),
      );

      await Promise.all(promises);
      toast.success(
        `${selectedSales.size} venda(s) atualizada(s) com sucesso!`,
      );
      setSelectedSales(new Set());
      setBulkStatus("");
      await fetchSales();
    } catch (_error) {
      toast.error("Erro ao atualizar status em massa");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleSelectAll = () => {
    if (selectedSales.size === filteredSales.length) {
      setSelectedSales(new Set());
    } else {
      setSelectedSales(new Set(filteredSales.map((sale) => sale.id)));
    }
  };

  const handleSelectSale = (saleId: string) => {
    const newSelected = new Set(selectedSales);

    if (newSelected.has(saleId)) {
      newSelected.delete(saleId);
    } else {
      newSelected.add(saleId);
    }
    setSelectedSales(newSelected);
  };

  const handleOpenCreateShipment = (sale: Sale) => {
    if (!sale.shippingZipCode) {
      toast.error("Venda sem endereço de entrega");

      return;
    }

    setCreateShipmentModal({
      isOpen: true,
      saleId: sale.id,
      saleNumber: sale.saleNumber,
      destinationCep: sale.shippingZipCode,
      shippingService: sale.shippingService,
      shippingCompany: sale.shippingCompany,
      shippingCost: sale.shippingCost,
      serviceId: sale.serviceId,
    });
  };

  const handleCloseCreateShipment = () => {
    setCreateShipmentModal({
      isOpen: false,
      saleId: "",
      saleNumber: "",
      destinationCep: "",
      shippingService: null,
      shippingCompany: null,
      shippingCost: null,
      serviceId: null,
    });
  };

  const filteredSales = sales.filter(
    (sale) =>
      sale.saleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.shippingCity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.shippingState?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalFinalizadas = sales.filter((s) => s.status === "DELIVERED").length;
  const receitaTotal = sales
    .filter(
      (s) =>
        s.status === "PAID" ||
        s.status === "SHIPPED" ||
        s.status === "DELIVERED",
    )
    .reduce((acc, sale) => acc + Number(sale.total), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner color="warning" size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Gerenciamento de Vendas
        </h1>
        <p className="text-gray-600 mt-1">
          Visualize e gerencie todas as vendas
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-md">
          <CardBody className="p-6">
            <p className="text-sm text-gray-600 font-medium">Total de Vendas</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {sales.length}
            </p>
          </CardBody>
        </Card>

        <Card className="shadow-md">
          <CardBody className="p-6">
            <p className="text-sm text-gray-600 font-medium">
              Vendas Finalizadas
            </p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {totalFinalizadas}
            </p>
          </CardBody>
        </Card>

        <Card className="shadow-md">
          <CardBody className="p-6">
            <p className="text-sm text-gray-600 font-medium">Receita Total</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {formatCurrency(receitaTotal)}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-md">
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              className="flex-1"
              classNames={{
                inputWrapper: "border-gray-300",
              }}
              placeholder="Buscar por número, cliente, email ou cidade..."
              startContent={<Search className="text-gray-400" size={18} />}
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <Button
              className="border-gray-300"
              startContent={<Filter size={18} />}
              variant="bordered"
            >
              Filtros
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Bulk Actions */}
      {selectedSales.size > 0 && (
        <Card className="shadow-md border-2 border-blue-500">
          <CardBody className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold">
                  {selectedSales.size} venda(s) selecionada(s)
                </div>
                <Button
                  color="danger"
                  size="sm"
                  variant="light"
                  onPress={() => setSelectedSales(new Set())}
                >
                  Limpar seleção
                </Button>
              </div>
              <div className="flex flex-1 flex-col md:flex-row gap-3 items-stretch md:items-center">
                <Select
                  className="flex-1 md:max-w-xs"
                  classNames={{
                    trigger: "border-gray-300",
                  }}
                  placeholder="Selecione um status"
                  selectedKeys={bulkStatus ? [bulkStatus] : []}
                  size="sm"
                  variant="bordered"
                  onSelectionChange={(keys) => {
                    const status = Array.from(keys)[0] as string;

                    setBulkStatus(status || "");
                  }}
                >
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value}>{status.label}</SelectItem>
                  ))}
                </Select>
                <Button
                  color="primary"
                  isDisabled={!bulkStatus || updatingStatus === "bulk"}
                  isLoading={updatingStatus === "bulk"}
                  size="md"
                  onPress={handleBulkStatusUpdate}
                >
                  Atualizar Status
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Sales Grid */}
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Vendas ({filteredSales.length})
          </h2>
          {selectedSales.size > 0 && (
            <Button
              color="danger"
              size="sm"
              variant="light"
              onPress={() => setSelectedSales(new Set())}
            >
              Limpar seleção ({selectedSales.size})
            </Button>
          )}
        </div>

        {filteredSales.length === 0 ? (
          <Card className="shadow-md">
            <CardBody className="text-center py-12 text-gray-500">
              Nenhuma venda encontrada
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredSales.map((sale) => (
              <Card
                key={sale.id}
                className={`shadow-md hover:shadow-lg transition-shadow ${
                  selectedSales.has(sale.id) ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <CardBody className="p-6">
                  <div className="space-y-4">
                    {/* Header do Card */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-4">
                        <input
                          checked={selectedSales.has(sale.id)}
                          className="mt-1 w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          type="checkbox"
                          onChange={() => handleSelectSale(sale.id)}
                        />
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            Pedido #{sale.saleNumber}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {new Date(sale.createdAt).toLocaleString("pt-BR", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Select
                          className="w-48"
                          classNames={{
                            trigger: "h-9",
                            value: "text-sm",
                          }}
                          isDisabled={updatingStatus === sale.id}
                          selectedKeys={[sale.status]}
                          size="sm"
                          onChange={(e) =>
                            handleStatusChange(sale.id, e.target.value)
                          }
                        >
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </Select>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(Number(sale.total))}
                          </p>
                          <p className="text-xs text-gray-500">
                            {sale.paymentMethod}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Divider />

                    {/* Grid de Informações */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Coluna 1: Cliente */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                          <User className="text-blue-600" size={18} />
                          Cliente
                        </h4>
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">
                            {sale.user.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {sale.user.email}
                          </p>
                        </div>
                      </div>

                      {/* Coluna 2: Endereço */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                          <MapPin className="text-green-600" size={18} />
                          Endereço de Entrega
                        </h4>
                        {sale.shippingCity ? (
                          <div className="text-sm space-y-1">
                            <p className="font-medium text-gray-900">
                              {sale.shippingCity} - {sale.shippingState}
                            </p>
                            <p className="text-gray-600">
                              {sale.shippingStreet}, {sale.shippingNumber}
                            </p>
                            {sale.shippingComplement && (
                              <p className="text-gray-600">
                                {sale.shippingComplement}
                              </p>
                            )}
                            <p className="text-gray-600">
                              {sale.shippingNeighborhood}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic">
                            Sem endereço
                          </p>
                        )}
                      </div>

                      {/* Coluna 3: Frete */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                          <Truck className="text-purple-600" size={18} />
                          Informações de Envio
                        </h4>
                        {sale.melhorEnvioOrderId ? (
                          <div className="space-y-2">
                            <Chip
                              color="success"
                              size="sm"
                              startContent={<Truck size={14} />}
                              variant="flat"
                            >
                              Envio Criado
                            </Chip>
                            {sale.shippingService && (
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">
                                  {sale.shippingCompany}
                                </span>{" "}
                                - {sale.shippingService}
                              </p>
                            )}
                            {sale.shippingCost && (
                              <p className="text-sm text-gray-600">
                                Frete:{" "}
                                {formatCurrency(Number(sale.shippingCost))}
                              </p>
                            )}
                            {sale.trackingCode && (
                              <p className="text-xs font-mono text-gray-500">
                                {sale.trackingCode}
                              </p>
                            )}
                          </div>
                        ) : sale.shippingZipCode ? (
                          <div className="space-y-2">
                            {sale.shippingService && sale.shippingCompany ? (
                              <>
                                <p className="text-sm text-gray-700">
                                  <span className="font-medium">
                                    Frete escolhido:
                                  </span>
                                </p>
                                <p className="text-sm text-gray-600">
                                  {sale.shippingCompany} -{" "}
                                  {sale.shippingService}
                                </p>
                                {sale.shippingCost && (
                                  <p className="text-sm text-gray-600">
                                    {formatCurrency(Number(sale.shippingCost))}
                                  </p>
                                )}
                              </>
                            ) : (
                              <p className="text-sm text-gray-500 italic">
                                Frete não selecionado
                              </p>
                            )}
                            <Button
                              color="primary"
                              size="sm"
                              startContent={<Package size={14} />}
                              variant="flat"
                              onPress={() => handleOpenCreateShipment(sale)}
                            >
                              Criar Envio
                            </Button>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic">
                            Sem endereço
                          </p>
                        )}
                      </div>
                    </div>

                    <Divider />

                    {/* Produtos */}
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Package className="text-orange-600" size={18} />
                        Produtos (
                        {sale.items.reduce(
                          (acc, item) => acc + item.quantity,
                          0,
                        )}{" "}
                        itens)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {sale.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            {item.product.images &&
                            item.product.images.length > 0 ? (
                              <img
                                alt={item.product.name}
                                className="w-16 h-16 object-cover rounded-md"
                                src={item.product.images[0].url}
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                                <Package className="text-gray-400" size={24} />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-gray-900 line-clamp-2">
                                {item.product.name}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                Qtd: {item.quantity} x{" "}
                                {formatCurrency(Number(item.unitPrice))}
                              </p>
                              <p className="text-sm font-semibold text-gray-900 mt-1">
                                {formatCurrency(Number(item.total))}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        color="primary"
                        size="sm"
                        startContent={<Eye size={16} />}
                        variant="bordered"
                      >
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Criar Envio */}
      {createShipmentModal.isOpen && (
        <CreateShipmentFromSaleModal
          destinationCep={createShipmentModal.destinationCep}
          isOpen={createShipmentModal.isOpen}
          saleId={createShipmentModal.saleId}
          saleNumber={createShipmentModal.saleNumber}
          serviceId={createShipmentModal.serviceId}
          shippingCompany={createShipmentModal.shippingCompany}
          shippingCost={createShipmentModal.shippingCost}
          shippingService={createShipmentModal.shippingService}
          onClose={() =>
            setCreateShipmentModal({
              isOpen: false,
              saleId: "",
              saleNumber: "",
              destinationCep: "",
              shippingService: null,
              shippingCompany: null,
              shippingCost: null,
              serviceId: null,
            })
          }
          onSuccess={fetchSales}
        />
      )}
    </div>
  );
}
