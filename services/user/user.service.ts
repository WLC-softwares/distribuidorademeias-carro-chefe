/**
 * Service: User
 * Business logic layer for users
 */

import type { CreateUserDTO, UpdateUserDTO, User } from "@/models";

import bcrypt from "bcryptjs";

import { userRepository } from "@/repositories";

export class UserService {
  /**
   * Get all users
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const users = await userRepository.findAll();

      return users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        cpf: u.cpf,
        role: u.role,
        avatar: u.avatar,
        active: u.active,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Unable to fetch users");
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    try {
      const user = await userRepository.findById(id);

      if (!user) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        cpf: user.cpf,
        role: user.role,
        avatar: user.avatar,
        active: user.active,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      console.error("Error fetching user:", error);

      return null;
    }
  }

  /**
   * Get user with addresses
   */
  async getUserWithAddresses(id: string) {
    try {
      const user = await userRepository.findById(id);

      if (!user) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        cpf: user.cpf,
        role: user.role,
        avatar: user.avatar,
        active: user.active,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        addresses: user.addresses || [],
      };
    } catch (error) {
      console.error("Error fetching user with addresses:", error);

      return null;
    }
  }

  /**
   * Create new user
   */
  async createUser(data: CreateUserDTO): Promise<User> {
    try {
      // Check if email already exists
      const existingUser = await userRepository.findByEmail(data.email);

      if (existingUser) {
        throw new Error("Email already registered");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      const user = await userRepository.create({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        cpf: data.cpf,
        role: data.role || "USER",
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        cpf: user.cpf,
        role: user.role,
        avatar: user.avatar,
        active: user.active,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      console.error("Error creating user:", error);

      if (error instanceof Error && error.message === "Email already registered") {
        throw error;
      }

      throw new Error("Unable to create user");
    }
  }

  /**
   * Update user
   */
  async updateUser(id: string, data: UpdateUserDTO): Promise<User | null> {
    try {
      const user = await userRepository.update(id, data);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        cpf: user.cpf,
        role: user.role,
        avatar: user.avatar,
        active: user.active,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      console.error("Error updating user:", error);

      return null;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<void> {
    try {
      await userRepository.delete(id);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw new Error("Unable to delete user");
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{ total: number; active: number; admins: number }> {
    try {
      const [total, active, admins] = await Promise.all([
        userRepository.count(),
        userRepository.countActive(),
        userRepository.countAdmins(),
      ]);

      return { total, active, admins };
    } catch (error) {
      console.error("Error fetching user stats:", error);
      throw new Error("Unable to fetch user stats");
    }
  }
}

export const userService = new UserService();
