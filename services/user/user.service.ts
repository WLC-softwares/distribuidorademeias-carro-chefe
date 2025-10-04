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
    } catch (_error) {
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
    } catch (_error) {
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
    } catch (_error) {
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
      if (
        error instanceof Error &&
        error.message === "Email already registered"
      ) {
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
    } catch (_error) {
      return null;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<void> {
    try {
      await userRepository.delete(id);
    } catch (_error) {
      throw new Error("Unable to delete user");
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{
    total: number;
    active: number;
    admins: number;
  }> {
    try {
      const [total, active, admins] = await Promise.all([
        userRepository.count(),
        userRepository.countActive(),
        userRepository.countAdmins(),
      ]);

      return { total, active, admins };
    } catch (_error) {
      throw new Error("Unable to fetch user stats");
    }
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Get user with password
      const user = await userRepository.findById(userId);

      if (!user) {
        throw new Error("User not found");
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        user.password,
      );

      if (!isValidPassword) {
        throw new Error("Current password is incorrect");
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await userRepository.update(userId, {
        password: hashedPassword,
      });

      return {
        success: true,
        message: "Password changed successfully",
      };
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Current password is incorrect"
      ) {
        throw error;
      }

      throw new Error("Unable to change password");
    }
  }
}

export const userService = new UserService();
