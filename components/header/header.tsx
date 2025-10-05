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
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Tag,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { CartDrawer } from "@/components/cart";
import { NotificationDropdown } from "@/components/notifications";
import { useAuth, useCart } from "@/hooks";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { getTotalItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const isAdminArea = pathname?.startsWith("/admin");

  const handleOpenAdminSidebar = () => {
    window.dispatchEvent(new CustomEvent("toggleAdminSidebar"));
  };

  const handleLogout = async () => {
    await logout();
  };

  const cartItemsCount = getTotalItems();

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
      <Navbar
        className="bg-white shadow-lg border-b border-gray-200"
        classNames={{
          wrapper: "px-4 md:px-8 py-3 max-w-[1920px] mx-auto",
          base: "h-auto min-h-[80px]",
        }}
        maxWidth="full"
      >
        <NavbarBrand className="flex-grow-0 mr-4">
          {/* Botão hambúrguer para admin (apenas mobile) */}
          {isAdminArea && (
            <Button
              isIconOnly
              className="lg:hidden mr-2"
              size="sm"
              variant="light"
              onPress={handleOpenAdminSidebar}
            >
              <Menu size={24} />
            </Button>
          )}

          <Link className="flex items-center gap-3" href="/">
            <div className="relative w-16 h-16">
              <Image
                fill
                priority
                alt="Logo Distribuidora de Meias"
                className="cursor-pointer object-contain"
                sizes="64px"
                src="/logo.png"
              />
            </div>
            <div className="hidden sm:flex flex-col justify-center">
              <span className="font-bold text-gray-900 text-xl leading-tight">
                Carro Chefe
              </span>
              <span className="text-xs text-gray-600 leading-tight">
                Distribuidora de Meias
              </span>
            </div>
          </Link>
        </NavbarBrand>

        {/* Espaço central */}
        <NavbarContent className="flex-1 hidden md:flex" justify="center">
          <p className="text-base md:text-lg  font-semibold text-gray-800 text-black">
            As melhores ofertas você encontra aqui!
          </p>
        </NavbarContent>

        {/* Ações do Usuário */}
        <NavbarContent className="gap-2 md:gap-4 flex-grow-0" justify="end">
          {/* Ofertas - Badge chamativo */}
          <NavbarItem className="hidden lg:flex">
            <Button
              as={Link}
              className="font-bold text-white shadow-lg hover:shadow-md transition-shadow"
              color="primary"
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
              <Skeleton className="w-24 h-10 rounded-lg" />
            ) : isAuthenticated && user ? (
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Button
                    className="text-gray-700 font-semibold gap-2 hover:bg-gray-100 transition-colors"
                    size="md"
                    variant="light"
                  >
                    <Avatar
                      className="w-8 h-8 border-2 border-gray-200"
                      name={user.name || user.email}
                      size="sm"
                      src={user.avatar || "/profile-user.png"}
                    />
                    <span className="hidden md:inline max-w-[120px] truncate">
                      {user.name || "Conta"}
                    </span>
                    <ChevronDown className="text-gray-500" size={16} />
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
              <div className="flex gap-2 items-center">
                <Button
                  as={Link}
                  className="text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
                  href="/login"
                  size="md"
                  startContent={<User size={18} />}
                  variant="light"
                >
                  Entrar
                </Button>
                <Button
                  as={Link}
                  className="font-semibold hidden md:flex shadow-md hover:shadow-lg transition-shadow"
                  color="primary"
                  href="/register"
                  size="md"
                >
                  Criar conta
                </Button>
              </div>
            )}
          </NavbarItem>

          {/* Notifications (only for authenticated users) */}
          {isAuthenticated && user && (
            <NavbarItem>
              <div className="flex items-center">
                <NotificationDropdown userId={user.id} />
              </div>
            </NavbarItem>
          )}

          {/* Cart - Com texto */}
          <NavbarItem>
            <Badge
              color="primary"
              content={cartItemsCount}
              isInvisible={cartItemsCount === 0}
              placement="top-right"
              shape="circle"
              size="md"
            >
              <Button
                className="gap-2 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
                size="md"
                startContent={<ShoppingCart size={20} />}
                variant="light"
                onPress={() => setIsCartOpen(true)}
              >
                <span className="hidden lg:inline">Carrinho</span>
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
