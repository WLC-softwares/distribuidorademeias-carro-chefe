import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Link } from "@heroui/link";
import { ChevronRight, Shield } from "lucide-react";
import NextLink from "next/link";

interface EmailStepProps {
  email: string;
  setEmail: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function EmailStep({ email, setEmail, onSubmit }: EmailStepProps) {
  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <Input
        isRequired
        classNames={{
          input: "text-base",
          inputWrapper:
            "border-gray-300 hover:border-blue-400 focus-within:border-blue-500",
          label: "text-gray-600",
        }}
        label="E-mail"
        placeholder=""
        size="lg"
        type="email"
        value={email}
        variant="bordered"
        onValueChange={setEmail}
      />

      <Button
        className="w-full font-semibold bg-blue-500 hover:bg-blue-600 text-white"
        size="lg"
        type="submit"
      >
        Continuar
      </Button>
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
