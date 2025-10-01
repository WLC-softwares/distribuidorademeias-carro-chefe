/**
 * Service: Dashboard
 * Camada de lógica de negócios para o Dashboard
 * Processa dados antes de enviar para a View
 */

import type { DashboardData, DashboardStats } from '@/models';
import { dashboardRepository } from '@/repositories';

export class DashboardService {
    /**
     * Obtém dados completos do dashboard
     */
    async getDashboardData(): Promise<DashboardData> {
        try {
            const data = await dashboardRepository.getDashboardData();
            return data;
        } catch (error) {
            console.error('Erro ao buscar dados do dashboard:', error);
            throw new Error('Não foi possível carregar os dados do dashboard');
        }
    }

    /**
     * Obtém estatísticas do dashboard
     */
    async getDashboardStats(): Promise<DashboardStats> {
        try {
            const stats = await dashboardRepository.getDashboardStats();
            return stats;
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            throw new Error('Não foi possível carregar as estatísticas');
        }
    }

    /**
     * Calcula tendência de vendas
     */
    calculateSalesTrend(current: number, previous: number): string {
        const change = ((current - previous) / previous) * 100;
        return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
    }
}

// Singleton para reutilização
export const dashboardService = new DashboardService();