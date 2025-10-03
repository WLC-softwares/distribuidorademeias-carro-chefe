/**
 * Controller: Dashboard
 * Server Actions para o módulo Dashboard
 * Use "use server" quando necessário
 */

"use server";

import type { DashboardData, DashboardStats } from "@/models";

import { dashboardService } from "@/services";

/**
 * Action: Obter dados do dashboard
 */
export async function getDashboardDataAction(): Promise<DashboardData> {
  try {
    const data = await dashboardService.getDashboardData();

    return data;
  } catch (error) {
    console.error("Erro no controller de dashboard:", error);
    throw error;
  }
}

/**
 * Action: Get dashboard statistics
 */
export async function getDashboardStatsAction(): Promise<DashboardStats> {
  try {
    const stats = await dashboardService.getDashboardStats();

    return stats;
  } catch (error) {
    console.error("Error fetching statistics:", error);
    throw error;
  }
}
