"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { AlertCircle, ShoppingBag, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentFailurePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const paymentId = searchParams.get("payment_id");

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full">
                <CardHeader className="flex flex-col items-center gap-4 pt-8">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                        <XCircle className="text-red-600" size={48} />
                    </div>
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-red-600 mb-2">
                            Pagamento Não Aprovado
                        </h1>
                        <p className="text-gray-600">
                            Infelizmente, não foi possível processar seu pagamento
                        </p>
                    </div>
                </CardHeader>

                <CardBody className="space-y-6 pb-8">
                    {paymentId && (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">ID da Tentativa</p>
                            <p className="font-mono font-semibold">{paymentId}</p>
                        </div>
                    )}

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-yellow-900 mb-2">
                                    Possíveis Motivos
                                </h3>
                                <ul className="text-sm text-yellow-800 space-y-1">
                                    <li>• Saldo insuficiente</li>
                                    <li>• Dados do cartão incorretos</li>
                                    <li>• Cartão vencido ou bloqueado</li>
                                    <li>• Limite excedido</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="font-semibold mb-4">O que fazer agora?</h3>
                        <ul className="space-y-3 text-gray-600">
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-blue-600 text-sm font-semibold">
                                        1
                                    </span>
                                </div>
                                <span>Verifique os dados do seu cartão e tente novamente</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-blue-600 text-sm font-semibold">
                                        2
                                    </span>
                                </div>
                                <span>Tente usar outro cartão ou forma de pagamento</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-blue-600 text-sm font-semibold">
                                        3
                                    </span>
                                </div>
                                <span>
                                    Entre em contato com seu banco para verificar o bloqueio
                                </span>
                            </li>
                        </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button
                            className="flex-1"
                            color="primary"
                            size="lg"
                            onPress={() => router.push("/checkout")}
                        >
                            Tentar Novamente
                        </Button>
                        <Button
                            className="flex-1"
                            size="lg"
                            startContent={<ShoppingBag size={20} />}
                            variant="bordered"
                            onPress={() => router.push("/")}
                        >
                            Voltar para Loja
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}

