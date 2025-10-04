"use server";

import type { CreateAddressDTO } from "@/models";

import { addressService } from "@/services";

/**
 * Action: Create new address
 */
export async function createAddressAction(data: CreateAddressDTO) {
    try {
        const address = await addressService.createAddress(data);

        return { success: true, address };
    } catch (error) {
        console.error("Error creating address:", error);
        throw error;
    }
}

/**
 * Action: Update address
 */
export async function updateAddressAction(
    id: string,
    data: Partial<CreateAddressDTO>,
) {
    try {
        const address = await addressService.updateAddress(id, data);

        return { success: true, address };
    } catch (error) {
        console.error("Error updating address:", error);
        throw error;
    }
}

/**
 * Action: Delete address
 */
export async function deleteAddressAction(id: string) {
    try {
        await addressService.deleteAddress(id);

        return { success: true };
    } catch (error) {
        console.error("Error deleting address:", error);
        throw error;
    }
}

/**
 * Action: Set address as primary
 */
export async function setAddressAsPrimaryAction(id: string, userId: string) {
    try {
        await addressService.setAsPrimary(id, userId);

        return { success: true };
    } catch (error) {
        console.error("Error setting address as primary:", error);
        throw error;
    }
}

