import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Link } from "@heroui/link";
import { ChevronRight, Shield } from "lucide-react";
import NextLink from "next/link";

interface EmailStepProps {
  email: string;
  setEmail: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onGoogleLogin: () => void;
}

export function EmailStep({
  email,
  setEmail,
  onSubmit,
  onGoogleLogin,
}: EmailStepProps) {
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

      <div className="text-center">
        <Link
          as={NextLink}
          className="text-blue-500 hover:text-blue-600 font-medium"
          href="/register"
        >
          Criar conta
        </Link>
      </div>

      {/* <div className="relative">
                <Divider />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-white px-4 text-sm text-gray-500">OU</span>
                </div>
            </div>

            <Button
                type="button"
                variant="bordered"
                size="lg"
                onClick={onGoogleLogin}
                className="w-full font-medium border-gray-300 hover:bg-gray-50"
                startContent={
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                }
            >
                Fazer Login com o Google
            </Button> */}

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
