"use client";

import { Button } from "@heroui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Radio, RadioGroup } from "@heroui/radio";
import { Spinner } from "@heroui/spinner";
import { Package, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface CreateShipmentFromSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleId: string;
  saleNumber: string;
  destinationCep: string;
  onSuccess: () => void;
}

interface ShippingOption {
  codigo: string;
  nome: string;
  empresa: string;
  valor: number;
  prazoEntrega: number;
  logo?: string;
}

export function CreateShipmentFromSaleModal({
  isOpen,
  onClose,
  saleId,
  saleNumber,
  destinationCep,
  onSuccess,
}: CreateShipmentFromSaleModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedService, setSelectedService] = useState<string>("");

  // Carregar opções de frete ao abrir
  useEffect(() => {
    if (isOpen && destinationCep) {
      loadShippingOptions();
    }
  }, [isOpen, destinationCep]);

  const loadShippingOptions = async () => {
    setLoadingOptions(true);
    try {
      const response = await fetch("/api/shipping/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cepDestino: destinationCep.replace(/\D/g, ""),
          saleId: saleId, // Envia o ID da venda para calcular no backend
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.error || "Erro ao calcular frete");
      }

      const data = await response.json();

      setShippingOptions(data.shippingOptions || []);
    } catch (error) {
      console.error("Erro ao carregar opções:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao carregar opções de frete",
      );
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleCreateShipment = async () => {
    if (!selectedService) {
      toast.error("Selecione um serviço de transporte");

      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/melhorenvio/shipments/from-sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          saleId,
          serviceId: parseInt(selectedService),
        }),
      });

      if (!response.ok) {
        const error = await response.json();

        throw new Error(error.error || "Erro ao criar envio");
      }

      toast.success("Envio criado e adicionado ao carrinho!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao criar envio:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao criar envio",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} size="3xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader>
          <div>
            <h2 className="text-2xl font-bold">Criar Envio</h2>
            <p className="text-sm text-gray-600 mt-1">Pedido #{saleNumber}</p>
          </div>
        </ModalHeader>
        <ModalBody>
          {loadingOptions ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Spinner color="primary" size="lg" />
              <p className="mt-4 text-gray-600">
                Carregando opções de frete...
              </p>
            </div>
          ) : shippingOptions.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">Nenhuma opção de frete disponível</p>
              <Button
                className="mt-4"
                color="primary"
                variant="flat"
                onPress={loadShippingOptions}
              >
                Tentar Novamente
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Selecione o serviço de transporte para este envio:
              </p>
              <RadioGroup
                value={selectedService}
                onValueChange={setSelectedService}
              >
                <div className="space-y-3">
                  {shippingOptions.map((option) => (
                    <Radio
                      key={option.codigo}
                      classNames={{
                        base: "m-0 bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-sm transition-all duration-200 cursor-pointer data-[selected=true]:border-blue-600 data-[selected=true]:bg-blue-50",
                        wrapper: "group-data-[selected=true]:border-blue-600",
                      }}
                      value={option.codigo}
                    >
                      <div className="flex justify-between items-center w-full gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          {option.logo ? (
                            <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-md p-2">
                              <img
                                alt={option.empresa}
                                className="w-full h-full object-contain"
                                src={option.logo}
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-md">
                              <Package className="text-gray-600" size={24} />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-bold text-sm text-gray-900 mb-0.5">
                              {option.nome}
                            </p>
                            <p className="text-xs text-gray-500 mb-0.5">
                              {option.empresa}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Truck size={12} />
                              <span>
                                Entrega em até {option.prazoEntrega} dias úteis
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-0.5">Frete</p>
                          <p className="text-xl font-bold text-green-600">
                            R$ {option.valor.toFixed(2).replace(".", ",")}
                          </p>
                        </div>
                      </div>
                    </Radio>
                  ))}
                </div>
              </RadioGroup>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancelar
          </Button>
          <Button
            color="primary"
            isDisabled={!selectedService || loading || loadingOptions}
            isLoading={loading}
            onPress={handleCreateShipment}
          >
            Criar Envio
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
