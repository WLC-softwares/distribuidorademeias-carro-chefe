"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Clock, Package, ShoppingBag } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentPendingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const externalReference = searchParams.get("external_reference");

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
