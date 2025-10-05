"use client";

import type { Address } from "@/models";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Image } from "@heroui/image";
import { Input, Textarea } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import {
  ArrowLeft,
  Package,
  ShoppingBag,
  User as UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AddressSelector } from "@/components/address";
import { ShippingCalculator } from "@/components/shipping";
import { createSaleAction, getUserWithAddressesAction } from "@/controllers";
import { useAuth, useCart } from "@/hooks";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { items, getTotal, getTotalItems, isInitialized } = useCart();
  const [loading, setLoading] = useState(false);
  const [observacoes, setObservacoes] = useState("");
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [addressLoaded, setAddressLoaded] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState<{
    codigo: string;
    nome: string;
    valor: number;
    prazoEntrega: number;
  } | null>(null);

  // Effect para redirecionamentos
  useEffect(() => {
    // Aguardar o carregamento da autenticação E do carrinho antes de fazer qualquer redirecionamento
    if (authLoading || !isInitialized) return;

    // Redirecionar para login se não estiver autenticado
    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout");

      return;
    }

    // Redirecionar para home se carrinho estiver vazio
    if (isAuthenticated && items.length === 0) {
      // console.log("Carrinho vazio, redirecionando para home");
      router.push("/");
    }
  }, [isAuthenticated, authLoading, items.length, router, isInitialized]);

  // Effect separado para buscar endereços do usuário
  useEffect(() => {
    if (isAuthenticated && user?.id && !addressLoaded) {
      setAddressLoaded(true);
      getUserWithAddressesAction(user.id).then((userData) => {
        if (userData && userData.addresses && userData.addresses.length > 0) {
          setUserAddresses(userData.addresses as Address[]);
          // Pegar endereço principal ou o primeiro
          const primaryAddress =
            userData.addresses.find((e: Address) => e.primary) ||
            userData.addresses[0];

          setSelectedAddress(primaryAddress);
        }
      });
    }
  }, [isAuthenticated, user?.id, addressLoaded]);

  const handleAddressAdded = (address: Address) => {
    setUserAddresses((prev) => [...prev, address]);
  };

  const handleMercadoPagoCheckout = async () => {
    if (!user?.id) {
      alert("Usuário não identificado. Por favor, faça login novamente.");

      return;
    }

    if (items.length === 0) {
      alert("Seu carrinho está vazio. Adicione produtos antes de finalizar.");

      return;
    }

    if (!selectedAddress) {
      alert("Por favor, selecione um endereço de entrega.");

      return;
    }

    setLoading(true);

    try {
      // 1. Criar a venda no banco de dados com o endereço selecionado
      const sale = await createSaleAction({
        usuarioId: user.id,
        items,
        observacoes: observacoes || undefined,
        shippingAddress: {
          zipCode: selectedAddress.zipCode,
          street: selectedAddress.street,
          number: selectedAddress.number,
          complement: selectedAddress.complement || undefined,
          neighborhood: selectedAddress.neighborhood,
          city: selectedAddress.city,
          state: selectedAddress.state,
          country: selectedAddress.country,
        },
      });

      if (!sale || !sale.id) {
        throw new Error("Erro ao criar venda no banco de dados");
      }

      // 2. Criar preferência no Mercado Pago
      const response = await fetch("/api/mercadopago/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            name: item.product.name,
            description: item.product.description,
            quantity: item.quantity,
            price:
              item.saleType === "atacado"
                ? item.product.wholesalePrice
                : item.product.retailPrice,
          })),
          saleId: sale.id,
          saleNumber: sale.numeroVenda,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        console.error("Erro MP:", errorData);
        throw new Error(
          errorData.error || "Erro ao criar preferência de pagamento",
        );
      }

      const { initPoint } = await response.json();

      if (!initPoint) {
        throw new Error("Link de pagamento não foi gerado");
      }

      // 3. Redirecionar para o Mercado Pago
      window.location.href = initPoint;
    } catch (err) {
      console.error("Erro ao processar pedido:", err);
      alert(
        `Erro ao processar pedido: ${err instanceof Error ? err.message : "Tente novamente."}`,
      );
      setLoading(false);
    }
  };

  // Mostrar loading durante autenticação ou carregamento do carrinho
  if (authLoading || !isInitialized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner color="primary" size="lg" />
        <span className="ml-3 text-gray-600">Carregando...</span>
      </div>
    );
  }

  // Não renderizar nada se não autenticado ou carrinho vazio (o useEffect já está redirecionando)
  if (!isAuthenticated || items.length === 0) {
    return null;
  }

  const total = getTotal();
  const totalItems = getTotalItems();

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3 max-w-7xl">
          <Button
            className="text-blue-600"
            startContent={<ArrowLeft size={18} />}
            variant="light"
            onPress={() => router.push("/")}
          >
            Voltar
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Finalizar Pedido
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal - Dados */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dados do Cliente */}
            <Card>
              <CardHeader className="flex items-center gap-2 pb-3">
                <UserIcon size={20} />
                <h2 className="text-xl font-semibold">Seus Dados</h2>
              </CardHeader>
              <Divider />
              <CardBody className="space-y-4">
                <div>
                  <label
                    className="text-sm font-medium text-gray-700 mb-1 block"
                    htmlFor="checkout-nome"
                  >
                    Nome Completo
                  </label>
                  <Input
                    isReadOnly
                    id="checkout-nome"
                    value={user?.name || ""}
                    variant="bordered"
                  />
                </div>
                <div>
                  <label
                    className="text-sm font-medium text-gray-700 mb-1 block"
                    htmlFor="checkout-email"
                  >
                    Email
                  </label>
                  <Input
                    isReadOnly
                    id="checkout-email"
                    value={user?.email || ""}
                    variant="bordered"
                  />
                </div>
              </CardBody>
            </Card>

            {/* Seleção de Endereço */}
            <AddressSelector
              addresses={userAddresses}
              selectedAddressId={selectedAddress?.id}
              userId={user?.id || ""}
              onAddressAdded={handleAddressAdded}
              onAddressSelect={setSelectedAddress}
            />

            {/* Cálculo de Frete */}
            {selectedAddress && (
              <ShippingCalculator
                cep={selectedAddress.zipCode}
                items={items}
                onShippingSelect={setSelectedShipping}
              />
            )}

            {/* Observações */}
            <Card>
              <CardHeader className="flex items-center gap-2 pb-3">
                <Package size={20} />
                <h2 className="text-xl font-semibold">
                  Observações (Opcional)
                </h2>
              </CardHeader>
              <Divider />
              <CardBody>
                <Textarea
                  minRows={4}
                  placeholder="Adicione observações sobre seu pedido..."
                  value={observacoes}
                  variant="bordered"
                  onValueChange={setObservacoes}
                />
              </CardBody>
            </Card>
          </div>

          {/* Coluna Lateral - Resumo */}
          <div className="space-y-6">
            {/* Resumo do Pedido */}
            <Card>
              <CardHeader className="flex items-center gap-2 pb-3">
                <ShoppingBag size={20} />
                <h2 className="text-xl font-semibold">Resumo do Pedido</h2>
              </CardHeader>
              <Divider />
              <CardBody className="space-y-4">
                {/* Lista de Itens */}
                <div className="space-y-3">
                  {items.map((item) => {
                    const mainImage =
                      item.product.images?.find((img) => img.primary)?.url ||
                      "/placeholder-product.png";
                    const price =
                      item.saleType === "atacado"
                        ? item.product.wholesalePrice
                        : item.product.retailPrice;
                    const totalPrice = price * item.quantity;

                    return (
                      <div
                        key={`${item.product.id}-${item.saleType}`}
                        className="flex gap-3"
                      >
                        <div className="w-16 h-16 flex-shrink-0 bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <Image
                            removeWrapper
                            alt={item.product.name}
                            className="w-full h-full object-contain"
                            src={mainImage}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                            {item.product.name}
                          </h4>
                          <Chip
                            className={`mt-1 ${
                              item.saleType === "atacado"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-green-100 text-green-700"
                            }`}
                            size="sm"
                            variant="flat"
                          >
                            {item.saleType === "atacado" ? "Atacado" : "Varejo"}
                          </Chip>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-500">
                              Qtd: {item.quantity}
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                              R$ {totalPrice.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Divider />

                {/* Totais */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Subtotal ({totalItems} itens)
                    </span>
                    <span className="font-medium">R$ {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Entrega</span>
                    {selectedShipping ? (
                      <div className="text-right">
                        <span className="font-medium text-green-600">
                          R$ {selectedShipping.valor.toFixed(2)}
                        </span>
                        <p className="text-xs text-gray-500">
                          {selectedShipping.nome} -{" "}
                          {selectedShipping.prazoEntrega} dias úteis
                        </p>
                      </div>
                    ) : (
                      <span className="font-medium text-orange-600">
                        Calcular
                      </span>
                    )}
                  </div>
                </div>

                <Divider />

                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-gray-900">
                    R$ {(total + (selectedShipping?.valor || 0)).toFixed(2)}
                  </span>
                </div>
              </CardBody>
            </Card>

            {/* Finalizar Pedido */}
            <Card className="border-2 border-blue-600 bg-blue-50">
              <CardBody className="p-4">
                <div className="flex items-start gap-3 mb-4">
                  <svg
                    className="flex-shrink-0 mt-1"
                    fill="none"
                    height="24"
                    viewBox="0 0 24 24"
                    width="24"
                  >
                    <rect fill="#009EE3" height="24" rx="4" width="24" />
                    <path d="M13 8h3v8h-3V8z" fill="#fff" />
                    <path d="M8 12h3v4H8v-4z" fill="#fff" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">
                      Mercado Pago
                    </h3>
                    <p className="text-sm text-blue-800">
                      Pague com cartão, Pix ou boleto. Seguro e rápido.
                      Parcelamento em até 12x.
                    </p>
                  </div>
                </div>
                <Button
                  className="w-full font-semibold"
                  color="primary"
                  isDisabled={loading || items.length === 0 || !user?.id}
                  isLoading={loading}
                  size="lg"
                  onPress={handleMercadoPagoCheckout}
                >
                  {loading
                    ? "Processando..."
                    : items.length === 0
                      ? "Carrinho Vazio"
                      : "Finalizar Pedido"}
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
