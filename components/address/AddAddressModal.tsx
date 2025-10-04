"use client";

import type { Address } from "@/models";

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

import { createAddressAction } from "@/controllers";

interface AddAddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    onAddressAdded: (address: Address) => void;
}

const BRAZILIAN_STATES = [
    { value: "AC", label: "Acre" },
    { value: "AL", label: "Alagoas" },
    { value: "AP", label: "Amapá" },
    { value: "AM", label: "Amazonas" },
    { value: "BA", label: "Bahia" },
    { value: "CE", label: "Ceará" },
    { value: "DF", label: "Distrito Federal" },
    { value: "ES", label: "Espírito Santo" },
    { value: "GO", label: "Goiás" },
    { value: "MA", label: "Maranhão" },
    { value: "MT", label: "Mato Grosso" },
    { value: "MS", label: "Mato Grosso do Sul" },
    { value: "MG", label: "Minas Gerais" },
    { value: "PA", label: "Pará" },
    { value: "PB", label: "Paraíba" },
    { value: "PR", label: "Paraná" },
    { value: "PE", label: "Pernambuco" },
    { value: "PI", label: "Piauí" },
    { value: "RJ", label: "Rio de Janeiro" },
    { value: "RN", label: "Rio Grande do Norte" },
    { value: "RS", label: "Rio Grande do Sul" },
    { value: "RO", label: "Rondônia" },
    { value: "RR", label: "Roraima" },
    { value: "SC", label: "Santa Catarina" },
    { value: "SP", label: "São Paulo" },
    { value: "SE", label: "Sergipe" },
    { value: "TO", label: "Tocantins" },
];

export function AddAddressModal({
    isOpen,
    onClose,
    userId,
    onAddressAdded,
}: AddAddressModalProps) {
    const [loading, setLoading] = useState(false);
    const [searchingCep, setSearchingCep] = useState(false);
    const [formData, setFormData] = useState({
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
    });

    const handleCepChange = (value: string) => {
        let formatted = value.replace(/\D/g, "");

        if (formatted.length > 8) {
            formatted = formatted.substring(0, 8);
        }
        if (formatted.length > 5) {
            formatted = `${formatted.substring(0, 5)}-${formatted.substring(5)}`;
        }

        setFormData({ ...formData, zipCode: formatted });
    };

    const handleSearchCep = async () => {
        const cep = formData.zipCode.replace(/\D/g, "");

        if (cep.length !== 8) {
            toast.error("CEP inválido");

            return;
        }

        setSearchingCep(true);

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();

            if (data.erro) {
                toast.error("CEP não encontrado");

                return;
            }

            setFormData({
                ...formData,
                street: data.logradouro || "",
                neighborhood: data.bairro || "",
                city: data.localidade || "",
                state: data.uf || "",
            });

            toast.success("Endereço encontrado!");
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
            toast.error("Erro ao buscar CEP");
        } finally {
            setSearchingCep(false);
        }
    };

    const handleSubmit = async () => {
        // Validação
        if (!formData.zipCode || formData.zipCode.replace(/\D/g, "").length !== 8) {
            toast.error("CEP inválido");

            return;
        }
        if (!formData.street || !formData.number || !formData.neighborhood || !formData.city || !formData.state) {
            toast.error("Preencha todos os campos obrigatórios");

            return;
        }

        setLoading(true);

        try {
            const result = await createAddressAction({
                zipCode: formData.zipCode.replace(/\D/g, ""),
                street: formData.street,
                number: formData.number,
                complement: formData.complement,
                neighborhood: formData.neighborhood,
                city: formData.city,
                state: formData.state,
                userId,
                primary: false,
            });

            if (result.success && result.address) {
                toast.success("Endereço adicionado com sucesso!");
                onAddressAdded(result.address);
                handleClose();
            }
        } catch (error) {
            console.error("Erro ao adicionar endereço:", error);
            toast.error("Erro ao adicionar endereço");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            zipCode: "",
            street: "",
            number: "",
            complement: "",
            neighborhood: "",
            city: "",
            state: "",
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} size="2xl" onClose={handleClose}>
            <ModalContent>
                <ModalHeader>
                    <h2 className="text-xl font-bold">Adicionar Novo Endereço</h2>
                </ModalHeader>
                <ModalBody>
                    <div className="space-y-4">
                        {/* CEP */}
                        <div className="flex gap-2">
                            <Input
                                isRequired
                                isDisabled={loading}
                                label="CEP"
                                maxLength={9}
                                placeholder="00000-000"
                                value={formData.zipCode}
                                variant="bordered"
                                onValueChange={handleCepChange}
                            />
                            <Button
                                className="min-w-[120px] mt-6"
                                color="primary"
                                isDisabled={formData.zipCode.replace(/\D/g, "").length !== 8}
                                isLoading={searchingCep}
                                variant="flat"
                                onPress={handleSearchCep}
                            >
                                Buscar CEP
                            </Button>
                        </div>

                        {/* Rua */}
                        <Input
                            isRequired
                            isDisabled={loading}
                            label="Rua"
                            placeholder="Nome da rua"
                            value={formData.street}
                            variant="bordered"
                            onValueChange={(value) =>
                                setFormData({ ...formData, street: value })
                            }
                        />

                        {/* Número e Complemento */}
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                isRequired
                                isDisabled={loading}
                                label="Número"
                                placeholder="123"
                                value={formData.number}
                                variant="bordered"
                                onValueChange={(value) =>
                                    setFormData({ ...formData, number: value })
                                }
                            />
                            <Input
                                isDisabled={loading}
                                label="Complemento"
                                placeholder="Apto, Bloco, etc"
                                value={formData.complement}
                                variant="bordered"
                                onValueChange={(value) =>
                                    setFormData({ ...formData, complement: value })
                                }
                            />
                        </div>

                        {/* Bairro */}
                        <Input
                            isRequired
                            isDisabled={loading}
                            label="Bairro"
                            placeholder="Nome do bairro"
                            value={formData.neighborhood}
                            variant="bordered"
                            onValueChange={(value) =>
                                setFormData({ ...formData, neighborhood: value })
                            }
                        />

                        {/* Cidade e Estado */}
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                isRequired
                                isDisabled={loading}
                                label="Cidade"
                                placeholder="Nome da cidade"
                                value={formData.city}
                                variant="bordered"
                                onValueChange={(value) =>
                                    setFormData({ ...formData, city: value })
                                }
                            />
                            <Select
                                isRequired
                                isDisabled={loading}
                                label="Estado"
                                placeholder="Selecione o estado"
                                selectedKeys={formData.state ? [formData.state] : []}
                                variant="bordered"
                                onSelectionChange={(keys) => {
                                    const selected = Array.from(keys)[0] as string;

                                    setFormData({ ...formData, state: selected });
                                }}
                            >
                                {BRAZILIAN_STATES.map((state) => (
                                    <SelectItem key={state.value}>
                                        {state.label}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" variant="light" onPress={handleClose}>
                        Cancelar
                    </Button>
                    <Button
                        color="primary"
                        isDisabled={loading}
                        isLoading={loading}
                        onPress={handleSubmit}
                    >
                        Adicionar Endereço
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

