"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Spinner } from "@heroui/spinner";
import { Eye, Filter, MapPin, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
  }[];
  shippingZipCode?: string | null;
  shippingStreet?: string | null;
  shippingNumber?: string | null;
  shippingComplement?: string | null;
  shippingNeighborhood?: string | null;
  shippingCity?: string | null;
  shippingState?: string | null;
  shippingCountry?: string | null;
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
        updateSaleStatusAction(saleId, bulkStatus)
      );
      await Promise.all(promises);
      toast.success(`${selectedSales.size} venda(s) atualizada(s) com sucesso!`);
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

      {/* Sales Table */}
      <Card className="shadow-md">
        <CardHeader className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            Vendas ({filteredSales.length})
          </h2>
        </CardHeader>
        <CardBody className="p-0">
          {filteredSales.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Nenhuma venda encontrada
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        checked={
                          filteredSales.length > 0 &&
                          selectedSales.size === filteredSales.length
                        }
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        type="checkbox"
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Número
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      E-mail
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Endereço
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Itens
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Pagamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSales.map((sale) => (
                    <tr
                      key={sale.id}
                      className={`hover:bg-gray-50 transition-colors ${selectedSales.has(sale.id) ? "bg-blue-50" : ""
                        }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          checked={selectedSales.has(sale.id)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          type="checkbox"
                          onChange={() => handleSelectSale(sale.id)}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-800">
                          #{sale.saleNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-800">
                          {sale.user.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {sale.user.email}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {sale.shippingCity ? (
                          <div className="flex gap-2">
                            <MapPin className="text-gray-400 flex-shrink-0 mt-0.5" size={16} />
                            <div className="text-sm text-gray-600">
                              <div className="font-medium text-gray-800">
                                {sale.shippingCity} - {sale.shippingState}
                              </div>
                              <div className="text-xs text-gray-500 max-w-xs truncate">
                                {sale.shippingStreet}, {sale.shippingNumber}
                                {sale.shippingComplement && ` - ${sale.shippingComplement}`}
                              </div>
                              <div className="text-xs text-gray-500">
                                {sale.shippingNeighborhood}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">
                            Sem endereço
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-800">
                          {sale.items.reduce(
                            (acc, item) => acc + item.quantity,
                            0,
                          )}{" "}
                          itens
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-800">
                          {formatCurrency(Number(sale.total))}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Select
                          className="w-40"
                          classNames={{
                            trigger: "min-h-unit-8 h-8",
                          }}
                          isDisabled={updatingStatus === sale.id}
                          selectedKeys={[sale.status]}
                          size="sm"
                          onSelectionChange={(keys) => {
                            const newStatus = Array.from(keys)[0] as string;

                            if (newStatus && newStatus !== sale.status) {
                              handleStatusChange(sale.id, newStatus);
                            }
                          }}
                        >
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </Select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {new Date(sale.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button
                          isIconOnly
                          className="text-blue-600 hover:bg-blue-50"
                          size="sm"
                          variant="light"
                        >
                          <Eye size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
