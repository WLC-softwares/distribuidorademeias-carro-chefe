/**
 * Hook: useDashboard
 * Hook customizado para gerenciar estado do dashboard
 */

'use client';

import { getDashboardDataAction } from '@/controllers';
import type { DashboardData } from '@/models';
import { useEffect, useState } from 'react';

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await getDashboardDataAction();
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      console.error('Erro ao buscar dados do dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboardData,
  };
}