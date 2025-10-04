import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Eye, EyeOff } from "lucide-react";

import { RegisterData } from "../hooks/useRegister";

interface PersonalInfoStepProps {
  formData: RegisterData;
  isPasswordVisible: boolean;
  isConfirmPasswordVisible: boolean;
  updateFormData: (field: keyof RegisterData, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onTogglePasswordVisibility: () => void;
  onToggleConfirmPasswordVisibility: () => void;
}

export function PersonalInfoStep({
  formData,
  isPasswordVisible,
  isConfirmPasswordVisible,
  updateFormData,
  onSubmit,
  onTogglePasswordVisibility,
  onToggleConfirmPasswordVisibility,
}: PersonalInfoStepProps) {
  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <Input
          isRequired
          classNames={{
            input: "text-base",
            inputWrapper:
              "border-gray-300 hover:border-blue-400 focus-within:border-blue-500",
            label: "text-gray-600",
          }}
          label="Nome"
          placeholder="Digite seu nome"
          size="lg"
          type="text"
          value={formData.firstName}
          variant="bordered"
          onValueChange={(value) => updateFormData("firstName", value)}
        />

        <Input
          isRequired
          classNames={{
            input: "text-base",
            inputWrapper:
              "border-gray-300 hover:border-blue-400 focus-within:border-blue-500",
            label: "text-gray-600",
          }}
          label="Sobrenome"
          placeholder="Digite seu sobrenome"
          size="lg"
          type="text"
          value={formData.lastName}
          variant="bordered"
          onValueChange={(value) => updateFormData("lastName", value)}
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
        label="E-mail"
        placeholder="seu@email.com"
        size="lg"
        type="email"
        value={formData.email}
        variant="bordered"
        onValueChange={(value) => updateFormData("email", value)}
      />

      <Input
        isRequired
        classNames={{
          input: "text-base",
          inputWrapper:
            "border-gray-300 hover:border-blue-400 focus-within:border-blue-500",
          label: "text-gray-600",
        }}
        endContent={
          <button
            className="focus:outline-none"
            type="button"
            onClick={onTogglePasswordVisibility}
          >
            {isPasswordVisible ? (
              <EyeOff className="text-gray-400 hover:text-gray-600" size={20} />
            ) : (
              <Eye className="text-gray-400 hover:text-gray-600" size={20} />
            )}
          </button>
        }
        label="Senha"
        placeholder="Mínimo 6 caracteres"
        size="lg"
        type={isPasswordVisible ? "text" : "password"}
        value={formData.password}
        variant="bordered"
        onValueChange={(value) => updateFormData("password", value)}
      />

      <Input
        isRequired
        classNames={{
          input: "text-base",
          inputWrapper:
            "border-gray-300 hover:border-blue-400 focus-within:border-blue-500",
          label: "text-gray-600",
        }}
        endContent={
          <button
            className="focus:outline-none"
            type="button"
            onClick={onToggleConfirmPasswordVisibility}
          >
            {isConfirmPasswordVisible ? (
              <EyeOff className="text-gray-400 hover:text-gray-600" size={20} />
            ) : (
              <Eye className="text-gray-400 hover:text-gray-600" size={20} />
            )}
          </button>
        }
        label="Confirmar Senha"
        placeholder="Digite a senha novamente"
        size="lg"
        type={isConfirmPasswordVisible ? "text" : "password"}
        value={formData.confirmPassword}
        variant="bordered"
        onValueChange={(value) => updateFormData("confirmPassword", value)}
      />

      <Button
        className="w-full font-semibold bg-blue-500 hover:bg-blue-600 text-white mt-2"
        size="lg"
        type="submit"
      >
        Continuar
      </Button>
    </form>
  );
}
