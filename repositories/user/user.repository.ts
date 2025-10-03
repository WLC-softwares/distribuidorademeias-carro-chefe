/**
 * Repository: User
 * Responsible for direct access to user data
 */

import type { Prisma, Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export class UserRepository {
  /**
   * Find all users
   */
  async findAll() {
    return await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Find user by ID
   */
  async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        addresses: true,
      },
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Create new user
   */
  async create(data: Prisma.UserCreateInput) {
    return await prisma.user.create({
      data,
    });
  }

  /**
   * Update user
   */
  async update(id: string, data: Prisma.UserUpdateInput) {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete user
   */
  async delete(id: string) {
    return await prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Count all users
   */
  async count() {
    return await prisma.user.count();
  }

  /**
   * Count active users
   */
  async countActive() {
    return await prisma.user.count({
      where: { active: true },
    });
  }

  /**
   * Count admin users
   */
  async countAdmins() {
    return await prisma.user.count({
      where: { role: "ADMIN" },
    });
  }

  /**
   * Count users by status
   */
  async countByStatus(active: boolean) {
    return await prisma.user.count({
      where: { active },
    });
  }

  /**
   * Count users by role
   */
  async countByRole(role: Role) {
    return await prisma.user.count({
      where: { role },
    });
  }
}

export const userRepository = new UserRepository();
