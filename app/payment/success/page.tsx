"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import { CheckCircle2, Package, ShoppingBag, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const externalReference = searchParams.get("external_reference");

  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const validatePayment = async () => {
      // Se não tem referência, não é válido
      if (!externalReference) {
        setErrorMessage("Pedido não encontrado");
        setIsValid(false);
        setIsValidating(false);
        return;
      }

      try {
        // Verificar o status real do pedido no backend
        const response = await fetch(
          `/api/sale/check-status?saleId=${externalReference}`
        );

        if (!response.ok) {
          setErrorMessage("Não foi possível verificar o status do pedido");
          setIsValid(false);
          setIsValidating(false);
          return;
        }

        const data = await response.json();

        // Apenas permitir acesso se o status for PAGA
        if (data.status === "PAGA") {
          setIsValid(true);
          // Limpar carrinho apenas após validar que o pagamento foi aprovado
          localStorage.removeItem("cart");
        } else {
          // Se não estiver pago, redirecionar para a página apropriada
          setErrorMessage(`Status do pedido: ${data.status}`);
          setIsValid(false);

          // Redirecionar baseado no status
          setTimeout(() => {
            if (data.status === "PENDENTE") {
              router.push(`/payment/pending?external_reference=${externalReference}&payment_id=${paymentId || ""}`);
            } else if (data.status === "CANCELADA") {
              router.push(`/payment/failure?external_reference=${externalReference}&payment_id=${paymentId || ""}`);
            } else {
              router.push("/user/pedidos");
            }
          }, 2000);
        }
      } catch (error) {
        console.error("Erro ao validar pagamento:", error);
        setErrorMessage("Erro ao validar pagamento");
        setIsValid(false);
      } finally {
        setIsValidating(false);
      }
    };

    validatePayment();
  }, [externalReference, paymentId, router]);

  // Exibir carregamento enquanto valida
  if (isValidating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardBody className="flex flex-col items-center gap-4 py-12">
            <Spinner size="lg" color="primary" />
            <p className="text-lg font-semibold">Validando pagamento...</p>
            <p className="text-sm text-gray-600 text-center">
              Aguarde enquanto verificamos o status do seu pedido
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Se não for válido, mostrar erro
  if (!isValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="flex flex-col items-center gap-4 pt-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="text-red-600" size={48} />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-2">
                Acesso Negado
              </h1>
              <p className="text-gray-600">
                {errorMessage || "Este pedido ainda não foi aprovado"}
              </p>
            </div>
          </CardHeader>
          <CardBody className="pb-8">
            <Button
              className="w-full"
              color="primary"
              size="lg"
              onPress={() => router.push("/user/pedidos")}
            >
              Ver Meus Pedidos
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Apenas mostrar sucesso se for válido
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="flex flex-col items-center gap-4 pt-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="text-green-600" size={48} />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-green-600 mb-2">
              Pagamento Aprovado!
            </h1>
            <p className="text-gray-600">
              Seu pedido foi confirmado com sucesso
            </p>
          </div>
        </CardHeader>

        <CardBody className="space-y-6 pb-8">
          {paymentId && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">ID do Pagamento</p>
              <p className="font-mono font-semibold">{paymentId}</p>
            </div>
          )}

          {externalReference && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Número do Pedido</p>
              <p className="font-mono font-semibold">#{externalReference}</p>
            </div>
          )}

          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Package size={20} />
              Próximos Passos
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-semibold">1</span>
                </div>
                <span>
                  Você receberá um email de confirmação com os detalhes do
                  pedido
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-semibold">2</span>
                </div>
                <span>
                  Entraremos em contato via WhatsApp para confirmar a entrega
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-semibold">3</span>
                </div>
                <span>
                  Acompanhe seu pedido na área &quot;Meus Pedidos&quot;
                </span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              className="flex-1"
              color="primary"
              size="lg"
              startContent={<ShoppingBag size={20} />}
              onPress={() => router.push("/")}
            >
              Continuar Comprando
            </Button>
            <Button
              className="flex-1"
              size="lg"
              startContent={<Package size={20} />}
              variant="bordered"
              onPress={() => router.push("/user/pedidos")}
            >
              Ver Meus Pedidos
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Carregando...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
