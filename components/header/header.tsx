"use client";

import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/navbar";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import { Avatar } from "@heroui/avatar";
import { Badge } from "@heroui/badge";
import { Button } from "@heroui/button";
import { Skeleton } from "@heroui/skeleton";
import {
  ChevronDown,
  LogOut,
  MapPin,
  Package,
  Settings,
  ShoppingCart,
  Tag,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import logo from "../../public/logo.png";

import { useAuth, useCart } from "@/hooks";
import { NotificationDropdown } from "@/components/notifications";
import { CartDrawer } from "@/components/cart";

export default function Header() {
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { getTotalItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const cartItemsCount = getTotalItems();

  // Criar itens do menu dinamicamente
  const menuItems = user
    ? [
        {
          key: "user-info",
          className: "py-2 cursor-default",
          isReadOnly: true,
          content: (
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-sm">{user.nome}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          ),
        },
        {
          key: "profile",
          startContent: <User className="text-blue-600" size={18} />,
          className: "py-2",
          onPress: () => router.push("/user/perfil"),
          content: "Minha conta",
        },
        {
          key: "orders",
          startContent: <Package className="text-green-600" size={18} />,
          className: "py-2",
          onPress: () => router.push("/user/pedidos"),
          content: "Meus pedidos",
        },
        {
          key: "addresses",
          startContent: <MapPin className="text-orange-600" size={18} />,
          className: "py-2",
          onPress: () => router.push("/user/enderecos"),
          content: "Meus endereços",
        },
        ...(user.role === "ADMIN"
          ? [
              {
                key: "admin",
                startContent: (
                  <Settings className="text-purple-600" size={18} />
                ),
                className: "py-2",
                onPress: () => router.push("/admin/dashboard"),
                content: "Painel Admin",
              },
            ]
          : []),
        {
          key: "logout",
          startContent: <LogOut className="text-red-600" size={18} />,
          className: "py-2 text-red-600",
          color: "danger" as const,
          onPress: handleLogout,
          content: "Sair",
        },
      ]
    : [];

  return (
    <Navbar
      className="bg-yellow-400 shadow-sm"
      classNames={{
        wrapper: "px-4 md:px-6 py-0",
        base: "h-16",
      }}
      maxWidth="full"
    >
      {/* Logo */}
      <NavbarBrand>
        <Link className="flex items-center gap-2" href="/">
          <Image
            alt="Logo Distribuidora de Meias"
            className="cursor-pointer"
            height={60}
            src={logo}
            width={60}
          />
          <span className="hidden sm:block font-bold text-gray-800 text-lg">
            Carro Chefe
          </span>
        </Link>
      </NavbarBrand>

      {/* Espaço central vazio - logo mais destacada */}
      <NavbarContent className="flex-1" justify="center">
        <div className="hidden md:block text-center">
          <p className="text-sm font-semibold text-gray-800">
            Distribuidora de Meias
          </p>
          <p className="text-xs text-gray-600">
            As melhores ofertas você encontra aqui!
          </p>
        </div>
      </NavbarContent>

      {/* Ações do Usuário */}
      <NavbarContent className="gap-2 md:gap-3" justify="end">
        {/* Ofertas - Oculto em mobile */}
        <NavbarItem className="hidden lg:flex">
          <Button
            as={Link}
            className="text-gray-700 font-semibold"
            href="/ofertas"
            size="sm"
            startContent={<Tag size={16} />}
            variant="light"
          >
            Ofertas por tempo limitado
          </Button>
        </NavbarItem>

        {/* Usuário */}
        <NavbarItem>
          {loading ? (
            <Skeleton className="w-20 h-8 rounded-lg" />
          ) : isAuthenticated && user ? (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button
                  className="text-gray-700 font-semibold gap-2"
                  size="sm"
                  variant="light"
                >
                  <Avatar
                    className="w-6 h-6"
                    name={user.nome || user.email}
                    size="sm"
                    src={user.avatar || undefined}
                  />
                  <span className="hidden md:inline">
                    {user.nome || "Conta"}
                  </span>
                  <ChevronDown size={14} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Ações do usuário"
                classNames={{
                  base: "p-1",
                }}
                variant="flat"
              >
                {menuItems.map((item) => (
                  <DropdownItem
                    key={item.key}
                    className={item.className}
                    color={item.color}
                    isReadOnly={item.isReadOnly}
                    startContent={item.startContent}
                    onPress={item.onPress}
                  >
                    {item.content}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          ) : (
            <div className="flex gap-2">
              <Button
                as={Link}
                className="text-gray-700 font-semibold"
                href="/login"
                size="sm"
                startContent={<User size={16} />}
                variant="light"
              >
                Entrar
              </Button>
              <Button
                as={Link}
                className="font-semibold hidden md:flex"
                color="primary"
                href="/register"
                size="sm"
              >
                Criar conta
              </Button>
            </div>
          )}
        </NavbarItem>

        {/* Notificações (somente para usuários autenticados) */}
        {isAuthenticated && user && (
          <NavbarItem>
            <NotificationDropdown usuarioId={user.id} />
          </NavbarItem>
        )}

        {/* Cart */}
        <NavbarItem>
          <Badge
            color="danger"
            content={cartItemsCount}
            isInvisible={cartItemsCount === 0}
            placement="top-right"
            size="sm"
          >
            <Button
              isIconOnly
              aria-label="Carrinho de compras"
              className="min-w-10 h-10"
              size="md"
              variant="light"
              onPress={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="text-gray-700" size={22} />
            </Button>
          </Badge>
        </NavbarItem>
      </NavbarContent>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </Navbar>
  );
}
