"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Checkbox } from "@heroui/checkbox";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { Tab, Tabs } from "@heroui/tabs";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  CreditCard,
  MapPin,
  Package,
  Plus,
  Printer,
  RefreshCw,
  Search,
  ShoppingCart,
  Truck,
  User,
  Wallet,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AddShipmentModal, CancelShipmentModal } from "@/components/shipping";

export default function ShippingsPage() {
  const [loading, setLoading] = useState(false);
  const [shipments, setShipments] = useState<any[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [balance, setBalance] = useState<any>(null);
  const [carriers, setCarriers] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedShipments, setSelectedShipments] = useState<Set<string>>(
    new Set(),
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedCancelShipment, setSelectedCancelShipment] = useState<{
    id: string;
    protocol: string;
  } | null>(null);
  const [hasTokenError, setHasTokenError] = useState(false);
  const [expandedShipment, setExpandedShipment] = useState<string | null>(null);
  const [generatingLabels, setGeneratingLabels] = useState<Set<string>>(
    new Set(),
  );

  // Carregar envios
  const loadShipments = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/melhorenvio/shipments");

      if (response.status === 401 || response.status === 500) {
        const error = await response.json();

        if (error.error?.includes("Token") || error.error?.includes("401")) {
          setHasTokenError(true);
          setLoading(false);

          return;
        }
      }

      if (!response.ok) throw new Error("Erro ao carregar envios");

      const data = await response.json();

      setShipments(data.data || []);
      setHasTokenError(false);
    } catch (error) {
      console.error("Erro ao carregar envios:", error);
      if (!hasTokenError) {
        toast.error("Erro ao carregar envios");
      }
    } finally {
      setLoading(false);
    }
  };

  // Carregar carrinho
  const loadCart = async () => {
    try {
      const response = await fetch("/api/melhorenvio/cart");

      if (response.status === 401 || response.status === 500) {
        const error = await response.json();

        if (error.error?.includes("Token") || error.error?.includes("401")) {
          setHasTokenError(true);

          return;
        }
      }

      if (!response.ok) throw new Error("Erro ao carregar carrinho");

      const data = await response.json();

      setCartItems(Array.isArray(data) ? data : []);
      setHasTokenError(false);
    } catch (error) {
      console.error("Erro ao carregar carrinho:", error);
      // Não mostrar toast se for erro de token
      if (!hasTokenError) {
        toast.error("Erro ao carregar carrinho");
      }
    }
  };

  // Carregar saldo
  const loadBalance = async () => {
    try {
      const response = await fetch("/api/melhorenvio/info?type=balance");

      if (!response.ok) throw new Error("Erro ao carregar saldo");

      const data = await response.json();

      setBalance(data);
    } catch (error) {
      console.error("Erro ao carregar saldo:", error);
    }
  };

  // Carregar transportadoras
  const loadCarriers = async () => {
    try {
      const response = await fetch("/api/melhorenvio/info?type=carriers");

      if (!response.ok) throw new Error("Erro ao carregar transportadoras");

      const data = await response.json();

      setCarriers(data);
    } catch (error) {
      console.error("Erro ao carregar transportadoras:", error);
    }
  };

  // Checkout dos itens do carrinho
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error("Carrinho vazio");

      return;
    }

    const orderIds = cartItems.map((item) => item.id);

    setLoading(true);
    try {
      const response = await fetch("/api/melhorenvio/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds }),
      });

      if (!response.ok) throw new Error("Erro ao fazer checkout");

      toast.success("Checkout realizado com sucesso!");
      await loadCart();
      await loadShipments();
      await loadBalance();
    } catch (error) {
      console.error("Erro ao fazer checkout:", error);
      toast.error("Erro ao fazer checkout");
    } finally {
      setLoading(false);
    }
  };

  // Gerar etiquetas
  const handleGenerateLabels = async (orderIds: string[]) => {
    // Marcar como gerando
    setGeneratingLabels((prev) => new Set([...Array.from(prev), ...orderIds]));
    setLoading(true);

    // Toast de progresso
    const toastId = toast.loading(
      "Gerando etiquetas... Isso pode levar alguns segundos.",
    );

    try {
      // 1. Gerar etiquetas
      const response = await fetch("/api/melhorenvio/labels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds, action: "generate" }),
      });

      if (!response.ok) throw new Error("Erro ao gerar etiquetas");

      toast.loading("Etiquetas enviadas para geração! Aguarde...", {
        id: toastId,
      });

      // 2. Aguardar 3 segundos para o Melhor Envio processar
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // 3. Verificar status (polling) - máximo 5 tentativas
      let attempts = 0;
      const maxAttempts = 5;

      while (attempts < maxAttempts) {
        attempts++;
        toast.loading(`Verificando status... (${attempts}/${maxAttempts})`, {
          id: toastId,
        });

        // Recarregar a lista de envios
        await loadShipments();

        // Pequena pausa entre verificações
        if (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      toast.success("Etiquetas prontas! A lista foi atualizada.", {
        id: toastId,
      });
    } catch (error) {
      console.error("Erro ao gerar etiquetas:", error);
      toast.error("Erro ao gerar etiquetas", { id: toastId });
    } finally {
      // Remover da lista de gerando
      setGeneratingLabels((prev) => {
        const newSet = new Set(prev);

        orderIds.forEach((id) => newSet.delete(id));

        return newSet;
      });
      setLoading(false);
    }
  };

  // Imprimir etiquetas
  const handlePrintLabels = async (orderIds: string[]) => {
    setLoading(true);
    try {
      const response = await fetch("/api/melhorenvio/labels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds, action: "print", mode: "public" }),
      });

      if (!response.ok) throw new Error("Erro ao imprimir etiquetas");

      const data = await response.json();

      // Abrir o PDF em nova aba
      if (data.url) {
        window.open(data.url, "_blank");
        toast.success("Etiqueta aberta em nova aba!");
      } else {
        console.error("❌ Nenhuma URL retornada. Dados completos:", data);
        toast.error("Nenhuma URL de etiqueta foi retornada");
      }
    } catch (error) {
      console.error("Erro ao imprimir etiquetas:", error);
      toast.error("Erro ao imprimir etiquetas");
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal de cancelamento
  const handleOpenCancelModal = (orderId: string, protocol: string) => {
    setSelectedCancelShipment({ id: orderId, protocol });
    setIsCancelModalOpen(true);
  };

  // Callback após cancelamento bem-sucedido
  const handleCancelSuccess = async () => {
    await loadShipments();
    await loadBalance();
  };

  // Remover item do carrinho
  const handleRemoveFromCart = async (itemId: string) => {
    try {
      const response = await fetch(`/api/melhorenvio/cart?itemId=${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erro ao remover do carrinho");

      toast.success("Item removido do carrinho!");
      await loadCart();
    } catch (error) {
      console.error("Erro ao remover do carrinho:", error);
      toast.error("Erro ao remover do carrinho");
    }
  };

  // Copiar código de rastreio
  const handleCopyTracking = async (tracking: string) => {
    try {
      await navigator.clipboard.writeText(tracking);
      toast.success("Código de rastreio copiado!");
    } catch (error) {
      console.error("Erro ao copiar código:", error);
      toast.error("Erro ao copiar código de rastreio");
    }
  };

  useEffect(() => {
    loadShipments();
    loadCart();
    loadBalance();
    loadCarriers();
  }, []);

  const getStatusColor = (status: string) => {
    const statusMap: Record<
      string,
      "warning" | "success" | "danger" | "default"
    > = {
      pending: "warning",
      paid: "success",
      posted: "success",
      delivered: "success",
      canceled: "danger",
      released: "success",
    };

    return statusMap[status] || "default";
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "Pendente",
      paid: "Pago",
      posted: "Postado",
      delivered: "Entregue",
      canceled: "Cancelado",
      released: "Postado",
    };

    return statusMap[status] || status;
  };

  // Funções de formatação
  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");

    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }

    return phone;
  };

  const formatCPF = (cpf: string) => {
    const cleaned = cpf.replace(/\D/g, "");

    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
    }

    return cpf;
  };

  const formatZipCode = (zipCode: string) => {
    const cleaned = zipCode.replace(/\D/g, "");

    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    }

    return zipCode;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR");
  };

  const filteredShipments = shipments.filter(
    (shipment) =>
      shipment.to?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.protocol?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Filtrar por aba
  const getShipmentsForTab = () => {
    if (selectedTab === "list") {
      return filteredShipments.filter(
        (s) => s.status === "released" || s.status === "paid",
      );
    } else if (selectedTab === "posted") {
      return filteredShipments.filter(
        (s) => s.status === "posted" || s.status === "delivered",
      );
    }

    return filteredShipments;
  };

  const tabShipments = getShipmentsForTab();

  // Manipular seleção múltipla
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedShipments(new Set(tabShipments.map((s) => s.id)));
    } else {
      setSelectedShipments(new Set());
    }
  };

  const handleSelectShipment = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedShipments);

    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedShipments(newSelected);
  };

  // Ações em massa
  const handleBulkGenerateLabels = async () => {
    if (selectedShipments.size === 0) {
      toast.error("Selecione ao menos um envio");

      return;
    }

    await handleGenerateLabels(Array.from(selectedShipments));
    setSelectedShipments(new Set());
  };

  const handleBulkPrintLabels = async () => {
    if (selectedShipments.size === 0) {
      toast.error("Selecione ao menos um envio");

      return;
    }

    await handlePrintLabels(Array.from(selectedShipments));
    setSelectedShipments(new Set());
  };

  const handleBulkCheckout = async () => {
    if (selectedShipments.size === 0) {
      toast.error("Selecione ao menos um envio");

      return;
    }

    const orderIds = Array.from(selectedShipments);

    setLoading(true);
    try {
      const response = await fetch("/api/melhorenvio/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds }),
      });

      if (!response.ok) throw new Error("Erro ao fazer checkout");

      toast.success("Checkout realizado com sucesso!");
      setSelectedShipments(new Set());
      await loadShipments();
      await loadBalance();
    } catch (error) {
      console.error("Erro ao fazer checkout:", error);
      toast.error("Erro ao fazer checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Aviso de Token Inválido */}
      {hasTokenError && (
        <Card className="border-2 border-red-500 bg-red-50">
          <CardBody className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="text-red-600" size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-900 mb-2">
                  Token do Melhor Envio Inválido ou Não Configurado
                </h3>
                <p className="text-red-800 mb-4">
                  O token de acesso à API do Melhor Envio não está configurado
                  ou está inválido (erro 401 - Unauthorized).
                </p>
                <div className="bg-white/50 p-4 rounded-lg border border-red-200 space-y-2">
                  <p className="font-semibold text-red-900">Para configurar:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-red-800">
                    <li>
                      Acesse{" "}
                      <a
                        className="underline font-medium"
                        href="https://melhorenvio.com.br"
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        melhorenvio.com.br
                      </a>{" "}
                      e faça login
                    </li>
                    <li>
                      Vá em <strong>Configurações → API</strong> e gere um token
                    </li>
                    <li>
                      Adicione o token no arquivo{" "}
                      <code className="bg-red-100 px-1 rounded">.env</code>:
                    </li>
                  </ol>
                  <pre className="bg-gray-900 text-green-400 p-3 rounded mt-2 text-xs overflow-x-auto">
                    MELHOR_ENVIO_TOKEN=seu_token_aqui
                    {"\n"}MELHOR_ENVIO_API_URL=https://melhorenvio.com.br/api/v2
                  </pre>
                  <p className="text-xs text-red-700 mt-2">
                    <strong>Importante:</strong> Reinicie o servidor após
                    configurar o token
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Gerenciamento de Envios
          </h1>
          <p className="text-gray-600 mt-2">Gerencie envios do Melhor Envio</p>
        </div>
        <div className="flex gap-3">
          {balance && (
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
              <CardBody className="p-4 flex flex-row items-center gap-3">
                <Wallet className="text-green-600" size={24} />
                <div>
                  <p className="text-xs text-gray-600">Saldo Disponível</p>
                  <p className="text-lg font-bold text-green-700">
                    R$ {balance.balance?.toFixed(2) || "0,00"}
                  </p>
                </div>
              </CardBody>
            </Card>
          )}
          <Button
            color="success"
            startContent={<Plus size={18} />}
            onPress={() => setIsAddModalOpen(true)}
          >
            Novo Envio
          </Button>
          <Button
            color="primary"
            startContent={<RefreshCw size={18} />}
            onPress={() => {
              loadShipments();
              loadCart();
              loadBalance();
            }}
          >
            Atualizar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        aria-label="Opções de envio"
        className="w-full"
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key as string)}
      >
        <Tab
          key="list"
          title={
            <div className="flex items-center gap-2">
              <span>Envios liberados</span>
              {shipments.filter(
                (s) => s.status === "released" || s.status === "paid",
              ).length > 0 && (
                <Chip size="sm" variant="flat">
                  {
                    shipments.filter(
                      (s) => s.status === "released" || s.status === "paid",
                    ).length
                  }
                </Chip>
              )}
            </div>
          }
        >
          <Card>
            {/* Aviso Informativo */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 m-4 rounded-r">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      clipRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      fillRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-blue-900">
                    Importante sobre etiquetas
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Um envio que já foi gerado não pode ser editado</li>
                    <li>
                      Após gerar a etiqueta, o código de rastreio pode levar
                      alguns minutos para aparecer
                    </li>
                    <li>
                      Se algum campo estiver incorreto, cancele o envio e gere
                      um novo
                    </li>
                    <li>
                      O valor do envio cancelado será estornado para sua Melhor
                      carteira
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <CardHeader className="flex gap-3 items-center justify-between">
              <div className="flex items-center gap-4">
                {selectedShipments.size > 0 && (
                  <div className="flex gap-2">
                    <Button
                      color="success"
                      size="sm"
                      startContent={<CreditCard size={16} />}
                      variant="flat"
                      onPress={handleBulkCheckout}
                    >
                      Comprar ({selectedShipments.size})
                    </Button>
                    <Button
                      color="primary"
                      size="sm"
                      startContent={<CheckCircle size={16} />}
                      variant="flat"
                      onPress={handleBulkGenerateLabels}
                    >
                      Gerar Etiquetas ({selectedShipments.size})
                    </Button>
                    <Button
                      color="secondary"
                      size="sm"
                      startContent={<Printer size={16} />}
                      variant="flat"
                      onPress={handleBulkPrintLabels}
                    >
                      Imprimir ({selectedShipments.size})
                    </Button>
                  </div>
                )}
              </div>
              <Input
                className="max-w-xs"
                placeholder="Buscar por nome ou protocolo..."
                size="sm"
                startContent={<Search size={18} />}
                value={searchTerm}
                variant="bordered"
                onValueChange={setSearchTerm}
              />
            </CardHeader>
            <Divider />
            <CardBody>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Spinner />
                </div>
              ) : tabShipments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="mx-auto mb-3 text-gray-400" size={48} />
                  <p>Nenhum envio encontrado</p>
                </div>
              ) : (
                <Table aria-label="Tabela de envios">
                  <TableHeader>
                    <TableColumn>
                      <Checkbox
                        isSelected={
                          tabShipments.length > 0 &&
                          selectedShipments.size === tabShipments.length
                        }
                        onValueChange={handleSelectAll}
                      />
                    </TableColumn>
                    <TableColumn>TRANSPORTADORA</TableColumn>
                    <TableColumn>DESTINATÁRIO</TableColumn>
                    <TableColumn>RASTREIO</TableColumn>
                    <TableColumn>EXPIRAÇÃO</TableColumn>
                    <TableColumn>POSTAGEM</TableColumn>
                    <TableColumn> </TableColumn>
                  </TableHeader>
                  <TableBody>
                    {tabShipments.map((shipment) => (
                      <>
                        <TableRow
                          key={shipment.id}
                          className="hover:bg-gray-50"
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              isSelected={selectedShipments.has(shipment.id)}
                              onValueChange={(checked) =>
                                handleSelectShipment(shipment.id, checked)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="text-sm">
                                <p className="font-medium">
                                  {shipment.service?.company?.name || "N/A"}
                                </p>
                                <p className="text-gray-500 text-xs">
                                  {shipment.service?.name || ""}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">
                                {shipment.to?.name}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {(() => {
                              // Usar authorization_code ou tracking
                              const trackingCode =
                                shipment.tracking ||
                                shipment.authorization_code;

                              // Se tem código de rastreio, mostra
                              if (trackingCode) {
                                return (
                                  <div className="flex items-center gap-2">
                                    <Chip
                                      className="font-mono"
                                      color="success"
                                      size="sm"
                                      variant="flat"
                                    >
                                      {trackingCode}
                                    </Chip>
                                    <Button
                                      isIconOnly
                                      size="sm"
                                      title="Copiar código"
                                      variant="light"
                                      onPress={() =>
                                        handleCopyTracking(trackingCode)
                                      }
                                    >
                                      <Copy size={14} />
                                    </Button>
                                  </div>
                                );
                              }

                              // Se já foi gerado mas ainda não tem código, aguardar
                              if (shipment.generated_at && !trackingCode) {
                                return (
                                  <div className="flex items-center gap-1">
                                    <Chip
                                      color="warning"
                                      size="sm"
                                      startContent={<Clock size={14} />}
                                      variant="flat"
                                    >
                                      Aguardando código
                                    </Chip>
                                    <Button
                                      isIconOnly
                                      size="sm"
                                      title="Atualizar lista"
                                      variant="light"
                                      onPress={() => loadShipments()}
                                    >
                                      <RefreshCw size={14} />
                                    </Button>
                                  </div>
                                );
                              }

                              // Se não foi gerado ainda, mostrar botão para gerar
                              return (
                                <Button
                                  color="primary"
                                  isLoading={generatingLabels.has(shipment.id)}
                                  size="sm"
                                  variant="light"
                                  onPress={() =>
                                    handleGenerateLabels([shipment.id])
                                  }
                                >
                                  {generatingLabels.has(shipment.id)
                                    ? "Gerando..."
                                    : "Gerar etiqueta"}
                                </Button>
                              );
                            })()}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {shipment.expired_at
                                ? new Date(shipment.expired_at)
                                    .toLocaleDateString("pt-BR", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                    .replace(",", " às") + "h"
                                : "11/10 às 21h"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <button
                              className="text-blue-600 text-sm hover:underline cursor-pointer"
                              type="button"
                            >
                              Agência/Ponto parceiro
                            </button>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                isIconOnly
                                color="default"
                                size="sm"
                                title="Imprimir"
                                variant="light"
                                onPress={() => handlePrintLabels([shipment.id])}
                              >
                                <Printer size={16} />
                              </Button>
                              <Button
                                isIconOnly
                                color="default"
                                size="sm"
                                title="Mais opções"
                                variant="light"
                                onPress={() =>
                                  handleOpenCancelModal(
                                    shipment.id,
                                    shipment.protocol,
                                  )
                                }
                              >
                                •••
                              </Button>
                              <Button
                                isIconOnly
                                color="default"
                                size="sm"
                                title={
                                  expandedShipment === shipment.id
                                    ? "Recolher"
                                    : "Expandir"
                                }
                                variant="light"
                                onPress={() =>
                                  setExpandedShipment(
                                    expandedShipment === shipment.id
                                      ? null
                                      : shipment.id,
                                  )
                                }
                              >
                                {expandedShipment === shipment.id ? (
                                  <ChevronUp size={16} />
                                ) : (
                                  <ChevronDown size={16} />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Linha Expansível */}
                        {expandedShipment === shipment.id && (
                          <TableRow key={`${shipment.id}-details`}>
                            <TableCell className="bg-gray-50" colSpan={7}>
                              <div className="grid grid-cols-3 gap-6 p-6">
                                {/* Dados do Envio */}
                                <Card className="border">
                                  <CardBody className="space-y-3">
                                    <div className="flex items-center gap-2 font-bold text-blue-700 mb-2">
                                      <Package size={20} />
                                      <span>Dados do Envio</span>
                                    </div>
                                    <div className="text-sm space-y-2">
                                      <div>
                                        <p className="text-gray-600">Código:</p>
                                        <p className="font-mono">
                                          {shipment.protocol}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-gray-600">Prazo:</p>
                                        <p>
                                          {shipment.delivery_min} a{" "}
                                          {shipment.delivery_max} dias úteis
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-gray-600">Valor:</p>
                                        <p className="font-bold">
                                          R$ {shipment.price?.toFixed(2)}
                                        </p>
                                      </div>
                                      {shipment.created_at && (
                                        <div>
                                          <p className="text-gray-600">
                                            Criado em:
                                          </p>
                                          <p className="text-xs">
                                            {formatDate(shipment.created_at)}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </CardBody>
                                </Card>

                                {/* Remetente */}
                                <Card className="border">
                                  <CardBody className="space-y-3">
                                    <div className="flex items-center gap-2 font-bold text-green-700 mb-2">
                                      <User size={20} />
                                      <span>Remetente</span>
                                    </div>
                                    <div className="text-sm space-y-2">
                                      <div>
                                        <p className="font-medium">
                                          {shipment.from?.name}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-gray-600">
                                          Telefone:
                                        </p>
                                        <p>
                                          {formatPhone(
                                            shipment.from?.phone || "",
                                          )}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-gray-600">CPF:</p>
                                        <p className="font-mono text-xs">
                                          {formatCPF(
                                            shipment.from?.document || "",
                                          )}
                                        </p>
                                      </div>
                                      <div className="flex items-start gap-2 mt-2">
                                        <MapPin
                                          className="text-gray-400 mt-1 flex-shrink-0"
                                          size={14}
                                        />
                                        <div className="text-xs">
                                          <p className="font-medium">
                                            {shipment.from?.address},{" "}
                                            {shipment.from?.location_number}
                                            {shipment.from?.complement &&
                                              ` - ${shipment.from?.complement}`}
                                          </p>
                                          <p className="text-gray-600">
                                            {shipment.from?.district} -{" "}
                                            {shipment.from?.city}/
                                            {shipment.from?.state_abbr}
                                          </p>
                                          <p className="text-gray-600">
                                            CEP:{" "}
                                            {formatZipCode(
                                              shipment.from?.postal_code || "",
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </CardBody>
                                </Card>

                                {/* Destinatário */}
                                <Card className="border">
                                  <CardBody className="space-y-3">
                                    <div className="flex items-center gap-2 font-bold text-purple-700 mb-2">
                                      <User size={20} />
                                      <span>Destinatário</span>
                                    </div>
                                    <div className="text-sm space-y-2">
                                      <div>
                                        <p className="font-medium">
                                          {shipment.to?.name}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-gray-600">
                                          Telefone:
                                        </p>
                                        <p>
                                          {formatPhone(
                                            shipment.to?.phone || "",
                                          )}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-gray-600">CPF:</p>
                                        <p className="font-mono text-xs">
                                          {formatCPF(
                                            shipment.to?.document || "",
                                          )}
                                        </p>
                                      </div>
                                      <div className="flex items-start gap-2 mt-2">
                                        <MapPin
                                          className="text-gray-400 mt-1 flex-shrink-0"
                                          size={14}
                                        />
                                        <div className="text-xs">
                                          <p className="font-medium">
                                            {shipment.to?.address},{" "}
                                            {shipment.to?.location_number}
                                            {shipment.to?.complement &&
                                              ` - ${shipment.to?.complement}`}
                                          </p>
                                          <p className="text-gray-600">
                                            {shipment.to?.district} -{" "}
                                            {shipment.to?.city}/
                                            {shipment.to?.state_abbr}
                                          </p>
                                          <p className="text-gray-600">
                                            CEP:{" "}
                                            {formatZipCode(
                                              shipment.to?.postal_code || "",
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </CardBody>
                                </Card>
                              </div>

                              {/* Ações no Detalhe */}
                              <div className="flex gap-3 justify-end p-6 pt-0">
                                <Button
                                  color="danger"
                                  size="md"
                                  startContent={<XCircle size={18} />}
                                  variant="flat"
                                  onPress={() =>
                                    handleOpenCancelModal(
                                      shipment.id,
                                      shipment.protocol,
                                    )
                                  }
                                >
                                  Cancelar e Reembolsar
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardBody>
          </Card>
        </Tab>

        <Tab
          key="posted"
          title={
            <div className="flex items-center gap-2">
              <span>Envios postados</span>
              {shipments.filter(
                (s) => s.status === "posted" || s.status === "delivered",
              ).length > 0 && (
                <Chip size="sm" variant="flat">
                  {
                    shipments.filter(
                      (s) => s.status === "posted" || s.status === "delivered",
                    ).length
                  }
                </Chip>
              )}
            </div>
          }
        >
          <Card>
            <CardHeader className="flex gap-3 items-center justify-between">
              <h2 className="text-xl font-semibold">Envios Postados</h2>
              <Input
                className="max-w-xs"
                placeholder="Buscar por nome ou protocolo..."
                size="sm"
                startContent={<Search size={18} />}
                value={searchTerm}
                variant="bordered"
                onValueChange={setSearchTerm}
              />
            </CardHeader>
            <Divider />
            <CardBody>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Spinner />
                </div>
              ) : tabShipments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="mx-auto mb-3 text-gray-400" size={48} />
                  <p>Nenhum envio postado</p>
                </div>
              ) : (
                <Table aria-label="Tabela de envios postados">
                  <TableHeader>
                    <TableColumn>TRANSPORTADORA</TableColumn>
                    <TableColumn>DESTINATÁRIO</TableColumn>
                    <TableColumn>RASTREIO</TableColumn>
                    <TableColumn>DATA POSTAGEM</TableColumn>
                    <TableColumn> </TableColumn>
                  </TableHeader>
                  <TableBody>
                    {tabShipments.map((shipment) => (
                      <>
                        <TableRow
                          key={shipment.id}
                          className="hover:bg-gray-50"
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="text-sm">
                                <p className="font-medium">
                                  {shipment.service?.company?.name || "N/A"}
                                </p>
                                <p className="text-gray-500 text-xs">
                                  {shipment.service?.name || ""}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">
                                {shipment.to?.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {shipment.to?.city} - {shipment.to?.state_abbr}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {(() => {
                              // Usar authorization_code ou tracking
                              const trackingCode =
                                shipment.tracking ||
                                shipment.authorization_code;

                              // Se tem código de rastreio, mostra
                              if (trackingCode) {
                                return (
                                  <div className="flex items-center gap-2">
                                    <Chip
                                      className="font-mono"
                                      color="success"
                                      size="sm"
                                      variant="flat"
                                    >
                                      {trackingCode}
                                    </Chip>
                                    <Button
                                      isIconOnly
                                      size="sm"
                                      title="Copiar código"
                                      variant="light"
                                      onPress={() =>
                                        handleCopyTracking(trackingCode)
                                      }
                                    >
                                      <Copy size={14} />
                                    </Button>
                                  </div>
                                );
                              }

                              // Se já foi gerado/postado mas não tem código ainda
                              if (
                                (shipment.generated_at || shipment.posted_at) &&
                                !trackingCode
                              ) {
                                return (
                                  <div className="flex items-center gap-1">
                                    <Chip
                                      color="warning"
                                      size="sm"
                                      startContent={<Clock size={14} />}
                                      variant="flat"
                                    >
                                      Aguardando código
                                    </Chip>
                                    <Button
                                      isIconOnly
                                      size="sm"
                                      title="Atualizar lista"
                                      variant="light"
                                      onPress={() => loadShipments()}
                                    >
                                      <RefreshCw size={14} />
                                    </Button>
                                  </div>
                                );
                              }

                              return (
                                <span className="text-xs text-gray-500">
                                  Sem código disponível
                                </span>
                              );
                            })()}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {shipment.posted_at
                                ? formatDate(shipment.posted_at)
                                : "N/A"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                isIconOnly
                                color="default"
                                size="sm"
                                title="Imprimir"
                                variant="light"
                                onPress={() => handlePrintLabels([shipment.id])}
                              >
                                <Printer size={16} />
                              </Button>
                              <Button
                                isIconOnly
                                color="default"
                                size="sm"
                                title={
                                  expandedShipment === shipment.id
                                    ? "Recolher"
                                    : "Expandir"
                                }
                                variant="light"
                                onPress={() =>
                                  setExpandedShipment(
                                    expandedShipment === shipment.id
                                      ? null
                                      : shipment.id,
                                  )
                                }
                              >
                                {expandedShipment === shipment.id ? (
                                  <ChevronUp size={16} />
                                ) : (
                                  <ChevronDown size={16} />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Linha Expansível */}
                        {expandedShipment === shipment.id && (
                          <TableRow key={`${shipment.id}-details`}>
                            <TableCell className="bg-gray-50" colSpan={5}>
                              <div className="grid grid-cols-3 gap-6 p-6">
                                {/* Dados do Envio */}
                                <Card className="border">
                                  <CardBody className="space-y-3">
                                    <div className="flex items-center gap-2 font-bold text-blue-700 mb-2">
                                      <Package size={20} />
                                      <span>Dados do Envio</span>
                                    </div>
                                    <div className="text-sm space-y-2">
                                      <div>
                                        <p className="text-gray-600">Código:</p>
                                        <p className="font-mono">
                                          {shipment.protocol}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-gray-600">Prazo:</p>
                                        <p>
                                          {shipment.delivery_min} a{" "}
                                          {shipment.delivery_max} dias úteis
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-gray-600">Valor:</p>
                                        <p className="font-bold">
                                          R$ {shipment.price?.toFixed(2)}
                                        </p>
                                      </div>
                                      {shipment.tracking && (
                                        <div>
                                          <p className="text-gray-600">
                                            Rastreio:
                                          </p>
                                          <p className="font-mono">
                                            {shipment.tracking}
                                          </p>
                                        </div>
                                      )}
                                      {shipment.created_at && (
                                        <div>
                                          <p className="text-gray-600">
                                            Criado em:
                                          </p>
                                          <p className="text-xs">
                                            {formatDate(shipment.created_at)}
                                          </p>
                                        </div>
                                      )}
                                      {shipment.posted_at && (
                                        <div>
                                          <p className="text-gray-600">
                                            Postado em:
                                          </p>
                                          <p className="text-xs">
                                            {formatDate(shipment.posted_at)}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </CardBody>
                                </Card>

                                {/* Remetente */}
                                <Card className="border">
                                  <CardBody className="space-y-3">
                                    <div className="flex items-center gap-2 font-bold text-green-700 mb-2">
                                      <User size={20} />
                                      <span>Remetente</span>
                                    </div>
                                    <div className="text-sm space-y-2">
                                      <div>
                                        <p className="font-medium">
                                          {shipment.from?.name}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-gray-600">
                                          Telefone:
                                        </p>
                                        <p>
                                          {formatPhone(
                                            shipment.from?.phone || "",
                                          )}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-gray-600">CPF:</p>
                                        <p className="font-mono text-xs">
                                          {formatCPF(
                                            shipment.from?.document || "",
                                          )}
                                        </p>
                                      </div>
                                      <div className="flex items-start gap-2 mt-2">
                                        <MapPin
                                          className="text-gray-400 mt-1 flex-shrink-0"
                                          size={14}
                                        />
                                        <div className="text-xs">
                                          <p className="font-medium">
                                            {shipment.from?.address},{" "}
                                            {shipment.from?.location_number}
                                            {shipment.from?.complement &&
                                              ` - ${shipment.from?.complement}`}
                                          </p>
                                          <p className="text-gray-600">
                                            {shipment.from?.district} -{" "}
                                            {shipment.from?.city}/
                                            {shipment.from?.state_abbr}
                                          </p>
                                          <p className="text-gray-600">
                                            CEP:{" "}
                                            {formatZipCode(
                                              shipment.from?.postal_code || "",
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </CardBody>
                                </Card>

                                {/* Destinatário */}
                                <Card className="border">
                                  <CardBody className="space-y-3">
                                    <div className="flex items-center gap-2 font-bold text-purple-700 mb-2">
                                      <User size={20} />
                                      <span>Destinatário</span>
                                    </div>
                                    <div className="text-sm space-y-2">
                                      <div>
                                        <p className="font-medium">
                                          {shipment.to?.name}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-gray-600">
                                          Telefone:
                                        </p>
                                        <p>
                                          {formatPhone(
                                            shipment.to?.phone || "",
                                          )}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-gray-600">CPF:</p>
                                        <p className="font-mono text-xs">
                                          {formatCPF(
                                            shipment.to?.document || "",
                                          )}
                                        </p>
                                      </div>
                                      <div className="flex items-start gap-2 mt-2">
                                        <MapPin
                                          className="text-gray-400 mt-1 flex-shrink-0"
                                          size={14}
                                        />
                                        <div className="text-xs">
                                          <p className="font-medium">
                                            {shipment.to?.address},{" "}
                                            {shipment.to?.location_number}
                                            {shipment.to?.complement &&
                                              ` - ${shipment.to?.complement}`}
                                          </p>
                                          <p className="text-gray-600">
                                            {shipment.to?.district} -{" "}
                                            {shipment.to?.city}/
                                            {shipment.to?.state_abbr}
                                          </p>
                                          <p className="text-gray-600">
                                            CEP:{" "}
                                            {formatZipCode(
                                              shipment.to?.postal_code || "",
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </CardBody>
                                </Card>
                              </div>

                              {/* Ações no Detalhe */}
                              <div className="flex gap-3 justify-end p-6 pt-0">
                                <Button
                                  color="secondary"
                                  size="md"
                                  startContent={<Printer size={18} />}
                                  variant="flat"
                                  onPress={() =>
                                    handlePrintLabels([shipment.id])
                                  }
                                >
                                  Imprimir Etiqueta
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardBody>
          </Card>
        </Tab>

        <Tab
          key="cart"
          title={
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} />
              <span>Carrinho</span>
              {cartItems.length > 0 && (
                <Chip size="sm" variant="flat">
                  {cartItems.length}
                </Chip>
              )}
            </div>
          }
        >
          <Card>
            <CardHeader className="flex gap-3 items-center justify-between">
              <h2 className="text-xl font-semibold">Carrinho de Envios</h2>
              {cartItems.length > 0 && (
                <Button
                  color="success"
                  startContent={<CheckCircle size={18} />}
                  onPress={handleCheckout}
                >
                  Finalizar Compra (R${" "}
                  {cartItems
                    .reduce((sum, item) => sum + (item.price || 0), 0)
                    .toFixed(2)}
                  )
                </Button>
              )}
            </CardHeader>
            <Divider />
            <CardBody>
              {cartItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart
                    className="mx-auto mb-3 text-gray-400"
                    size={48}
                  />
                  <p>Carrinho vazio</p>
                  <p className="text-sm mt-2">
                    Adicione envios ao carrinho para comprar
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <Card key={item.id} className="border">
                      <CardBody className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Truck className="text-blue-600" size={20} />
                              <h3 className="font-semibold">
                                {item.service?.company?.name} -{" "}
                                {item.service?.name}
                              </h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">Destinatário:</p>
                                <p className="font-medium">{item.to?.name}</p>
                                <p className="text-xs text-gray-500">
                                  {item.to?.city} - {item.to?.state_abbr}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Remetente:</p>
                                <p className="font-medium">{item.from?.name}</p>
                                <p className="text-xs text-gray-500">
                                  {item.from?.city} - {item.from?.state_abbr}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <p className="text-2xl font-bold text-green-600">
                              R$ {item.price?.toFixed(2) || "0,00"}
                            </p>
                            <Button
                              color="danger"
                              size="sm"
                              startContent={<XCircle size={16} />}
                              variant="flat"
                              onPress={() => handleRemoveFromCart(item.id)}
                            >
                              Remover
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </Tab>

        <Tab
          key="carriers"
          title={
            <div className="flex items-center gap-2">
              <Truck size={18} />
              <span>Transportadoras</span>
            </div>
          }
        >
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">
                Transportadoras Disponíveis
              </h2>
            </CardHeader>
            <Divider />
            <CardBody>
              {carriers.length === 0 ? (
                <div className="flex justify-center items-center py-8">
                  <Spinner />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {carriers.map((carrier) => (
                    <Card key={carrier.id} className="border">
                      <CardBody className="p-4">
                        <div className="flex items-center gap-3">
                          {carrier.picture && (
                            <img
                              alt={carrier.name}
                              className="w-12 h-12 object-contain"
                              src={carrier.picture}
                            />
                          )}
                          <div>
                            <h3 className="font-semibold">{carrier.name}</h3>
                            <p className="text-xs text-gray-500">
                              ID: {carrier.id}
                            </p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </Tab>
      </Tabs>

      {/* Modal de Adicionar Envio */}
      <AddShipmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          loadCart();
          loadShipments();
        }}
      />

      {/* Modal de Cancelar Envio */}
      {selectedCancelShipment && (
        <CancelShipmentModal
          isOpen={isCancelModalOpen}
          orderId={selectedCancelShipment.id}
          orderProtocol={selectedCancelShipment.protocol}
          onClose={() => setIsCancelModalOpen(false)}
          onSuccess={handleCancelSuccess}
        />
      )}
    </div>
  );
}
