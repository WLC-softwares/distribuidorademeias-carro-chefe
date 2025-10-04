"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Image } from "@heroui/image";
import { Spinner } from "@heroui/spinner";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Clock,
  CreditCard,
  MapPin,
  Package,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getSaleByIdAction, getUserWithAddressesAction } from "@/controllers";
import { useSession } from "@/hooks";
import { formatCurrency } from "@/utils";

interface SaleDetails {
  id: string;
  saleNumber: string;
  status: string;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  canceledAt: Date | null;
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    discount: number;
    total: number;
    saleType: string;
    product: {
      id: string;
      name: string;
      description: string | null;
      images: { url: string; alt: string | null }[];
      retailPrice: number;
      wholesalePrice: number;
    };
  }[];
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    cpf: string | null;
  };
}

interface UserAddress {
  id: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  primary: boolean;
}

const statusMap: Record<
  string,
  { color: "default" | "warning" | "success" | "danger"; label: string }
> = {
  PENDING: { color: "warning", label: "Aguardando Pagamento" },
  PROCESSING: { color: "warning", label: "Processando" },
  PAID: { color: "success", label: "Pago" },
  SHIPPED: { color: "success", label: "Enviado" },
  DELIVERED: { color: "success", label: "Entregue" },
  CANCELED: { color: "danger", label: "Cancelado" },
  REFUNDED: { color: "default", label: "Reembolsado" },
};

