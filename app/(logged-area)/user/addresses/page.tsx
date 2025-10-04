"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Spinner } from "@heroui/spinner";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getUserWithAddressesAction } from "@/controllers";
import { useSession } from "@/hooks";

interface Address {
  id: string;
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  primary: boolean;
}

export default function EnderecosPage() {
  const { user, isLoading } = useSession();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchEnderecos = async () => {
      if (!user?.id) {
        if (mounted) setLoading(false);

        return;
      }

      try {
        if (mounted) setLoading(true);
        const userData = await getUserWithAddressesAction(user.id);

        if (mounted) {
          if (userData && "addresses" in userData) {
            setAddresses(userData.addresses as Address[]);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("Erro ao buscar endereços:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchEnderecos();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const handleDelete = async (id: string) => {
    // TODO: Implementar exclusão de endereço
    toast.info("Funcionalidade em desenvolvimento");
  };

  const handleSetPrincipal = async (id: string) => {
    // TODO: Implementar definir como principal
    toast.info("Funcionalidade em desenvolvimento");
  };

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner color="warning" size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Meus Endereços</h1>
          <p className="text-gray-600 mt-2">
            Gerencie seus endereços de entrega
          </p>
        </div>
        <Button
          className="font-semibold"
          color="warning"
          startContent={<Plus size={20} />}
          onPress={() => toast.info("Funcionalidade em desenvolvimento")}
        >
          Novo Endereço
        </Button>
      </div>

      {/* Lista de Endereços */}
      {addresses.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <MapPin className="text-gray-400" size={48} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-700">
                  Nenhum endereço cadastrado
                </h3>
                <p className="text-gray-600 mt-2">
                  Adicione um endereço para facilitar suas compras
                </p>
              </div>
              <Button
                className="mt-4 font-semibold"
                color="warning"
                startContent={<Plus size={20} />}
                onPress={() => toast.info("Funcionalidade em desenvolvimento")}
              >
                Adicionar Endereço
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <Card
              key={address.id}
              className={`hover:shadow-lg transition-shadow ${
                address.primary ? "border-2 border-yellow-400" : ""
              }`}
            >
              <CardHeader className="flex justify-between items-start">
                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <MapPin className="text-yellow-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">
                      {address.street}, {address.number}
                    </h3>
                    {address.primary && (
                      <Chip
                        className="mt-1"
                        color="warning"
                        size="sm"
                        variant="flat"
                      >
                        Principal
                      </Chip>
                    )}
                  </div>
                </div>
              </CardHeader>
              <Divider />
              <CardBody className="p-4">
                <div className="space-y-1 text-sm text-gray-600">
                  {address.complement && <p>{address.complement}</p>}
                  <p>{address.neighborhood}</p>
                  <p>
                    {address.city} - {address.state}
                  </p>
                  <p className="font-semibold">CEP: {address.zipCode}</p>
                </div>

                {/* Ações */}
                <div className="flex gap-2 mt-4">
                  {!address.primary && (
                    <Button
                      className="flex-1"
                      color="warning"
                      size="sm"
                      variant="flat"
                      onPress={() => handleSetPrincipal(address.id)}
                    >
                      Definir como Principal
                    </Button>
                  )}
                  <Button
                    isIconOnly
                    color="danger"
                    size="sm"
                    variant="light"
                    onPress={() => handleDelete(address.id)}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
