/**
 * Repository: User
 * Responsável pelo acesso direto aos dados de usuários
 */

import { prisma } from '@/lib/prisma';
import type { Prisma, Role } from '@prisma/client';

export class UserRepository {
    /**
     * Busca todos os usuários
     */
    async findAll() {
        return await prisma.usuario.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Busca usuário por ID
     */
    async findById(id: string) {
        return await prisma.usuario.findUnique({
            where: { id },
            include: {
                enderecos: true,
            },
        });
    }

    /**
     * Busca usuário por email
     */
    async findByEmail(email: string) {
        return await prisma.usuario.findUnique({
            where: { email },
        });
    }

    /**
     * Cria novo usuário
     */
    async create(data: Prisma.UsuarioCreateInput) {
        return await prisma.usuario.create({
            data,
        });
    }

    /**
     * Atualiza usuário
     */
    async update(id: string, data: Prisma.UsuarioUpdateInput) {
        return await prisma.usuario.update({
            where: { id },
            data,
        });
    }

    /**
     * Deleta usuário
     */
    async delete(id: string) {
        return await prisma.usuario.delete({
            where: { id },
        });
    }

    /**
     * Conta usuários por status
     */
    async countByStatus(ativo: boolean) {
        return await prisma.usuario.count({
            where: { ativo },
        });
    }

    /**
     * Conta usuários por role
     */
    async countByRole(role: Role) {
        return await prisma.usuario.count({
            where: { role },
        });
    }
}

export const userRepository = new UserRepository();