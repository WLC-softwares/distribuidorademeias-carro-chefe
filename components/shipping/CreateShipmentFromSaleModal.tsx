"use client";

import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { AlertCircle, CheckCircle, Package, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CreateShipmentFromSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  saleId: string;
  saleNumber: string;
  destinationCep: string;
  shippingService?: string | null;
  shippingCompany?: string | null;
  shippingCost?: number | null;
  serviceId?: string | null;
}

export function CreateShipmentFromSaleModal({
  isOpen,
  onClose,
  onSuccess,
  saleId,
  saleNumber,
  destinationCep,
  shippingService,
  shippingCompany,
  shippingCost,
  serviceId,
}: CreateShipmentFromSaleModalProps) {
  const [loading, setLoading] = useState(false);

  const handleCreateShipment = async () => {
    if (!shippingService) {
      toast.error("Frete não foi selecionado pelo cliente");

      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/melhorenvio/shipments/from-sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          saleId,
          serviceId,
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
    <Modal isOpen={isOpen} size="2xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader>
          <div>
            <h2 className="text-2xl font-bold">Confirmar Criação de Envio</h2>
            <p className="text-sm text-gray-600 mt-1">Pedido #{saleNumber}</p>
          </div>
        </ModalHeader>
        <ModalBody>
          {/* Alerta informativo */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle
              className="text-blue-600 flex-shrink-0 mt-0.5"
              size={20}
            />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Frete escolhido pelo cliente</p>
              <p>
                Este é o serviço de frete que o cliente selecionou no checkout.
                Confirme para criar o envio com essas informações.
              </p>
            </div>
          </div>

          {/* Informações do frete escolhido */}
          {shippingService && shippingCompany ? (
            <Card className="border-2 border-green-200 bg-green-50">
              <CardBody className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 flex items-center justify-center bg-white rounded-lg shadow-sm">
                    <Truck className="text-green-600" size={32} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Chip
                        color="success"
                        size="sm"
                        startContent={<CheckCircle size={14} />}
                      >
                        Escolhido pelo cliente
                      </Chip>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {shippingService}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {shippingCompany}
                    </p>
                    {shippingCost !== null && shippingCost !== undefined && (
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs text-gray-500">
                          Valor do frete:
                        </span>
                        <span className="text-xl font-bold text-green-600">
                          R$ {Number(shippingCost).toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card className="border-2 border-red-200 bg-red-50">
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-red-600" size={24} />
                  <div>
                    <p className="font-semibold text-red-900">
                      Frete não selecionado
                    </p>
                    <p className="text-sm text-red-700">
                      O cliente não selecionou um serviço de frete no checkout.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Informações adicionais */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">CEP de destino:</span>
              <span className="font-medium text-gray-900">
                {destinationCep}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pedido:</span>
              <span className="font-medium text-gray-900">#{saleNumber}</span>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancelar
          </Button>
          <Button
            color="primary"
            isDisabled={!shippingService || loading}
            isLoading={loading}
            startContent={!loading && <Package size={18} />}
            onPress={handleCreateShipment}
          >
            {loading ? "Criando envio..." : "Confirmar e Criar Envio"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
