"use client";

import type { Address } from "@/models";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Radio, RadioGroup } from "@heroui/radio";
import { MapPin, Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { AddAddressModal } from "./AddAddressModal";

interface AddressSelectorProps {
  addresses: Address[];
  selectedAddressId?: string | null;
  onAddressSelect: (address: Address | null) => void;
  onAddressAdded: (address: Address) => void;
  userId: string;
}

export function AddressSelector({
  addresses,
  selectedAddressId,
  onAddressSelect,
  onAddressAdded,
  userId,
}: AddressSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(selectedAddressId || "");

  // Limitar a exibição a 3 endereços
  const displayedAddresses = addresses.slice(0, 3);
  const hasMoreAddresses = addresses.length > 3;

  useEffect(() => {
    // Se não houver endereço selecionado e existir um principal, selecione-o
    if (!selectedId && addresses.length > 0) {
      const primaryAddress =
        addresses.find((addr) => addr.primary) || addresses[0];

      setSelectedId(primaryAddress.id);
      onAddressSelect(primaryAddress);
    }
  }, [addresses, selectedId, onAddressSelect]);

  const handleAddressChange = (addressId: string) => {
    setSelectedId(addressId);
    const address = addresses.find((addr) => addr.id === addressId);

    if (address) {
      onAddressSelect(address);
    }
  };

  const handleAddressAdded = (address: Address) => {
    onAddressAdded(address);
    // Selecionar automaticamente o novo endereço
    setSelectedId(address.id);
    onAddressSelect(address);
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <MapPin size={20} />
          <h2 className="text-xl font-semibold">Endereço de Entrega</h2>
        </div>
        <Button
          color="primary"
          size="sm"
          startContent={<Plus size={16} />}
          variant="flat"
          onPress={() => setIsModalOpen(true)}
        >
          Novo
        </Button>
      </CardHeader>
      <Divider />
      <CardBody>
        {addresses.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full">
              <MapPin className="text-gray-400" size={32} />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Você ainda não possui um endereço cadastrado.
              </p>
              <Button
                color="primary"
                startContent={<Plus size={18} />}
                onPress={() => setIsModalOpen(true)}
              >
                Adicionar Endereço
              </Button>
            </div>
          </div>
        ) : (
          <>
            <RadioGroup value={selectedId} onValueChange={handleAddressChange}>
              <div className="space-y-3">
                {displayedAddresses.map((address) => (
                  <Radio
                    key={address.id}
                    classNames={{
                      base: "m-0 bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-sm transition-all duration-200 cursor-pointer data-[selected=true]:border-blue-600 data-[selected=true]:bg-blue-50",
                      wrapper: "group-data-[selected=true]:border-blue-600",
                    }}
                    value={address.id}
                  >
                    <div
                      className={`w-full flex flex-col justify-between ${address.primary ? "h-[130px]" : "h-[110px]"}`}
                    >
                      <div>
                        <div className="flex items-start justify-between mb-1.5">
                          <div>
                            <p className="font-semibold text-gray-900 leading-tight">
                              {address.street}, {address.number}
                            </p>
                            {address.primary && (
                              <Chip
                                className="mt-1"
                                color="warning"
                                size="sm"
                                variant="flat"
                              >
                                Principal
                              </Chip>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 space-y-0.5 mt-2">
                          {address.complement && (
                            <p className="leading-tight">
                              {address.complement}
                            </p>
                          )}
                          <p className="leading-tight">
                            {address.neighborhood}
                          </p>
                          <p className="leading-tight">
                            {address.city} - {address.state}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-700 mt-2">
                        CEP: {address.zipCode}
                      </p>
                    </div>
                  </Radio>
                ))}
              </div>
            </RadioGroup>

            {hasMoreAddresses && (
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                <p className="text-xs text-blue-800 text-center">
                  Você tem {addresses.length - 3} endereço(s) adicional(is).
                  Gerencie seus endereços na página de perfil.
                </p>
              </div>
            )}
          </>
        )}

        {addresses.length > 0 && (
          <p className="text-xs text-gray-500 italic mt-4">
            * O endereço será confirmado com nossa equipe via WhatsApp
          </p>
        )}
      </CardBody>

      <AddAddressModal
        isOpen={isModalOpen}
        userId={userId}
        onAddressAdded={handleAddressAdded}
        onClose={() => setIsModalOpen(false)}
      />
    </Card>
  );
}
