import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import { CheckCircle, ChevronLeft, XCircle } from "lucide-react";
import { useState } from "react";

import { RegisterData } from "../hooks/useRegister";

interface AddressStepProps {
  formData: RegisterData;
  updateFormData: (field: keyof RegisterData, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  isLoading: boolean;
}

interface ViaCEPResponse {
  cep: string;
  street: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  erro?: boolean;
}

export function AddressStep({
  formData,
  updateFormData,
  onSubmit,
  onBack,
  isLoading,
}: AddressStepProps) {
  const [cepLoading, setCepLoading] = useState(false);
  const [cepStatus, setCepStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [cepError, setCepError] = useState("");

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    const limited = numbers.slice(0, 8);

    return limited.replace(/(\d{5})(\d)/, "$1-$2");
  };

  const searchCEP = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");

    // Só busca se o CEP tiver 8 dígitos
    if (cleanCep.length !== 8) {
      return;
    }

    setCepLoading(true);
    setCepStatus("idle");
    setCepError("");

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCep}/json/`,
      );
      const data: ViaCEPResponse = await response.json();

      if (data.erro) {
        setCepStatus("error");
        setCepError("CEP não encontrado");

        return;
      }

      // Preencher os campos com os dados da API
      updateFormData("address", data.street || "");
      updateFormData("neighborhood", data.neighborhood || "");
      updateFormData("city", data.city || "");
      updateFormData("state", data.state || "");

      setCepStatus("success");
    } catch (error) {
      console.error("Error searching CEP:", error);
      setCepStatus("error");
      setCepError("Error searching CEP. Try again.");
    } finally {
      setCepLoading(false);
    }
  };

  const handleCepChange = (value: string) => {
    const formatted = formatCEP(value);

    updateFormData("cep", formatted);

    // Resetar status quando o usuário editar o CEP
    if (cepStatus !== "idle") {
      setCepStatus("idle");
      setCepError("");
    }

    // Buscar automaticamente quando o CEP estiver completo
    const cleanCep = formatted.replace(/\D/g, "");

    if (cleanCep.length === 8) {
      searchCEP(formatted);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      {/* Indicador de progresso */}
      <div className="flex items-center justify-center gap-2 mb-2">
        <div className="h-2 w-2 rounded-full bg-blue-500" />
        <div className="h-2 w-2 rounded-full bg-blue-500" />
        <div className="h-2 w-2 rounded-full bg-blue-500" />
      </div>

      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Endereço</h2>
        <p className="text-sm text-gray-600">Última etapa do cadastro</p>
      </div>

      <div className="space-y-2">
        <Input
          isRequired
          classNames={{
            input: "text-base",
            inputWrapper:
              "border-gray-300 hover:border-blue-400 focus-within:border-blue-500",
            label: "text-gray-600",
          }}
          endContent={
            cepLoading ? (
              <Spinner size="sm" />
            ) : cepStatus === "success" ? (
              <CheckCircle className="text-green-500" size={20} />
            ) : cepStatus === "error" ? (
              <XCircle className="text-red-500" size={20} />
            ) : null
          }
          isDisabled={cepLoading}
          label="CEP"
          placeholder="00000-000"
          size="lg"
          type="text"
          value={formData.cep}
          variant="bordered"
          onValueChange={handleCepChange}
        />
        {cepStatus === "success" && (
          <p className="text-xs text-green-600 flex items-center gap-1">
            <CheckCircle size={14} />
            Endereço encontrado! Confira os dados abaixo.
          </p>
        )}
        {cepStatus === "error" && cepError && (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <XCircle size={14} />
            {cepError}
          </p>
        )}
      </div>

      <Input
        isRequired
        classNames={{
          input: "text-base",
          inputWrapper:
            "border-gray-300 hover:border-blue-400 focus-within:border-blue-500",
          label: "text-gray-600",
        }}
        label="Endereço"
        placeholder="Rua, avenida, etc."
        size="lg"
        type="text"
        value={formData.address}
        variant="bordered"
        onValueChange={(value) => updateFormData("address", value)}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          isRequired
          classNames={{
            input: "text-base",
            inputWrapper:
              "border-gray-300 hover:border-blue-400 focus-within:border-blue-500",
            label: "text-gray-600",
          }}
          label="Número"
          placeholder="123"
          size="lg"
          type="text"
          value={formData.number}
          variant="bordered"
          onValueChange={(value) => updateFormData("number", value)}
        />

        <Input
          classNames={{
            input: "text-base",
            inputWrapper:
              "border-gray-300 hover:border-blue-400 focus-within:border-blue-500",
            label: "text-gray-600",
          }}
          label="Complemento"
          placeholder="Apto, bloco, etc."
          size="lg"
          type="text"
          value={formData.complement}
          variant="bordered"
          onValueChange={(value) => updateFormData("complement", value)}
        />
      </div>

      <Input
        isRequired
        classNames={{
          input: "text-base",
          inputWrapper:
            "border-gray-300 hover:border-blue-400 focus-within:border-blue-500",
          label: "text-gray-600",
        }}
        label="Bairro"
        placeholder="Nome do bairro"
        size="lg"
        type="text"
        value={formData.neighborhood}
        variant="bordered"
        onValueChange={(value) => updateFormData("neighborhood", value)}
      />

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <Input
            isRequired
            classNames={{
              input: "text-base",
              inputWrapper:
                "border-gray-300 hover:border-blue-400 focus-within:border-blue-500",
              label: "text-gray-600",
            }}
            label="Cidade"
            placeholder="Nome da cidade"
            size="lg"
            type="text"
            value={formData.city}
            variant="bordered"
            onValueChange={(value) => updateFormData("city", value)}
          />
        </div>

        <Input
          isRequired
          classNames={{
            input: "text-base uppercase",
            inputWrapper:
              "border-gray-300 hover:border-blue-400 focus-within:border-blue-500",
            label: "text-gray-600",
          }}
          label="Estado"
          maxLength={2}
          placeholder="UF"
          size="lg"
          type="text"
          value={formData.state}
          variant="bordered"
          onValueChange={(value) =>
            updateFormData("state", value.toUpperCase())
          }
        />
      </div>

      <div className="flex gap-3 mt-2">
        <Button
          className="font-medium border-gray-300 hover:bg-gray-50"
          isDisabled={isLoading}
          size="lg"
          startContent={<ChevronLeft size={20} />}
          type="button"
          variant="bordered"
          onClick={onBack}
        >
          Voltar
        </Button>
        <Button
          className="flex-1 font-semibold bg-purple-600 hover:bg-purple-700 text-white"
          isLoading={isLoading}
          size="lg"
          type="submit"
        >
          {isLoading ? "Criando conta..." : "Criar conta"}
        </Button>
      </div>
    </form>
  );
}
