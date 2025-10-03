"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Spinner } from "@heroui/spinner";
import { Eye, Filter, Search } from "lucide-react";
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
}

const statusMap: Record<
  string,
  { color: "success" | "warning" | "danger" | "default"; label: string }
> = {
  PENDING: { color: "warning", label: "Pendente" },
  PROCESSING: { color: "warning", label: "Processando" },
  PAID: { color: "success", label: "Paga" },
  SHIPPED: { color: "success", label: "Enviada" },
  DELIVERED: { color: "success", label: "Entregue" },
  CANCELED: { color: "danger", label: "Cancelada" },
  REFUNDED: { color: "default", label: "Reembolsada" },
};

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
      // Atualizar a lista
      await fetchSales();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filteredSales = sales.filter(
    (sale) =>
      sale.saleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalFinalizadas = sales.filter((s) => s.status === "DELIVERED").length;
  const totalPendentes = sales.filter(
    (s) => s.status === "PENDING" || s.status === "PROCESSING",
  ).length;
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
              placeholder="Buscar por número, cliente ou email..."
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
                      className="hover:bg-gray-50 transition-colors"
                    >
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