const paymentMethodMap: Record<string, string> = {
  CASH: "Dinheiro",
  CREDIT_CARD: "Cartão de Crédito",
  DEBIT_CARD: "Cartão de Débito",
  PIX: "PIX",
  BANK_SLIP: "Boleto Bancário",
  BANK_TRANSFER: "Transferência Bancária",
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: isLoadingUser } = useSession();
  const [sale, setSale] = useState<SaleDetails | null>(null);
  const [address, setAddress] = useState<UserAddress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      // Aguardar até que o usuário seja carregado
      if (isLoadingUser) {
        return;
      }

      if (!user?.id || !params.id) {
        setLoading(false);

        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Timeout de segurança (30 segundos)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Timeout ao carregar pedido")),
            30000,
          ),
        );

        // Buscar detalhes da venda com timeout
        const saleData = (await Promise.race([
          getSaleByIdAction(params.id as string),
          timeoutPromise,
        ])) as any;

        if (!saleData) {
          const errorMsg = "Pedido não encontrado";

          setError(errorMsg);
          toast.error(errorMsg);
          setTimeout(() => router.push("/user/orders"), 2000);

          return;
        }

        // Verificar se a venda pertence ao usuário
        if (saleData.user.id !== user.id) {
          const errorMsg = "Você não tem permissão para visualizar este pedido";

          setError(errorMsg);
          toast.error(errorMsg);
          setTimeout(() => router.push("/user/orders"), 2000);

          return;
        }

        setSale(saleData as any);

        // Buscar endereço do usuário (não bloqueia a exibição)
        try {
          const userData = await getUserWithAddressesAction(user.id);

          if (userData?.addresses && userData.addresses.length > 0) {
            const primaryAddress =
              userData.addresses.find((addr: UserAddress) => addr.primary) ||
              userData.addresses[0];

            setAddress(primaryAddress);
          } else {
            return;
          }
        } catch (addressError) {
          console.error("Erro ao buscar endereço (não crítico):", addressError);
          // Não bloqueia a exibição do pedido
        }
      } catch (error: any) {
        console.error("Erro ao buscar detalhes do pedido:", error);
        const errorMsg =
          error?.message || "Erro ao carregar detalhes do pedido";

        setError(errorMsg);
        toast.error(errorMsg);
        setTimeout(() => router.push("/user/orders"), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [user?.id, params.id, router, isLoadingUser]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
        <Spinner color="warning" size="lg" />
        <p className="text-gray-600">Carregando detalhes do pedido...</p>
        <p className="text-xs text-gray-400">ID: {params.id}</p>
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardBody className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-red-100 rounded-full">
                <Package className="text-red-600" size={48} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {error || "Pedido não encontrado"}
                </h3>
                <p className="text-gray-600 mt-2">
                  Não foi possível carregar os detalhes do pedido
                </p>
              </div>
              <Button
                as={Link}
                className="mt-4"
                color="primary"
                href="/user/orders"
                startContent={<ArrowLeft size={18} />}
                variant="flat"
              >
                Voltar para Compras
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  const getStatusTimeline = () => {
    const statuses = [
      { key: "PENDING", label: "Pendente", icon: Package },
      { key: "PAID", label: "Pago", icon: CreditCard },
      { key: "SHIPPED", label: "Enviado", icon: Truck },
      { key: "DELIVERED", label: "Entregue", icon: Check },
    ];

    const currentIndex = statuses.findIndex((s) => s.key === sale.status);

    return statuses.map((status, index) => ({
      ...status,
      completed: index <= currentIndex,
      current: status.key === sale.status,
    }));
  };

  const timeline = getStatusTimeline();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Botão Voltar */}
      <Button
        as={Link}
        href="/user/orders"
        startContent={<ArrowLeft size={18} />}
        variant="light"
      >
        Voltar para Compras
      </Button>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Pedido #{sale.saleNumber}
          </h1>
          <p className="text-gray-600 mt-2">
            Realizado em{" "}
            {new Date(sale.createdAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <Chip
          color={statusMap[sale.status]?.color || "default"}
          size="lg"
          variant="flat"
        >
          {statusMap[sale.status]?.label || sale.status}
        </Chip>
      </div>

      {/* Timeline do Pedido */}
      {sale.status !== "CANCELED" && sale.status !== "REFUNDED" && (
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-bold mb-6">Status do Pedido</h3>
            <div className="flex justify-between items-center relative">
              {/* Linha de progresso */}
              <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10">
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{
                    width: `${(timeline.filter((t) => t.completed).length - 1) * (100 / (timeline.length - 1))}%`,
                  }}
                />
              </div>

              {timeline.map((status) => {
                const Icon = status.icon;

                return (
                  <div key={status.key} className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        status.completed
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-500"
                      } ${status.current ? "ring-4 ring-green-200" : ""}`}
                    >
                      <Icon size={20} />
                    </div>
                    <span
                      className={`text-xs mt-2 font-medium ${
                        status.completed ? "text-green-700" : "text-gray-500"
                      }`}
                    >
                      {status.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal - Itens do Pedido */}
        <div className="lg:col-span-2 space-y-6">
          {/* Itens */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-bold">Itens do Pedido</h3>
            </CardHeader>
            <Divider />
            <CardBody className="p-6 space-y-4">
              {sale.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <Image
                    alt={item.product.name}
                    className="rounded-lg object-cover flex-shrink-0"
                    height={100}
                    src={item.product.images[0]?.url || "/placeholder.png"}
                    width={100}
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">
                      {item.product.name}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Quantidade: {item.quantity}
                    </p>
                    <p className="text-sm text-gray-600">
                      Tipo: {item.saleType === "RETAIL" ? "Varejo" : "Atacado"}
                    </p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-sm text-gray-600">
                        {formatCurrency(item.unitPrice)} x {item.quantity}
                      </span>
                      <span className="text-lg font-bold text-gray-800">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        {/* Coluna Lateral - Informações */}
        <div className="space-y-6">
          {/* Resumo do Pedido */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-bold">Resumo</h3>
            </CardHeader>
            <Divider />
            <CardBody className="p-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  {formatCurrency(sale.subtotal)}
                </span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Desconto</span>
                  <span className="font-medium text-green-600">
                    -{formatCurrency(sale.discount)}
                  </span>
                </div>
              )}
              <Divider />
              <div className="flex justify-between">
                <span className="text-lg font-bold">Total</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatCurrency(sale.total)}
                </span>
              </div>
            </CardBody>
          </Card>

          {/* Forma de Pagamento */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <CreditCard className="text-gray-600" size={20} />
              <h3 className="text-lg font-bold">Pagamento</h3>
            </CardHeader>
            <Divider />
            <CardBody className="p-6 space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">
                  Método de Pagamento
                </p>
                <p className="text-gray-800 font-medium">
                  {paymentMethodMap[sale.paymentMethod] || sale.paymentMethod}
                </p>
              </div>

              <Divider />

              <div>
                <p className="text-xs text-gray-500 mb-2">
                  Status do Pagamento
                </p>
                {sale.status === "PENDING" ? (
                  <div className="flex items-center gap-2 p-2 bg-warning-50 rounded-lg">
                    <Clock className="text-warning-600" size={16} />
                    <span className="text-sm font-medium text-warning-700">
                      Aguardando Pagamento
                    </span>
                  </div>
                ) : sale.status === "PROCESSING" ? (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                    <Clock className="text-blue-600" size={16} />
                    <span className="text-sm font-medium text-blue-700">
                      Processando
                    </span>
                  </div>
                ) : sale.status === "CANCELED" || sale.status === "REFUNDED" ? (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <AlertCircle className="text-gray-600" size={16} />
                    <span className="text-sm font-medium text-gray-700">
                      {sale.status === "CANCELED" ? "Cancelado" : "Reembolsado"}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                    <Check className="text-green-600" size={16} />
                    <span className="text-sm font-medium text-green-700">
                      Pagamento Confirmado
                    </span>
                  </div>
                )}
              </div>

              {sale.status === "PAID" && sale.completedAt && (
                <div className="text-xs text-gray-500">
                  Confirmado em{" "}
                  {new Date(sale.completedAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Endereço de Entrega */}
          {address && (
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <MapPin className="text-gray-600" size={20} />
                <h3 className="text-lg font-bold">Endereço de Entrega</h3>
              </CardHeader>
              <Divider />
              <CardBody className="p-6">
                <p className="text-gray-800 font-medium">{sale.user.name}</p>
                <p className="text-sm text-gray-600 mt-2">
                  {address.street}, {address.number}
                  {address.complement && ` - ${address.complement}`}
                </p>
                <p className="text-sm text-gray-600">{address.neighborhood}</p>
                <p className="text-sm text-gray-600">
                  {address.city} - {address.state}
                </p>
                <p className="text-sm text-gray-600">CEP: {address.zipCode}</p>
              </CardBody>
            </Card>
          )}

          {/* Observações */}
          {sale.notes && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-bold">Observações</h3>
              </CardHeader>
              <Divider />
              <CardBody className="p-6">
                <p className="text-sm text-gray-600">{sale.notes}</p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
