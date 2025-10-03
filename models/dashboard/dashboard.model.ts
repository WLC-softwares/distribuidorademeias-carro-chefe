/**
 * Model: Dashboard
 * Definições de tipos e interfaces para o módulo de Dashboard
 */

export interface DashboardMetric {
  title: string;
  value: string;
  change: string;
  icon: string;
  color: string;
  bgColor: string;
}

export interface RecentSale {
  id: string;
  customer: string;
  total: string;
  status: "Completed" | "Pending" | "Canceled";
  date: string;
}

export interface DashboardData {
  metrics: DashboardMetric[];
  recentSales: RecentSale[];
}

export interface DashboardStats {
  totalSales: number;
  totalRevenue: number;
  totalProducts: number;
  activeCustomers: number;
}
