/**
 * Model: Address (Endereço)
 * Definições de tipos e interfaces para o módulo de Endereço
 */

export interface Address {
  id: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
  principal: boolean;
  usuarioId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAddressDTO {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais?: string;
  principal?: boolean;
  usuarioId: string;
}

export interface UpdateAddressDTO {
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  principal?: boolean;
}
