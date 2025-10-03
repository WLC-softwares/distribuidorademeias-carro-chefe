"use client";

import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import { Radio, RadioGroup } from "@heroui/radio";
import { Spinner } from "@heroui/spinner";
import { Package, Truck } from "lucide-react";
import { useState } from "react";

import type { CartItem } from "@/providers";

interface ShippingOption {
    codigo: string;
    nome: string;
    empresa: string;
    valor: number;
    prazoEntrega: number;
    logo?: string;
}

interface ShippingCalculatorProps {
    items: CartItem[];
    onShippingSelect?: (option: ShippingOption | null) => void;
    defaultCep?: string;
}

export function ShippingCalculator({
    items,
    onShippingSelect,
    defaultCep = "",
}: ShippingCalculatorProps) {
    const [cep, setCep] = useState(defaultCep);
    const [loading, setLoading] = useState(false);
    const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
    const [selectedOption, setSelectedOption] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [calculated, setCalculated] = useState(false);

    const handleCepChange = (value: string) => {
        // Formatar CEP automaticamente
        let formatted = value.replace(/\D/g, "");

        if (formatted.length > 8) {
            formatted = formatted.substring(0, 8);
        }
        if (formatted.length > 5) {
            formatted = `${formatted.substring(0, 5)}-${formatted.substring(5)}`;
        }
        setCep(formatted);
        setError("");
    };

    const handleCalculate = async () => {
        if (!cep || cep.replace(/\D/g, "").length !== 8) {
            setError("Por favor, insira um CEP válido");

            return;
        }

        setLoading(true);
        setError("");
        setShippingOptions([]);
        setSelectedOption("");
        setCalculated(false);

        try {
            const response = await fetch("/api/shipping/calculate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    cepDestino: cep.replace(/\D/g, ""),
                    items,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();

                throw new Error(errorData.error || "Erro ao calcular frete");
            }

            const data = await response.json();

            if (data.shippingOptions && data.shippingOptions.length > 0) {
                setShippingOptions(data.shippingOptions);
                setCalculated(true);
                // Selecionar automaticamente a opção mais barata
                const cheapest = data.shippingOptions.reduce((prev: ShippingOption, curr: ShippingOption) =>
                    prev.valor < curr.valor ? prev : curr
                );
                setSelectedOption(cheapest.codigo);
                if (onShippingSelect) {
                    onShippingSelect(cheapest);
                }
            } else {
                setError("Nenhuma opção de frete disponível para este CEP");
            }
        } catch (err) {
            console.error("Erro ao calcular frete:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Erro ao calcular frete. Tente novamente.",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleOptionChange = (codigo: string) => {
        setSelectedOption(codigo);
        const option = shippingOptions.find((opt) => opt.codigo === codigo);

        if (onShippingSelect && option) {
            onShippingSelect(option);
        }
    };

    return (
        <Card>
            <CardBody className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Truck className="text-blue-600" size={24} />
                    <h3 className="text-xl font-semibold text-gray-900">
                        Calcular Frete
                    </h3>
                </div>

                {/* CEP Input */}
                <div className="flex gap-2">
                    <Input
                        label="CEP de destino"
                        placeholder="00000-000"
                        value={cep}
                        variant="bordered"
                        onValueChange={handleCepChange}
                        isDisabled={loading}
                        errorMessage={error}
                        isInvalid={!!error}
                        maxLength={9}
                    />
                    <Button
                        color="primary"
                        isLoading={loading}
                        onPress={handleCalculate}
                        className="min-w-[100px]"
                        isDisabled={!cep || cep.replace(/\D/g, "").length !== 8}
                    >
                        {loading ? "Calculando..." : "Calcular"}
                    </Button>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-8">
                        <Spinner color="primary" size="lg" />
                        <span className="ml-3 text-gray-600">Consultando Correios...</span>
                    </div>
                )}

                {/* Shipping Options */}
                {!loading && calculated && shippingOptions.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-700">
                            Opções de entrega:
                        </p>
                        <RadioGroup value={selectedOption} onValueChange={handleOptionChange}>
                            {shippingOptions.map((option) => (
                                <Radio
                                    key={option.codigo}
                                    value={option.codigo}
                                    classNames={{
                                        base: "border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors",
                                        wrapper: "group-data-[selected=true]:border-blue-600",
                                    }}
                                >
                                    <div className="flex justify-between items-center w-full">
                                        <div className="flex items-center gap-3">
                                            {option.logo ? (
                                                <img
                                                    src={option.logo}
                                                    alt={option.empresa}
                                                    className="w-10 h-10 object-contain"
                                                />
                                            ) : (
                                                <Package size={20} className="text-gray-600" />
                                            )}
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {option.nome}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {option.empresa}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Entrega em até {option.prazoEntrega} dias úteis
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-green-600">
                                                R$ {option.valor.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </Radio>
                            ))}
                        </RadioGroup>
                    </div>
                )}

                {/* No Options Message */}
                {!loading && calculated && shippingOptions.length === 0 && !error && (
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 text-center">
                        <p className="text-sm text-yellow-800">
                            Nenhuma opção de frete disponível para este CEP.
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                            Por favor, entre em contato conosco para consultar o frete.
                        </p>
                    </div>
                )}

                {/* Info Message */}
                {!calculated && !loading && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                            💡 Digite o CEP de entrega para ver as opções e valores de frete
                        </p>
                    </div>
                )}
            </CardBody>
        </Card>
    );
}

