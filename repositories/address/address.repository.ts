import type { CreateAddressDTO } from "@/models";

import { prisma } from "@/lib";

export const addressRepository = {
  async createAddress(data: CreateAddressDTO) {
    return prisma.address.create({
      data: {
        zipCode: data.zipCode,
        street: data.street,
        number: data.number,
        complement: data.complement,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        country: data.country || "Brasil",
        primary: data.primary || false,
        userId: data.userId,
      },
    });
  },

  async updateAddress(id: string, data: Partial<CreateAddressDTO>) {
    return prisma.address.update({
      where: { id },
      data,
    });
  },

  async deleteAddress(id: string) {
    return prisma.address.delete({
      where: { id },
    });
  },

  async setAsPrimary(id: string, userId: string) {
    // Remove primary from all addresses of the user
    await prisma.address.updateMany({
      where: { userId },
      data: { primary: false },
    });

    // Set the selected address as primary
    return prisma.address.update({
      where: { id },
      data: { primary: true },
    });
  },

  async getUserAddresses(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ primary: "desc" }, { createdAt: "desc" }],
    });
  },
};
