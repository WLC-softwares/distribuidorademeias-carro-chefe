import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Link } from "@heroui/link";
import { ChevronRight, Eye, EyeOff, Shield } from "lucide-react";
import NextLink from "next/link";

interface PasswordStepProps {
  email: string;
  password: string;
  isVisible: boolean;
  loading?: boolean;
  setPassword: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  onToggleVisibility: () => void;
}

export function PasswordStep({
  email,
  password,
  isVisible,
  loading = false,
  setPassword,
  onSubmit,
  onBack,
  onToggleVisibility,
}: PasswordStepProps) {
  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      {/* Exibição do e-mail */}
      <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
        <Avatar
          showFallback
          className="bg-blue-500 text-white"
          name={email}
          size="sm"
        />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800">{email}</p>
          <button
            className="text-xs text-blue-500 hover:text-blue-600"
            type="button"
            onClick={onBack}
          >
            Trocar conta
          </button>
        </div>
      </div>

      {/* Campo de Senha */}
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
            disabled={loading}
            type="button"
            onClick={onToggleVisibility}
          >
            {isVisible ? (
              <EyeOff className="text-gray-400 hover:text-gray-600" size={20} />
            ) : (
              <Eye className="text-gray-400 hover:text-gray-600" size={20} />
            )}
          </button>
        }
        isDisabled={loading}
        label="Senha"
        placeholder=""
        size="lg"
        type={isVisible ? "text" : "password"}
        value={password}
        variant="bordered"
        onValueChange={setPassword}
      />

      {/* Botões */}
      <div className="space-y-3">
        <Button
          className="w-full font-semibold bg-blue-500 hover:bg-blue-600 text-white"
          isLoading={loading}
          size="lg"
          type="submit"
        >
          Iniciar sessão
        </Button>
        <Link
          as={NextLink}
          className="block text-center text-sm text-blue-600 hover:text-blue-700"
          href="/forgot-password"
        >
          Esqueceu sua senha?
        </Link>
      </div>

      <Link
        as={NextLink}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm"
        href="/seguranca"
      >
        <Shield size={18} />
        Tenho um problema de segurança
        <ChevronRight size={16} />
      </Link>
    </form>
  );
}
