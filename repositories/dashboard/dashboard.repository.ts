/**
 * Repository: Dashboard
 * Responsável pelo acesso direto aos dados do dashboard
 */

import { prisma } from "@/lib/prisma";
import { DashboardData, DashboardStats } from "@/models";

export class DashboardRepository {
  /**
   * Busca dados gerais do dashboard
   */
  async getDashboardData(): Promise<DashboardData> {
    // Simulação de chamada API
    // Em produção, aqui seria uma chamada real para o backend
    return {
      metrics: [
        {
          title: "Vendas Finalizadas",
          value: "1,234",
          change: "+12.5%",
          icon: "ShoppingCart",
          color: "text-green-600",
          bgColor: "bg-green-100",
        },
        {
          title: "Receita Total",
          value: "R$ 45.670,00",
          change: "+8.2%",
          icon: "DollarSign",
          color: "text-blue-600",
          bgColor: "bg-blue-100",
        },
        {
          title: "Produtos em Estoque",
          value: "567",
          change: "-3.1%",
          icon: "Package",
          color: "text-orange-600",
          bgColor: "bg-orange-100",
        },
        {
          title: "Clientes Ativos",
          value: "892",
          change: "+15.3%",
          icon: "Users",
          color: "text-purple-600",
          bgColor: "bg-purple-100",
        },
      ],
      recentSales: [
        {
          id: "#1234",
          customer: "João Silva",
          total: "R$ 125,00",
          status: "Finalizada",
          date: "2025-10-01",
        },
        {
          id: "#1235",
          customer: "Maria Santos",
          total: "R$ 89,50",
          status: "Finalizada",
          date: "2025-10-01",
        },
        {
          id: "#1236",
          customer: "Pedro Costa",
          total: "R$ 210,00",
          status: "Finalizada",
          date: "2025-09-30",
        },
        {
          id: "#1237",
          customer: "Ana Oliveira",
          total: "R$ 156,90",
          status: "Finalizada",
          date: "2025-09-30",
        },
        {
          id: "#1238",
          customer: "Carlos Souza",
          total: "R$ 342,00",
          status: "Finalizada",
          date: "2025-09-29",
        },
        {
          id: "#1239",
          customer: "Juliana Lima",
          total: "R$ 156,90",
          status: "Finalizada",
          date: "2025-09-29",
        },
        {
          id: "#1240",
          customer: "Roberto Alves",
          total: "R$ 342,00",
          status: "Finalizada",
          date: "2025-09-28",
        },
        {
          id: "#1241",
          customer: "Fernanda Castro",
          total: "R$ 156,90",
          status: "Finalizada",
          date: "2025-09-28",
        },
        {
          id: "#1242",
          customer: "Marcelo Dias",
          total: "R$ 342,00",
          status: "Finalizada",
          date: "2025-09-27",
        },
        {
          id: "#1243",
          customer: "Patricia Rocha",
          total: "R$ 156,90",
          status: "Finalizada",
          date: "2025-09-27",
        },
        {
          id: "#1244",
          customer: "Ricardo Nunes",
          total: "R$ 342,00",
          status: "Finalizada",
          date: "2025-09-26",
        },
        {
          id: "#1245",
          customer: "Sandra Martins",
          total: "R$ 156,90",
          status: "Finalizada",
          date: "2025-09-26",
        },
      ],
    };
  }

  /**
   * Busca estatísticas do dashboard
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Buscar total de vendas
      const totalSales = await prisma.venda.count();

      // Buscar receita total (vendas pagas, enviadas e entregues)
      const vendas = await prisma.venda.findMany({
        where: {
          status: {
            in: ["PAGA", "ENVIADA", "ENTREGUE"],
          },
        },
        select: {
          total: true,
        },
      });
      const totalRevenue = vendas.reduce(
        (acc, venda) => acc + Number(venda.total),
        0,
      );

      // Buscar total de produtos
      const totalProducts = await prisma.produto.count({
        where: {
          ativo: true,
        },
      });

      // Buscar clientes ativos
      const activeCustomers = await prisma.usuario.count({
        where: {
          ativo: true,
          role: "USER",
        },
      });

      return {
        totalSales,
        totalRevenue,
        totalProducts,
        activeCustomers,
      };
    } catch (error) {
      console.error("Erro ao buscar estatísticas do dashboard:", error);

      // Retornar valores padrão em caso de erro
      return {
        totalSales: 0,
        totalRevenue: 0,
        totalProducts: 0,
        activeCustomers: 0,
      };
    }
  }
}

// Singleton para reutilização
export const dashboardRepository = new DashboardRepository();
