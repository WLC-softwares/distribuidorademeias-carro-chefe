/**
 * Controller: User
 * Server Actions para o módulo de usuários
 */

"use server";

import type { CreateUserDTO, UpdateUserDTO } from "@/models";

import { userService } from "@/services";

/**
 * Action: Obter todos os usuários
 */
export async function getUsersAction() {
  try {
    return await userService.getAllUsers();
  } catch (error) {
    console.error("Erro no controller de usuários:", error);
    throw error;
  }
}

/**
 * Action: Obter estatísticas de usuários
 */
export async function getUserStatsAction() {
  try {
    return await userService.getUserStats();
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    throw error;
  }
}

/**
 * Action: Obter usuário por ID
 */
export async function getUserByIdAction(id: string) {
  try {
    return await userService.getUserById(id);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    throw error;
  }
}

/**
 * Action: Obter usuário com endereços
 */
export async function getUserWithAddressesAction(id: string) {
  try {
    return await userService.getUserWithAddresses(id);
  } catch (error) {
    console.error("Erro ao buscar usuário com endereços:", error);
    throw error;
  }
}

/**
 * Action: Criar usuário
 */
export async function createUserAction(data: CreateUserDTO) {
  try {
    return await userService.createUser(data);
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    throw error;
  }
}

/**
 * Action: Atualizar usuário
 */
export async function updateUserAction(id: string, data: UpdateUserDTO) {
  try {
    return await userService.updateUser(id, data);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    throw error;
  }
}

/**
 * Action: Deletar usuário
 */
export async function deleteUserAction(id: string) {
  try {
    await userService.deleteUser(id);
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    throw error;
  }
}

/**
 * Action: Alterar senha do usuário
 */
export async function changePasswordAction(
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  try {
    return await userService.changePassword(
      userId,
      currentPassword,
      newPassword,
    );
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    throw error;
  }
}
