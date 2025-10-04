"use client";

import type { CartItem } from "@/providers";

import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import { Radio, RadioGroup } from "@heroui/radio";
import { Spinner } from "@heroui/spinner";
import { Package, Truck } from "lucide-react";
import { useState } from "react";

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
        const cheapest = data.shippingOptions.reduce(
          (prev: ShippingOption, curr: ShippingOption) =>
            prev.valor < curr.valor ? prev : curr,
        );

        setSelectedOption(cheapest.codigo);
        if (onShippingSelect) {
          onShippingSelect(cheapest);
        }
      } else {
        setError("Nenhuma opção de frete disponível para este CEP");
      }
    } catch (err) {
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
    <Card className="shadow-lg">
      <CardBody className="p-6 space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Truck className="text-blue-600" size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            Calcular Frete
          </h3>
        </div>

        {/* CEP Input */}
        <div className="space-y-2">
          <div className="flex gap-3">
            <Input
              classNames={{
                input: "text-base",
                inputWrapper: "border-2 hover:border-blue-400",
              }}
              isDisabled={loading}
              isInvalid={!!error}
              label="CEP de destino"
              labelPlacement="outside"
              maxLength={9}
              placeholder="00000-000"
              size="lg"
              value={cep}
              variant="bordered"
              onValueChange={handleCepChange}
            />
            <Button
              className="min-w-[120px] font-semibold mt-6"
              color="primary"
              isDisabled={!cep || cep.replace(/\D/g, "").length !== 8}
              isLoading={loading}
              size="lg"
              onPress={handleCalculate}
            >
              {loading ? "Calculando..." : "Calcular"}
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Spinner color="primary" size="lg" />
            <div className="text-center">
              <p className="font-medium text-gray-700">Consultando transportadoras...</p>
              <p className="text-sm text-gray-500">Aguarde um momento</p>
            </div>
          </div>
        )}

        {/* Shipping Options */}
        {!loading && calculated && shippingOptions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold text-gray-800">
                Opções de entrega:
              </p>
              <p className="text-xs text-gray-500">
                {shippingOptions.length} opções disponíveis
              </p>
            </div>
            <RadioGroup
              value={selectedOption}
              onValueChange={handleOptionChange}
            >
              <div className="space-y-3">
                {shippingOptions.map((option) => (
                  <Radio
                    key={option.codigo}
                    classNames={{
                      base: "m-0 bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer data-[selected=true]:border-blue-600 data-[selected=true]:bg-blue-50",
                      wrapper: "group-data-[selected=true]:border-blue-600",
                    }}
                    value={option.codigo}
                  >
                    <div className="flex justify-between items-center w-full gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        {option.logo ? (
                          <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-lg p-2">
                            <img
                              alt={option.empresa}
                              className="w-full h-full object-contain"
                              src={option.logo}
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg">
                            <Package className="text-gray-600" size={24} />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-bold text-base text-gray-900 mb-0.5">
                            {option.nome}
                          </p>
                          <p className="text-xs text-gray-500 mb-1">
                            {option.empresa}
                          </p>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Truck size={14} />
                            <span>
                              Entrega em até {option.prazoEntrega} dias úteis
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Frete</p>
                        <p className="text-2xl font-bold text-green-600">
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

        {/* No Options Message */}
        {!loading && calculated && shippingOptions.length === 0 && !error && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-5 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-3">
              <Package className="text-yellow-600" size={24} />
            </div>
            <p className="font-semibold text-yellow-800 mb-1">
              Nenhuma opção de frete disponível
            </p>
            <p className="text-sm text-yellow-700">
              Por favor, entre em contato conosco para consultar o frete para este CEP.
            </p>
          </div>
        )}

        {/* Info Message */}
        {!calculated && !loading && !error && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Truck className="text-blue-600" size={20} />
                </div>
              </div>
              <div>
                <p className="font-semibold text-blue-900 mb-1">
                  Calcule o frete para sua região
                </p>
                <p className="text-sm text-blue-700">
                  Digite o CEP de entrega acima para ver as opções e valores disponíveis
                </p>
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
