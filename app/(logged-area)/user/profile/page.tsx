"use client";

import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import { Save, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { updateUserAction } from "@/controllers";
import { useSession } from "@/hooks";

export default function PerfilPage() {
  const { user, isLoading, update } = useSession();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        cpf: user.cpf || "",
      });
    }
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      setSaving(true);

      await updateUserAction(user.id, {
        name: formData.name,
        phone: formData.phone,
      });

      // Atualizar sessão
      await update({
        name: formData.name,
      });

      toast.success("Perfil atualizado com sucesso!");
      setEditing(false);
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error("Erro ao atualizar perfil");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner color="warning" size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Usuário não encontrado</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Meu Perfil</h1>
        <p className="text-gray-600 mt-2">Gerencie suas informações pessoais</p>
      </div>

      {/* Avatar Card */}
      <Card>
        <CardBody className="flex flex-row items-center gap-4 p-6">
          <Avatar
            className="w-20 h-20"
            color="warning"
            icon={<UserIcon size={32} />}
            size="lg"
            {...(user.avatar ? { src: user.avatar } : {})}
          />
          <div>
            <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-500 mt-1">
              Membro desde{" "}
              {new Date(user.createdAt).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Informações Pessoais */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">Informações Pessoais</h3>
            <p className="text-sm text-gray-600">
              Atualize suas informações de contato
            </p>
          </div>
          {!editing && (
            <Button
              color="warning"
              variant="flat"
              onPress={() => setEditing(true)}
            >
              Editar
            </Button>
          )}
        </CardHeader>
        <Divider />
        <CardBody className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              isRequired
              isDisabled={!editing}
              label="Nome Completo"
              placeholder="Seu nome"
              value={formData.name}
              variant={editing ? "bordered" : "flat"}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <Input
              isDisabled
              description="O email não pode ser alterado"
              label="Email"
              placeholder="seu@email.com"
              value={formData.email}
              variant="flat"
            />
            <Input
              isDisabled={!editing}
              label="Telefone"
              placeholder="(00) 00000-0000"
              value={formData.phone}
              variant={editing ? "bordered" : "flat"}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
            <Input
              isDisabled
              description="O CPF não pode ser alterado"
              label="CPF"
              placeholder="000.000.000-00"
              value={formData.cpf}
              variant="flat"
            />
          </div>

          {editing && (
            <div className="flex gap-3 mt-6">
              <Button
                className="font-semibold"
                color="warning"
                isLoading={saving}
                startContent={<Save size={18} />}
                onPress={handleSave}
              >
                Salvar Alterações
              </Button>
              <Button
                variant="flat"
                onPress={() => {
                  setEditing(false);
                  setFormData({
                    name: user.name || "",
                    email: user.email || "",
                    phone: user.phone || "",
                    cpf: user.cpf || "",
                  });
                }}
              >
                Cancelar
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Segurança */}
      <Card>
        <CardHeader>
          <div>
            <h3 className="text-xl font-bold">Segurança</h3>
            <p className="text-sm text-gray-600">
              Gerencie sua senha e segurança da conta
            </p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="p-6">
          <Button
            color="warning"
            variant="flat"
            onPress={() => toast.info("Funcionalidade em desenvolvimento")}
          >
            Alterar Senha
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
