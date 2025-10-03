/**
 * Repository: Dashboard
 * Responsible for direct access to dashboard data
 */

import { prisma } from "@/lib/prisma";
import { DashboardData, DashboardStats } from "@/models";

export class DashboardRepository {
  /**
   * Get general dashboard data
   */
  async getDashboardData(): Promise<DashboardData> {
    // API call simulation
    // In production, this would be a real backend call
    return {
      metrics: [
        {
          title: "Completed Sales",
          value: "1,234",
          change: "+12.5%",
          icon: "ShoppingCart",
          color: "text-green-600",
          bgColor: "bg-green-100",
        },
        {
          title: "Total Revenue",
          value: "R$ 45.670,00",
          change: "+8.2%",
          icon: "DollarSign",
          color: "text-blue-600",
          bgColor: "bg-blue-100",
        },
        {
          title: "Products in Stock",
          value: "567",
          change: "-3.1%",
          icon: "Package",
          color: "text-orange-600",
          bgColor: "bg-orange-100",
        },
        {
          title: "Active Customers",
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
          status: "Completed",
          date: "2025-10-01",
        },
        {
          id: "#1235",
          customer: "Maria Santos",
          total: "R$ 89,50",
          status: "Completed",
          date: "2025-10-01",
        },
        {
          id: "#1236",
          customer: "Pedro Costa",
          total: "R$ 210,00",
          status: "Completed",
          date: "2025-09-30",
        },
        {
          id: "#1237",
          customer: "Ana Oliveira",
          total: "R$ 156,90",
          status: "Completed",
          date: "2025-09-30",
        },
        {
          id: "#1238",
          customer: "Carlos Souza",
          total: "R$ 342,00",
          status: "Completed",
          date: "2025-09-29",
        },
        {
          id: "#1239",
          customer: "Juliana Lima",
          total: "R$ 156,90",
          status: "Completed",
          date: "2025-09-29",
        },
        {
          id: "#1240",
          customer: "Roberto Alves",
          total: "R$ 342,00",
          status: "Completed",
          date: "2025-09-28",
        },
        {
          id: "#1241",
          customer: "Fernanda Castro",
          total: "R$ 156,90",
          status: "Completed",
          date: "2025-09-28",
        },
        {
          id: "#1242",
          customer: "Marcelo Dias",
          total: "R$ 342,00",
          status: "Completed",
          date: "2025-09-27",
        },
        {
          id: "#1243",
          customer: "Patricia Rocha",
          total: "R$ 156,90",
          status: "Completed",
          date: "2025-09-27",
        },
        {
          id: "#1244",
          customer: "Ricardo Nunes",
          total: "R$ 342,00",
          status: "Completed",
          date: "2025-09-26",
        },
        {
          id: "#1245",
          customer: "Sandra Martins",
          total: "R$ 156,90",
          status: "Completed",
          date: "2025-09-26",
        },
      ],
    };
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Get total sales
      const totalSales = await prisma.sale.count();

      // Get total revenue (paid, shipped and delivered sales)
      const sales = await prisma.sale.findMany({
        where: {
          status: {
            in: ["PAID", "SHIPPED", "DELIVERED"],
          },
        },
        select: {
          total: true,
        },
      });
      const totalRevenue = sales.reduce(
        (acc, sale) => acc + Number(sale.total),
        0,
      );

      // Get total products
      const totalProducts = await prisma.product.count({
        where: {
          active: true,
        },
      });

      // Get active customers
      const activeCustomers = await prisma.user.count({
        where: {
          active: true,
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
      console.error("Error fetching dashboard statistics:", error);

      // Return default values in case of error
      return {
        totalSales: 0,
        totalRevenue: 0,
        totalProducts: 0,
        activeCustomers: 0,
      };
    }
  }
}

// Singleton for reuse
export const dashboardRepository = new DashboardRepository();
