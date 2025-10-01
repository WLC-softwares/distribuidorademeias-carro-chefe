/**
 * Utils: Formatters
 * Funções utilitárias para formatação de dados
 */

/**
 * Formata valor monetário para o padrão brasileiro
 */
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

/**
 * Formata data para o padrão brasileiro
 */
export function formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('pt-BR').format(dateObj);
}

/**
 * Formata data e hora para o padrão brasileiro
 */
export function formatDateTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(dateObj);
}

/**
 * Formata número com separadores de milhar
 */
export function formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value);
}

/**
 * Formata percentual
 */
export function formatPercentage(value: number, decimals: number = 1): string {
    return `${value > 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}