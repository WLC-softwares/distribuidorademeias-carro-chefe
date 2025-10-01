/**
 * Lib: API
 * Configuração e utilitários para chamadas de API
 */

export class ApiClient {
    private baseURL: string;

    constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api') {
        this.baseURL = baseURL;
    }

    /**
     * Requisição GET
     */
    async get<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeaders(),
            },
        });

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Requisição POST
     */
    async post<T>(endpoint: string, data: unknown): Promise<T> {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeaders(),
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Requisição PUT
     */
    async put<T>(endpoint: string, data: unknown): Promise<T> {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeaders(),
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Requisição DELETE
     */
    async delete<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeaders(),
            },
        });

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Obtém headers de autenticação
     */
    private getAuthHeaders(): Record<string, string> {
        if (typeof window === 'undefined') return {};

        const token = localStorage.getItem('auth_token');
        if (!token) return {};

        return {
            Authorization: `Bearer ${token}`,
        };
    }
}

// Singleton
export const apiClient = new ApiClient();