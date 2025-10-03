/**
 * Controller: Auth
 * Server Actions for authentication
 */

"use server";

import type { AuthCredentials, AuthResponse, CreateUserDTO } from "@/models";

import { authService, userService } from "@/services";

/**
 * Action: Login
 */
export async function loginAction(
  credentials: AuthCredentials,
): Promise<AuthResponse> {
  try {
    const response = await authService.login(credentials);

    return response;
  } catch (error) {
    console.error("Error in login controller:", error);
    throw error;
  }
}

/**
 * Action: Logout
 */
export async function logoutAction(): Promise<void> {
  try {
    await authService.logout();
  } catch (error) {
    console.error("Error in logout controller:", error);
    throw error;
  }
}

/**
 * Action: Check email
 */
export async function checkEmailAction(email: string): Promise<boolean> {
  try {
    return await authService.checkEmailExists(email);
  } catch (error) {
    console.error("Error checking email:", error);

    return false;
  }
}

/**
 * Action: Register new user
 */
export async function registerAction(
  data: CreateUserDTO & {
    enderecos?: Array<{
      cep: string;
      logradouro: string;
      numero: string;
      complemento?: string;
      bairro: string;
      cidade: string;
      estado: string;
      principal: boolean;
    }>;
  },
) {
  try {
    // Create user
    const user = await userService.createUser({
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      cpf: data.cpf,
    });

    // If there are addresses, add them to the user
    if (data.enderecos && data.enderecos.length > 0 && user.id) {
      const { prisma } = await import("@/lib/prisma");

      for (const endereco of data.enderecos) {
        await prisma.address.create({
          data: {
            zipCode: endereco.cep,
            street: endereco.logradouro,
            number: endereco.numero,
            complement: endereco.complemento,
            neighborhood: endereco.bairro,
            city: endereco.cidade,
            state: endereco.estado,
            primary: endereco.principal,
            userId: user.id,
          },
        });
      }
    }

    return { success: true, user };
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
}
