"use client";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Select, SelectItem } from "@heroui/select";
import { useState } from "react";
import { toast } from "sonner";

interface AddShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddShipmentModal({
  isOpen,
  onClose,
  onSuccess,
}: AddShipmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    service: "",
    // Remetente
    fromName: "",
    fromPhone: "",
    fromEmail: "",
    fromDocument: "",
    fromAddress: "",
    fromNumber: "",
    fromDistrict: "",
    fromCity: "",
    fromState: "",
    fromPostalCode: "",
    // Destinatário
    toName: "",
    toPhone: "",
    toEmail: "",
    toDocument: "",
    toAddress: "",
    toNumber: "",
    toDistrict: "",
    toCity: "",
    toState: "",
    toPostalCode: "",
    // Pacote
    height: "",
    width: "",
    length: "",
    weight: "",
    insuranceValue: "",
    // Produto
    productName: "",
    productQuantity: "1",
    productValue: "",
  });

  const BRAZILIAN_STATES = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
  ];

  const handleSubmit = async () => {
    // Validações básicas
    if (!formData.service || !formData.fromName || !formData.toName) {
      toast.error("Preencha os campos obrigatórios");

      return;
    }

    setLoading(true);

    try {
      const payload = {
        service: parseInt(formData.service),
        from: {
          name: formData.fromName,
          phone: formData.fromPhone,
          email: formData.fromEmail,
          document: formData.fromDocument.replace(/\D/g, ""),
          address: formData.fromAddress,
          number: formData.fromNumber,
          district: formData.fromDistrict,
          city: formData.fromCity,
          state_abbr: formData.fromState,
          country_id: "BR",
          postal_code: formData.fromPostalCode.replace(/\D/g, ""),
        },
        to: {
          name: formData.toName,
          phone: formData.toPhone,
          email: formData.toEmail,
          document: formData.toDocument.replace(/\D/g, ""),
          address: formData.toAddress,
          number: formData.toNumber,
          district: formData.toDistrict,
          city: formData.toCity,
          state_abbr: formData.toState,
          country_id: "BR",
          postal_code: formData.toPostalCode.replace(/\D/g, ""),
        },
        products: [
          {
            name: formData.productName,
            quantity: parseInt(formData.productQuantity),
            unitary_value: parseFloat(formData.productValue),
          },
        ],
        volumes: [
          {
            height: parseInt(formData.height),
            width: parseInt(formData.width),
            length: parseInt(formData.length),
            weight: parseFloat(formData.weight),
          },
        ],
        options: {
          insurance_value: parseFloat(formData.insuranceValue),
          receipt: false,
          own_hand: false,
          reverse: false,
          non_commercial: true,
          platform: "Distribuidora de Meias",
        },
      };

      const response = await fetch("/api/melhorenvio/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();

        throw new Error(error.error || "Erro ao adicionar envio");
      }

      toast.success("Envio adicionado ao carrinho!");
      onSuccess();
      onClose();
      // Resetar formulário
      setFormData({
        service: "",
        fromName: "",
        fromPhone: "",
        fromEmail: "",
        fromDocument: "",
        fromAddress: "",
        fromNumber: "",
        fromDistrict: "",
        fromCity: "",
        fromState: "",
        fromPostalCode: "",
        toName: "",
        toPhone: "",
        toEmail: "",
        toDocument: "",
        toAddress: "",
        toNumber: "",
        toDistrict: "",
        toCity: "",
        toState: "",
        toPostalCode: "",
        height: "",
        width: "",
        length: "",
        weight: "",
        insuranceValue: "",
        productName: "",
        productQuantity: "1",
        productValue: "",
      });
    } catch (error) {
      console.error("Erro ao adicionar envio:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao adicionar envio",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} scrollBehavior="inside" size="5xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader>
          <h2 className="text-2xl font-bold">Adicionar Envio ao Carrinho</h2>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-6">
            {/* Serviço */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Serviço de Transporte
              </h3>
              <Input
                isRequired
                label="ID do Serviço"
                placeholder="Ex: 1, 2, 3..."
                type="number"
                value={formData.service}
                variant="bordered"
                onValueChange={(value) =>
                  setFormData({ ...formData, service: value })
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Consulte os IDs na aba Transportadoras ou faça uma cotação
                primeiro
              </p>
            </div>

            {/* Remetente */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Dados do Remetente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  isRequired
                  label="Nome Completo"
                  value={formData.fromName}
                  variant="bordered"
                  onValueChange={(value) =>
                    setFormData({ ...formData, fromName: value })
                  }
                />
                <Input
                  isRequired
                  label="Telefone"
                  placeholder="(11) 99999-9999"
                  value={formData.fromPhone}
                  variant="bordered"
                  onValueChange={(value) =>
                    setFormData({ ...formData, fromPhone: value })
                  }
                />
                <Input
                  isRequired
                  label="Email"
                  type="email"
                  value={formData.fromEmail}
                  variant="bordered"
                  onValueChange={(value) =>
                    setFormData({ ...formData, fromEmail: value })
                  }
                />
                <Input
                  isRequired
                  label="CPF"
                  placeholder="000.000.000-00"
                  value={formData.fromDocument}
                  variant="bordered"
                  onValueChange={(value) =>
                    setFormData({ ...formData, fromDocument: value })
                  }
                />
                <Input
                  isRequired
                  label="CEP"
                  placeholder="00000-000"
                  value={formData.fromPostalCode}
                  variant="bordered"
                  onValueChange={(value) =>
                    setFormData({ ...formData, fromPostalCode: value })
                  }
                />
                <Input
                  isRequired
                  label="Endereço"
                  value={formData.fromAddress}
                  variant="bordered"
                  onValueChange={(value) =>
                    setFormData({ ...formData, fromAddress: value })
                  }
                />
                <Input
                  isRequired
                  label="Número"
                  value={formData.fromNumber}
                  variant="bordered"
                  onValueChange={(value) =>
                    setFormData({ ...formData, fromNumber: value })
                  }
                />
                <Input
                  isRequired
                  label="Bairro"
                  value={formData.fromDistrict}
                  variant="bordered"
                  onValueChange={(value) =>
                    setFormData({ ...formData, fromDistrict: value })
                  }
                />
                <Input
                  isRequired
                  label="Cidade"
                  value={formData.fromCity}
                  variant="bordered"
                  onValueChange={(value) =>
                    setFormData({ ...formData, fromCity: value })
                  }
                />
                <Select
                  isRequired
                  label="Estado"
                  placeholder="Selecione"
                  selectedKeys={formData.fromState ? [formData.fromState] : []}
                  variant="bordered"
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;

                    setFormData({ ...formData, fromState: selected });
                  }}
                >
                  {BRAZILIAN_STATES.map((state) => (
                    <SelectItem key={state}>{state}</SelectItem>
                  ))}
                </Select>
              </div>
            </div>

            {/* Destinatário */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Dados do Destinatário
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  isRequired
                  label="Nome Completo"
                  value={formData.toName}
                  variant="bordered"
                  onValueChange={(value) =>
                    setFormData({ ...formData, toName: value })
                  }
                />
                <Input
                  isRequired
                  label="Telefone"
                  placeholder="(11) 99999-9999"
                  value={formData.toPhone}
                  variant="bordered"
                  onValueChange={(value) =>
                    setFormData({ ...formData, toPhone: value })
                  }
                />
                <Input
                  isRequired
                  label="Email"
                  type="email"
                  value={formData.toEmail}
                  variant="bordered"
                  onValueChange={(value) =>
                    setFormData({ ...formData, toEmail: value })
                  }
                />
                <Input
                  isRequired
                  label="CPF"
                  placeholder="000.000.000-00"
                  value={formData.toDocument}
                  variant="bordered"
                  onValueChange={(value) =>
                    setFormData({ ...formData, toDocument: value })
                  }
                />
                <Input
                  isRequired
                  label="CEP"
                  placeholder="00000-000"
                  value={formData.toPostalCode}
                  variant="bordered"
                  onValueChange={(value) =>
                    setFormData({ ...formData, toPostalCode: value })
                  }
                />
                <Input
                  isRequired
                  label="Endereço"
                  value={formData.toAddress}
                  variant="bordered"
                  onValueChange={(value) =>
                    setFormData({ ...formData, toAddress: value })
                  }
                />
                <Input
                  isRequired
                  label="Número"
                  value={formData.toNumber}
                  variant="bordered"
                  onValueChange={(value) =>
                    setFormData({ ...formData, toNumber: value })
                  }
                />
                <Input
                  isRequired
                  label="Bairro"
                  value={formData.toDistrict}
                  variant="bordered"
                  onValueChange={(value) =>
                    setFormData({ ...formData, toDistrict: value })
                  }
                />
                <Input
                  isRequired
                  label="Cidade"
                  value={formData.toCity}
                  variant="bordered"
                  onValueChange={(value) =>
                    setFormData({ ...formData, toCity: value })
                  }
                />
                <Select
                  isRequired
                  label="Estado"
                  placeholder="Selecione"
                  selectedKeys={formData.toState ? [formData.toState] : []}
                  variant="bordered"
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;

                    setFormData({ ...formData, toState: selected });
                  }}
                >
                  {BRAZILIAN_STATES.map((state) => (
                    <SelectItem key={state}>{state}</SelectItem>
                  ))}
                </Select>
              </div>
            </div>

            {/* Pacote */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Dimensões do Pacote
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Input
                  isRequired
                  label="Altura (cm)"
                  type="number"
                  value={formData.height}
                  variant="bordered"
                  onValueChange={(value) =>
                    setFormData({ ...formData, height: value })
                  }
                />
                <Input
                  isRequired
                  label="Largura (cm)"
                  type="number"
                  value={formData.width}
                  variant="bordered"
                  onValueChange={(value) =>
                    setFormData({ ...formData, width: value })
                  }
                />
                <Input
                  isRequired
                  label="Comprimento (cm)"
                  type="number"
                  value={formData.length}
                  variant="bordered"
                  onValueChange={(value) =>
                    setFormData({ ...formData, length: value })
                  }
                />
                <Input
                  isRequired
                  label="Peso (kg)"
                  step="0.001"
                  type="number"
                  value={formData.weight}
                  variant="bordered"
                  onValueChange={(value) =>
                    setFormData({ ...formData, weight: value })
                  }
                />
                <Input
                  isRequired
                  label="Valor Seguro (R$)"
                  step="0.01"
                  type="number"
                  value={formData.insuranceValue}
                  variant="bordered"
                  onValueChange={(value) =>
                    setFormData({ ...formData, insuranceValue: value })
                  }
                />
              </div>
            </div>

            {/* Produto */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Produto</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  isRequired
                  label="Nome do Produto"
                  value={formData.productName}
                  variant="bordered"
                  onValueChange={(value) =>
                    setFormData({ ...formData, productName: value })
                  }
                />
                <Input
                  isRequired
                  label="Quantidade"
                  type="number"
                  value={formData.productQuantity}
                  variant="bordered"
                  onValueChange={(value) =>
                    setFormData({ ...formData, productQuantity: value })
                  }
                />
                <Input
                  isRequired
                  label="Valor Unitário (R$)"
                  step="0.01"
                  type="number"
                  value={formData.productValue}
                  variant="bordered"
                  onValueChange={(value) =>
                    setFormData({ ...formData, productValue: value })
                  }
                />
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancelar
          </Button>
          <Button
            color="primary"
            isDisabled={loading}
            isLoading={loading}
            onPress={handleSubmit}
          >
            Adicionar ao Carrinho
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
