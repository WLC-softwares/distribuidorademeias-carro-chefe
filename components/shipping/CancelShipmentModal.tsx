"use client";

import { Button } from "@heroui/button";
import { Textarea } from "@heroui/input";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CancelShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderProtocol: string;
  onSuccess: () => void;
}

export function CancelShipmentModal({
  isOpen,
  onClose,
  orderId,
  orderProtocol,
  onSuccess,
}: CancelShipmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [reasonId, setReasonId] = useState("4"); // Padrão: Endereço incorreto (único ID válido no sandbox)
  const [description, setDescription] = useState("");

  const cancelReasons = [
    { id: "4", label: "Endereço incorreto / Cancelamento" },
  ];

  const handleCancel = async () => {
    if (!description.trim()) {
      toast.error("Por favor, descreva o motivo do cancelamento");

      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/melhorenvio/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          reasonId: parseInt(reasonId),
          description: description.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();

        throw new Error(error.error || "Erro ao cancelar envio");
      }

      toast.success("Envio cancelado com sucesso! A lista será atualizada.");
      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Erro ao cancelar envio:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao cancelar envio",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setReasonId("4");
      setDescription("");
      onClose();
    }
  };

  return (
    <Modal
      hideCloseButton={loading}
      isDismissable={!loading}
      isOpen={isOpen}
      size="lg"
      onClose={handleClose}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-warning" size={24} />
            <span>Cancelar Envio</span>
          </div>
          <p className="text-sm font-normal text-default-500">
            Protocolo: {orderProtocol}
          </p>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-4">
            {/* Aviso */}
            <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
              <p className="text-sm text-warning-800">
                ⚠️ Esta ação não pode ser desfeita. O envio será cancelado no
                Melhor Envio.
              </p>
            </div>

            {/* Aviso adicional para sandbox */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                ℹ️ <strong>Ambiente Sandbox:</strong> Apenas envios com status
                &quot;Pendente&quot; podem ser cancelados.
              </p>
            </div>

            {/* Descrição */}
            <div>
              <Textarea
                isRequired
                description="Mínimo 10 caracteres"
                isDisabled={loading}
                isInvalid={description.length > 0 && description.length < 10}
                label="Descrição *"
                maxRows={5}
                minRows={3}
                placeholder="Descreva o motivo do cancelamento..."
                value={description}
                onValueChange={setDescription}
              />
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button isDisabled={loading} variant="light" onPress={handleClose}>
            Voltar
          </Button>
          <Button
            color="danger"
            isDisabled={!description.trim() || description.length < 10}
            isLoading={loading}
            onPress={handleCancel}
          >
            Confirmar Cancelamento
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
