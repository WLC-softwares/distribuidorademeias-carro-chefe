/**
 * Model: Address
 * Type definitions and interfaces for the Address module
 */

export interface Address {
  id: string;
  zipCode: string;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  primary: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAddressDTO {
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  country?: string;
  primary?: boolean;
  userId: string;
}

export interface UpdateAddressDTO {
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  primary?: boolean;
}
