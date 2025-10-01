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
  CheckCircle2,
  MapPin,
  MessageCircle,
  Package,
  ShoppingBag,
  User as UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { createSaleAction, getUserWithAddressesAction } from "@/controllers";
import { useAuth, useCart } from "@/hooks";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { items, getTotal, getTotalItems, isInitialized, clearCart } =
    useCart();
  const [loading, setLoading] = useState(false);
  const [observacoes, setObservacoes] = useState("");
  const [userAddress, setUserAddress] = useState<Address | null>(null);
  const [addressLoaded, setAddressLoaded] = useState(false);
  const [saleCreated, setSaleCreated] = useState(false);
  const [saleNumber, setSaleNumber] = useState("");

  // Effect para redirecionamentos
  useEffect(() => {
    // Aguardar o carregamento da autenticação E do carrinho antes de fazer qualquer redirecionamento
    if (authLoading || !isInitialized) return;

    // Redirecionar para login se não estiver autenticado
    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout");

      return;
    }

    // Redirecionar para home se carrinho estiver vazio (mas não se a venda já foi criada)
    if (isAuthenticated && items.length === 0 && !saleCreated) {
      console.log("Carrinho vazio, redirecionando para home");
      router.push("/");
    }
  }, [
    isAuthenticated,
    authLoading,
    items.length,
    router,
    isInitialized,
    saleCreated,
  ]);

  // Effect separado para buscar endereço do usuário
  useEffect(() => {
    if (isAuthenticated && user?.id && !addressLoaded) {
      setAddressLoaded(true);
      getUserWithAddressesAction(user.id).then((userData) => {
        if (userData && userData.enderecos && userData.enderecos.length > 0) {
          // Pegar endereço principal ou o primeiro
          const enderecoPrincipal =
            userData.enderecos.find((e: Address) => e.principal) ||
            userData.enderecos[0];

          setUserAddress(enderecoPrincipal);
        }
      });
    }
  }, [isAuthenticated, user?.id, addressLoaded]);

  const handleWhatsAppCheckout = async () => {
    if (!user?.id) {
      alert("Usuário não identificado. Por favor, faça login novamente.");

      return;
    }

    setLoading(true);

    try {
      // 1. Criar a venda no banco de dados
      const sale = await createSaleAction({
        usuarioId: user.id,
        items,
        observacoes: observacoes || undefined,
      });

      setSaleNumber(sale.numeroVenda);
      setSaleCreated(true);

      // 2. Montar mensagem para WhatsApp
      const separator = "----------------------------";
      let message = "";

      // Cabeçalho com número do pedido
      message += `*NOVO PEDIDO #${sale.numeroVenda}*\n`;
      message += `${separator}\n\n`;

      // Dados do Cliente
      message += `*DADOS DO CLIENTE*\n\n`;
      message += `Nome: ${user?.nome || "Não informado"}\n`;
      message += `Email: ${user?.email}\n`;

      if (user?.telefone) {
        message += `Telefone: ${user.telefone}\n`;
      }

      if (user?.cpf) {
        message += `CPF: ${user.cpf}\n`;
      }

      message += `\n${separator}\n\n`;

      // Endereço
      message += `*ENDERECO DE ENTREGA*\n\n`;
      if (userAddress) {
        message += `${userAddress.logradouro}, ${userAddress.numero}\n`;
        if (userAddress.complemento) {
          message += `${userAddress.complemento}\n`;
        }
        message += `${userAddress.bairro}\n`;
        message += `${userAddress.cidade} - ${userAddress.estado}\n`;
        message += `CEP: ${userAddress.cep}\n`;
      } else {
        message += `Endereco nao cadastrado\n`;
        message += `Por favor, informe o endereco de entrega\n`;
      }
      message += `\n${separator}\n\n`;

      // Itens do Pedido
      message += `*ITENS DO PEDIDO*\n\n`;

      items.forEach((item, index) => {
        const subtotal = Number(item.product.preco) * item.quantidade;

        message += `${index + 1}. ${item.product.nome}\n`;
        message += `Tipo: ${item.tipoVenda === "atacado" ? "Atacado" : "Varejo"}\n`;
        message += `Quantidade: ${item.quantidade}x\n`;
        message += `Preco Unit.: R$ ${Number(item.product.preco).toFixed(2)}\n`;
        message += `Subtotal: R$ ${subtotal.toFixed(2)}\n\n`;
      });

      message += `${separator}\n\n`;

      // Total
      const totalItems = getTotalItems();
      const total = getTotal();

      message += `*RESUMO DO PEDIDO*\n\n`;
      message += `Total de itens: ${totalItems}\n`;
      message += `*VALOR TOTAL: R$ ${total.toFixed(2)}*\n\n`;

      message += `${separator}\n\n`;

      // Observações (se houver)
      if (observacoes) {
        message += `*OBSERVACOES*\n\n`;
        message += `${observacoes}\n\n`;
        message += `${separator}\n\n`;
      }

      // Rodapé
      const now = new Date();
      const dataHora = now.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      message += `Data/Hora: ${dataHora}\n`;
      message += `Loja: Distribuidora de Meias Carro Chefe\n`;
      message += `Pedido: #${sale.numeroVenda}\n`;
      message += `\nAguardando confirmacao para finalizar o pedido!`;

      const phoneNumber = "5511961667767";
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;

      // 3. Abrir WhatsApp em nova aba
      window.open(whatsappUrl, "_blank");

      // 4. Limpar carrinho após 2 segundos (dar tempo para o WhatsApp abrir)
      setTimeout(() => {
        clearCart();
        // Redirecionar para página de confirmação ou home após 3 segundos
        setTimeout(() => {
          router.push("/");
        }, 3000);
      }, 2000);
    } catch (err) {
      console.error("Erro ao processar pedido:", err);
      alert("Erro ao processar pedido. Tente novamente.");
      setSaleCreated(false);
    } finally {
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
                  <label htmlFor="checkout-nome" className="text-sm font-medium text-gray-700 mb-1 block">
                    Nome Completo
                  </label>
                  <Input
                    id="checkout-nome"
                    isReadOnly
                    value={user?.nome || ""}
                    variant="bordered"
                  />
                </div>
                <div>
                  <label htmlFor="checkout-email" className="text-sm font-medium text-gray-700 mb-1 block">
                    Email
                  </label>
                  <Input
                    id="checkout-email"
                    isReadOnly
                    value={user?.email || ""}
                    variant="bordered"
                  />
                </div>
              </CardBody>
            </Card>

            {/* Endereço de Entrega */}
            <Card>
              <CardHeader className="flex items-center gap-2 pb-3">
                <MapPin size={20} />
                <h2 className="text-xl font-semibold">Endereço de Entrega</h2>
              </CardHeader>
              <Divider />
              <CardBody>
                {userAddress ? (
                  <div className="space-y-2">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="font-medium text-gray-900">
                        {userAddress.logradouro}, {userAddress.numero}
                      </p>
                      {userAddress.complemento && (
                        <p className="text-sm text-gray-600">
                          {userAddress.complemento}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        {userAddress.bairro}
                      </p>
                      <p className="text-sm text-gray-600">
                        {userAddress.cidade} - {userAddress.estado}
                      </p>
                      <p className="text-sm text-gray-600">
                        CEP: {userAddress.cep}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 italic">
                      * O endereço será confirmado com nossa equipe via WhatsApp
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Você ainda não possui um endereço cadastrado.
                    </p>
                    <p className="text-sm text-gray-500">
                      O endereço de entrega será solicitado via WhatsApp com
                      nossa equipe.
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>

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
                    const imagemPrincipal =
                      item.product.imagens?.find((img) => img.principal)?.url ||
                      "/placeholder-product.png";
                    const precoTotal = item.product.preco * item.quantidade;

                    return (
                      <div
                        key={`${item.product.id}-${item.tipoVenda}`}
                        className="flex gap-3"
                      >
                        <div className="w-16 h-16 flex-shrink-0 bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <Image
                            removeWrapper
                            alt={item.product.nome}
                            className="w-full h-full object-contain"
                            src={imagemPrincipal}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                            {item.product.nome}
                          </h4>
                          <Chip
                            className={`mt-1 ${item.tipoVenda === "atacado"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-green-100 text-green-700"
                              }`}
                            size="sm"
                            variant="flat"
                          >
                            {item.tipoVenda === "atacado"
                              ? "Atacado"
                              : "Varejo"}
                          </Chip>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-500">
                              Qtd: {item.quantidade}
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                              R$ {precoTotal.toFixed(2)}
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
                    <span className="font-medium text-green-600">
                      A combinar
                    </span>
                  </div>
                </div>

                <Divider />

                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-gray-900">
                    R$ {total.toFixed(2)}
                  </span>
                </div>
              </CardBody>
            </Card>

            {/* Botão de Finalizar ou Mensagem de Sucesso */}
            {saleCreated ? (
              <Card className="bg-green-50 border-2 border-green-600">
                <CardBody className="p-6 text-center space-y-3">
                  <CheckCircle2 className="mx-auto text-green-600" size={48} />
                  <h3 className="text-lg font-bold text-green-900">
                    Pedido Criado com Sucesso!
                  </h3>
                  <p className="text-sm text-green-700">
                    Número do pedido:{" "}
                    <span className="font-mono font-bold">#{saleNumber}</span>
                  </p>
                  <p className="text-xs text-gray-600">
                    Continue a conversa no WhatsApp para confirmar o pagamento.
                    <br />
                    Redirecionando para a página inicial...
                  </p>
                </CardBody>
              </Card>
            ) : (
              <Card className="bg-green-50 border-2 border-green-600">
                <CardBody className="p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <MessageCircle
                      className="text-green-600 flex-shrink-0 mt-1"
                      size={24}
                    />
                    <div>
                      <h3 className="font-semibold text-green-900 mb-1">
                        Checkout via WhatsApp
                      </h3>
                      <p className="text-sm text-green-700">
                        Finalize seu pedido diretamente com nossa equipe pelo
                        WhatsApp. Confirmaremos detalhes de entrega e pagamento.
                      </p>
                    </div>
                  </div>
                  <Button
                    className="w-full font-semibold"
                    color="success"
                    isLoading={loading}
                    size="lg"
                    startContent={<MessageCircle size={20} />}
                    onPress={handleWhatsAppCheckout}
                  >
                    Finalizar no WhatsApp
                  </Button>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
