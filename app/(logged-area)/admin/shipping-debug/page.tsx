"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Code } from "@heroui/code";
import { Input } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import { useState } from "react";

export default function ShippingDebugPage() {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [cep, setCep] = useState("06381470");
    const [shippingResult, setShippingResult] = useState<any>(null);
    const [calculating, setCalculating] = useState(false);

    const checkConfig = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/shipping/debug");
            const data = await response.json();
            setConfig(data);
        } catch (error) {
            console.error("Erro ao verificar config:", error);
        } finally {
            setLoading(false);
        }
    };

    const testShipping = async () => {
        setCalculating(true);
        setShippingResult(null);
        try {
            const response = await fetch("/api/shipping/calculate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    cepDestino: cep.replace(/\D/g, ""),
                    items: [
                        {
                            product: {
                                id: "test-1",
                                name: "Meia Teste",
                                weight: 0.08,
                            },
                            quantity: 5,
                        },
                    ],
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                setShippingResult({ error });
            } else {
                const data = await response.json();
                setShippingResult(data);
            }
        } catch (error) {
            setShippingResult({ error: String(error) });
        } finally {
            setCalculating(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Debug - Melhor Envio</h1>
                <p className="text-gray-600 mt-1">
                    Ferramenta de diagnóstico da integração com Melhor Envio
                </p>
            </div>

            {/* Verificar Configuração */}
            <Card>
                <CardHeader className="pb-0">
                    <h2 className="text-xl font-semibold">1. Verificar Configuração</h2>
                </CardHeader>
                <CardBody className="space-y-4">
                    <Button color="primary" isLoading={loading} onPress={checkConfig}>
                        Verificar Configuração
                    </Button>

                    {config && (
                        <div className="space-y-2">
                            <div
                                className={`p-4 rounded-lg border-2 ${config.mode === "production"
                                    ? "bg-green-50 border-green-500"
                                    : "bg-yellow-50 border-yellow-500"
                                    }`}
                            >
                                <p className="font-semibold text-lg mb-2">{config.message}</p>
                                <div className="space-y-1 text-sm">
                                    <p>
                                        <strong>Modo:</strong> {config.mode}
                                    </p>
                                    <p>
                                        <strong>Token configurado:</strong>{" "}
                                        {config.config.hasToken ? "✅ Sim" : "❌ Não"}
                                    </p>
                                    {config.config.hasToken && (
                                        <p>
                                            <strong>Token length:</strong> {config.config.tokenLength}{" "}
                                            caracteres
                                        </p>
                                    )}
                                    <p>
                                        <strong>CEP Origem:</strong>{" "}
                                        {config.config.hasCepOrigem
                                            ? `✅ ${config.config.cepOrigem}`
                                            : "❌ Não configurado"}
                                    </p>
                                    <p>
                                        <strong>API URL:</strong> {config.config.apiUrl}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Testar Cálculo de Frete */}
            <Card>
                <CardHeader className="pb-0">
                    <h2 className="text-xl font-semibold">2. Testar Cálculo de Frete</h2>
                </CardHeader>
                <CardBody className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            label="CEP de Destino"
                            placeholder="06381-470"
                            value={cep}
                            variant="bordered"
                            onValueChange={setCep}
                        />
                        <Button
                            className="min-w-[150px]"
                            color="primary"
                            isLoading={calculating}
                            onPress={testShipping}
                        >
                            Calcular Frete
                        </Button>
                    </div>

                    {calculating && (
                        <div className="flex items-center gap-2">
                            <Spinner size="sm" />
                            <span>Calculando... (verifique o console do servidor para logs)</span>
                        </div>
                    )}

                    {shippingResult && (
                        <div>
                            <p className="font-semibold mb-2">Resultado:</p>
                            {shippingResult.error ? (
                                <div className="bg-red-50 border-2 border-red-500 p-4 rounded-lg">
                                    <p className="font-semibold text-red-700">Erro:</p>
                                    <Code className="mt-2">
                                        {JSON.stringify(shippingResult.error, null, 2)}
                                    </Code>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-blue-50 border-2 border-blue-500 p-4 rounded-lg">
                                        <p className="font-semibold">
                                            ✅ {shippingResult.shippingOptions?.length || 0} opções
                                            retornadas
                                        </p>
                                        <p className="text-sm mt-1">
                                            <strong>Peso:</strong> {shippingResult.packageInfo?.weight}kg
                                            {" | "}
                                            <strong>Dimensões:</strong>{" "}
                                            {shippingResult.packageInfo?.dimensions?.length}x
                                            {shippingResult.packageInfo?.dimensions?.width}x
                                            {shippingResult.packageInfo?.dimensions?.height}cm
                                        </p>
                                    </div>

                                    {shippingResult.shippingOptions?.map((option: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className="bg-white border border-gray-300 p-4 rounded-lg"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-lg">{option.nome}</p>
                                                    <p className="text-sm text-gray-600">{option.empresa}</p>
                                                    <p className="text-sm">
                                                        Prazo: {option.prazoEntrega} dias úteis
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-green-600">
                                                        R$ {option.valor.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <details className="mt-4">
                                        <summary className="cursor-pointer font-semibold">
                                            Ver JSON completo
                                        </summary>
                                        <Code className="mt-2 block overflow-auto max-h-96">
                                            {JSON.stringify(shippingResult, null, 2)}
                                        </Code>
                                    </details>
                                </div>
                            )}
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Instruções */}
            <Card>
                <CardHeader className="pb-0">
                    <h2 className="text-xl font-semibold">Como Debugar</h2>
                </CardHeader>
                <CardBody>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>
                            <strong>Verifique a configuração</strong> - Certifique-se que o token
                            está configurado
                        </li>
                        <li>
                            <strong>Teste o cálculo</strong> - Use um CEP real e veja quantas
                            opções retornam
                        </li>
                        <li>
                            <strong>Verifique os logs do servidor</strong> - No terminal onde o
                            Next.js está rodando, procure por:
                            <ul className="list-disc list-inside ml-6 mt-1">
                                <li>⚠️ Modo simulado</li>
                                <li>❌ Erros da API</li>
                                <li>✅ Quantidade de opções retornadas</li>
                            </ul>
                        </li>
                        <li>
                            <strong>Compare com o Melhor Envio</strong> - Acesse{" "}
                            <a
                                className="text-blue-600 underline"
                                href="https://melhorenvio.com.br/calculadora"
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                calculadora oficial
                            </a>{" "}
                            e compare os resultados
                        </li>
                    </ol>
                </CardBody>
            </Card>
        </div>
    );
}

