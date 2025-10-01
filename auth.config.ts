/**
 * Auth Config
 * Configuração do NextAuth separada para uso no middleware
 */

import { prisma } from '@/lib/prisma';
import { isValidEmail } from '@/utils';
import bcrypt from 'bcryptjs';
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

export default {
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Senha', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email e senha são obrigatórios');
                }

                const email = credentials.email as string;
                const password = credentials.password as string;

                // Validar formato de email
                if (!isValidEmail(email)) {
                    throw new Error('Email inválido');
                }

                // Buscar usuário no banco de dados
                const usuario = await prisma.usuario.findUnique({
                    where: { email },
                });

                if (!usuario) {
                    throw new Error('Credenciais inválidas');
                }

                // Verificar se o usuário está ativo
                if (!usuario.ativo) {
                    throw new Error('Usuário inativo');
                }

                // Verificar senha
                const isValidPassword = await bcrypt.compare(password, usuario.senha);

                if (!isValidPassword) {
                    throw new Error('Credenciais inválidas');
                }

                // Retornar usuário
                return {
                    id: usuario.id,
                    name: usuario.nome,
                    email: usuario.email,
                    role: usuario.role,
                    avatar: usuario.avatar,
                };
            },
        }),
    ],
} satisfies NextAuthConfig;