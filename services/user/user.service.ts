/**
 * Service: User
 * Camada de lógica de negócios para usuários
 */

import type { CreateUserDTO, UpdateUserDTO, User } from "@/models";

import bcrypt from "bcryptjs";

import { userRepository } from "@/repositories";

export class UserService {
  /**
   * Busca todos os usuários
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const usuarios = await userRepository.findAll();

      return usuarios.map((u) => ({
        id: u.id,
        nome: u.nome,
        email: u.email,
        telefone: u.telefone,
        cpf: u.cpf,
        role: u.role,
        avatar: u.avatar,
        ativo: u.ativo,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      }));
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      throw new Error("Não foi possível buscar os usuários");
    }
  }

  /**
   * Busca usuário por ID
   */
  async getUserById(id: string): Promise<User | null> {
    try {
      const usuario = await userRepository.findById(id);

      if (!usuario) return null;

      return {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        cpf: usuario.cpf,
        role: usuario.role,
        avatar: usuario.avatar,
        ativo: usuario.ativo,
        createdAt: usuario.createdAt,
        updatedAt: usuario.updatedAt,
      };
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);

      return null;
    }
  }

  /**
   * Busca usuário com endereços
   */
  async getUserWithAddresses(id: string) {
    try {
      const usuario = await userRepository.findById(id);

      if (!usuario) return null;

      return {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        cpf: usuario.cpf,
        role: usuario.role,
        avatar: usuario.avatar,
        ativo: usuario.ativo,
        createdAt: usuario.createdAt,
        updatedAt: usuario.updatedAt,
        enderecos: usuario.enderecos || [],
      };
    } catch (error) {
      console.error("Erro ao buscar usuário com endereços:", error);

      return null;
    }
  }

  /**
   * Cria novo usuário
   */
  async createUser(data: CreateUserDTO): Promise<User> {
    try {
      // Verificar se email já existe
      const existingUser = await userRepository.findByEmail(data.email);

      if (existingUser) {
        throw new Error("Email já cadastrado");
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(data.senha, 10);

      const usuario = await userRepository.create({
        nome: data.nome,
        email: data.email,
        senha: hashedPassword,
        telefone: data.telefone,
        cpf: data.cpf,
        role: data.role || "USER",
      });

      return {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        cpf: usuario.cpf,
        role: usuario.role,
        avatar: usuario.avatar,
        ativo: usuario.ativo,
        createdAt: usuario.createdAt,
        updatedAt: usuario.updatedAt,
      };
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      throw error;
    }
  }

  /**
   * Atualiza usuário
   */
  async updateUser(id: string, data: UpdateUserDTO): Promise<User> {
    try {
      const usuario = await userRepository.update(id, data);

      return {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        cpf: usuario.cpf,
        role: usuario.role,
        avatar: usuario.avatar,
        ativo: usuario.ativo,
        createdAt: usuario.createdAt,
        updatedAt: usuario.updatedAt,
      };
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      throw new Error("Não foi possível atualizar o usuário");
    }
  }

  /**
   * Deleta usuário
   */
  async deleteUser(id: string): Promise<void> {
    try {
      await userRepository.delete(id);
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      throw new Error("Não foi possível deletar o usuário");
    }
  }

  /**
   * Obtém estatísticas de usuários
   */
  async getUserStats() {
    try {
      const [total, ativos, admins] = await Promise.all([
        userRepository.findAll().then((users) => users.length),
        userRepository.countByStatus(true),
        userRepository.countByRole("ADMIN"),
      ]);

      return { total, ativos, admins };
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      throw new Error("Não foi possível buscar as estatísticas");
    }
  }
}

export const userService = new UserService();
