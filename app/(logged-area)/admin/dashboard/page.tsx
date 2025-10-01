"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import {
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import { formatCurrency } from "@/utils";
import { getDashboardStatsAction, getRecentSalesAction } from "@/controllers";

interface DashboardStats {
  totalSales: number;
  totalRevenue: number;
  totalProducts: number;
  activeCustomers: number;
}

interface RecentSale {
  id: string;
  numeroVenda: string;
  status: string;
  total: number;
  createdAt: Date;
  usuario: {
    nome: string;
    email: string;
  };
}

const statusMap: Record<
  string,
  { color: "success" | "warning" | "danger" | "default"; label: string }
> = {
  PENDENTE: { color: "warning", label: "Pendente" },
  PROCESSANDO: { color: "warning", label: "Processando" },
  PAGA: { color: "success", label: "Paga" },
  ENVIADA: { color: "success", label: "Enviada" },
  ENTREGUE: { color: "success", label: "Entregue" },
  CANCELADA: { color: "danger", label: "Cancelada" },
  REEMBOLSADA: { color: "default", label: "Reembolsada" },
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, salesData] = await Promise.all([
          getDashboardStatsAction(),
          getRecentSalesAction(12),
        ]);

        setStats(statsData);
        setRecentSales(salesData as any);
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner color="warning" size="lg" />
      </div>
    );
  }

  const metrics = [
    {
      title: "Total de Vendas",
      value: stats.totalSales.toString(),
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Receita Total",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Produtos Ativos",
      value: stats.totalProducts.toString(),
      icon: Package,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Clientes Ativos",
      value: stats.activeCustomers.toString(),
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Bem-vindo ao painel administrativo</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <Card
              key={metric.title}
              className="shadow-md hover:shadow-lg transition-shadow"
            >
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      {metric.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-800 mt-2">
                      {metric.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                    <Icon className={`${metric.color}`} size={24} />
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Recent Sales */}
      <Card className="shadow-md">
        <CardHeader className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-xl font-bold text-gray-800">Vendas Recentes</h2>
            <TrendingUp className="text-gray-400" size={20} />
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {recentSales.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Nenhuma venda recente
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
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentSales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-800">
                          #{sale.numeroVenda}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-800">
                          {sale.usuario.nome}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {sale.usuario.email}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-800">
                          {formatCurrency(Number(sale.total))}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Chip
                          color={statusMap[sale.status]?.color || "default"}
                          size="sm"
                          variant="flat"
                        >
                          {statusMap[sale.status]?.label || sale.status}
                        </Chip>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {new Date(sale.createdAt).toLocaleDateString("pt-BR")}
                        </span>
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
