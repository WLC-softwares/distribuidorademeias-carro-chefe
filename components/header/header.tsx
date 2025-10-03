"use client";

import { Avatar } from "@heroui/avatar";
import { Badge } from "@heroui/badge";
import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/navbar";
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

import { CartDrawer } from "@/components/cart";
import { NotificationDropdown } from "@/components/notifications";
import { useAuth, useCart } from "@/hooks";

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
            <p className="font-semibold text-sm">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        ),
      },
      {
        key: "profile",
        startContent: <User className="text-blue-600" size={18} />,
        className: "py-2",
        onPress: () => router.push("/user/profile"),
        content: "Minha conta",
      },
      {
        key: "orders",
        startContent: <Package className="text-green-600" size={18} />,
        className: "py-2",
        onPress: () => router.push("/user/orders"),
        content: "Meus pedidos",
      },
      {
        key: "addresses",
        startContent: <MapPin className="text-orange-600" size={18} />,
        className: "py-2",
        onPress: () => router.push("/user/addresses"),
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
    <div className="sticky top-0 z-50">
      {/* Faixa amarela fina */}

      <Navbar
        className="bg-white shadow-md border-b border-gray-200"
        classNames={{
          wrapper: "px-4 md:px-8 py-2",
          base: "h-20",
        }}
        maxWidth="full"
      >
        {/* Logo - Maior e Centralizada */}
        <NavbarBrand className="flex-grow-0">
          <Link className="flex items-center gap-3" href="/">
            <div className="bg-white p-2 rounded-lg">
              <Image
                priority
                alt="Logo Distribuidora de Meias"
                className="cursor-pointer"
                height={80}
                src={logo}
                width={80}
              />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-bold text-gray-900 text-xl">
                Carro Chefe
              </span>
              <span className="text-xs text-gray-600">
                Distribuidora de Meias
              </span>
            </div>
          </Link>
        </NavbarBrand>

        {/* Espaço central */}
        <NavbarContent className="flex-1" justify="center">
          <div className="hidden lg:block text-center">
            <p className="text-base font-semibold text-gray-800">
              As melhores ofertas você encontra aqui!
            </p>
          </div>
        </NavbarContent>

        {/* Ações do Usuário */}
        <NavbarContent className="gap-3 md:gap-4" justify="end">
          {/* Ofertas - Badge chamativo */}
          <NavbarItem className="hidden lg:flex">
            <Button
              as={Link}
              className="font-bold text-white"
              color="danger"
              href="/"
              size="md"
              startContent={<Tag size={18} />}
              variant="shadow"
            >
              Ofertas Limitadas
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
                      name={user.name || user.email}
                      size="sm"
                      src={user.avatar || undefined}
                    />
                    <span className="hidden md:inline">
                      {user.name || "Conta"}
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

          {/* Notifications (only for authenticated users) */}
          {isAuthenticated && user && (
            <NavbarItem>
              <NotificationDropdown userId={user.id} />
            </NavbarItem>
          )}

          {/* Cart - Com texto */}
          <NavbarItem>
            <Badge
              color="danger"
              content={cartItemsCount}
              isInvisible={cartItemsCount === 0}
              placement="top-right"
              size="sm"
            >
              <Button
                className="gap-2 text-gray-700 font-semibold"
                size="md"
                startContent={<ShoppingCart size={20} />}
                variant="light"
                onPress={() => setIsCartOpen(true)}
              >
                <span className="hidden md:inline">Carrinho</span>
              </Button>
            </Badge>
          </NavbarItem>
        </NavbarContent>

        {/* Cart Drawer */}
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </Navbar>
    </div>
  );
}
