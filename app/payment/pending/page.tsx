"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import { Clock, Package, ShoppingBag } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function PaymentPendingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const externalReference = searchParams.get("external_reference");
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [statusMessage, setStatusMessage] = useState("Verificando status do pagamento...");

  // Polling: verificar status do pagamento a cada 3 segundos
  useEffect(() => {
    if (!externalReference) {
      setCheckingStatus(false);
      return;
    }

    let attempts = 0;
    const maxAttempts = 40; // 40 tentativas x 3 segundos = 2 minutos

    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(
          `/api/sale/check-status?saleId=${externalReference}`
        );

        if (response.ok) {
          const data = await response.json();

          if (data.status === "PAGO") {
            setStatusMessage("Pagamento confirmado! Redirecionando...");
            setTimeout(() => {
              router.push(`/payment/success?external_reference=${externalReference}&payment_id=${paymentId || ""}`);
            }, 1000);
            return true;
          }
        }

        return false;
      } catch (error) {
        console.error("Erro ao verificar status:", error);
        return false;
      }
    };

    const intervalId = setInterval(async () => {
      attempts++;

      const isPaid = await checkPaymentStatus();

      if (isPaid || attempts >= maxAttempts) {
        clearInterval(intervalId);
        setCheckingStatus(false);
        
        if (!isPaid) {
          setStatusMessage("Ainda aguardando confirmação do pagamento");
        }
      }
    }, 3000);

    // Verificar imediatamente na montagem
    checkPaymentStatus().then((isPaid) => {
      if (isPaid) {
        clearInterval(intervalId);
        setCheckingStatus(false);
      }
    });

    return () => clearInterval(intervalId);
  }, [externalReference, paymentId, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="flex flex-col items-center gap-4 pt-8">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
            <Clock className="text-yellow-600" size={48} />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-yellow-600 mb-2">
              Pagamento Pendente
            </h1>
            <p className="text-gray-600">
              Estamos aguardando a confirmação do pagamento
            </p>
          </div>
        </CardHeader>

        <CardBody className="space-y-6 pb-8">
          {/* Indicador de verificação automática */}
          {checkingStatus && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
              <Spinner size="sm" color="primary" />
              <div>
                <p className="font-semibold text-blue-900">{statusMessage}</p>
                <p className="text-sm text-blue-700">
                  Se você já pagou o Pix, aguarde alguns segundos. A página será atualizada automaticamente.
                </p>
              </div>
            </div>
          )}

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

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              Métodos de Pagamento Pendentes
            </h3>
            <p className="text-sm text-blue-800 mb-3">
              Alguns métodos de pagamento podem levar mais tempo para processar:
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Boleto bancário (1-3 dias úteis)</li>
              <li>• Pix (até 24 horas)</li>
              <li>• Transferência bancária (1-2 dias úteis)</li>
            </ul>
          </div>

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
                  Você receberá um email assim que o pagamento for confirmado
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-semibold">2</span>
                </div>
                <span>
                  Acompanhe o status do pagamento na área &quot;Meus
                  Pedidos&quot;
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-semibold">3</span>
                </div>
                <span>
                  Após a confirmação, processaremos e enviaremos seu pedido
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

export default function PaymentPendingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Carregando...</div>}>
      <PaymentPendingContent />
    </Suspense>
  );
}
