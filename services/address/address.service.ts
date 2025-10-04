import type { CreateAddressDTO } from "@/models";

import { addressRepository } from "@/repositories";

export const addressService = {
    async createAddress(data: CreateAddressDTO) {
        return addressRepository.createAddress(data);
    },

    async updateAddress(id: string, data: Partial<CreateAddressDTO>) {
        return addressRepository.updateAddress(id, data);
    },

    async deleteAddress(id: string) {
        return addressRepository.deleteAddress(id);
    },

    async setAsPrimary(id: string, userId: string) {
        return addressRepository.setAsPrimary(id, userId);
    },

    async getUserAddresses(userId: string) {
        return addressRepository.getUserAddresses(userId);
    },
};

