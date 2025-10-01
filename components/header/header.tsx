'use client';

import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem
} from "@heroui/navbar";

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

import { CartDrawer } from '@/components/cart';
import { NotificationDropdown } from '@/components/notifications';
import { useAuth, useCart } from '@/hooks';
import { ChevronDown, LogOut, MapPin, Package, Settings, ShoppingCart, Tag, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import logo from '../../public/logo.png';

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
    const menuItems = user ? [
        {
            key: 'user-info',
            className: 'py-2 cursor-default',
            isReadOnly: true,
            content: (
                <div className="flex flex-col gap-1">
                    <p className="font-semibold text-sm">{user.nome}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                </div>
            ),
        },
        {
            key: 'profile',
            startContent: <User size={18} className="text-blue-600" />,
            className: 'py-2',
            onPress: () => router.push('/user/perfil'),
            content: 'Minha conta',
        },
        {
            key: 'orders',
            startContent: <Package size={18} className="text-green-600" />,
            className: 'py-2',
            onPress: () => router.push('/user/pedidos'),
            content: 'Meus pedidos',
        },
        {
            key: 'addresses',
            startContent: <MapPin size={18} className="text-orange-600" />,
            className: 'py-2',
            onPress: () => router.push('/user/enderecos'),
            content: 'Meus endereços',
        },
        ...(user.role === 'ADMIN' ? [{
            key: 'admin',
            startContent: <Settings size={18} className="text-purple-600" />,
            className: 'py-2',
            onPress: () => router.push('/admin/dashboard'),
            content: 'Painel Admin',
        }] : []),
        {
            key: 'logout',
            startContent: <LogOut size={18} className="text-red-600" />,
            className: 'py-2 text-red-600',
            color: 'danger' as const,
            onPress: handleLogout,
            content: 'Sair',
        },
    ] : [];
    return (
        <Navbar
            maxWidth="full"
            className="bg-yellow-400 shadow-sm"
            classNames={{
                wrapper: 'px-4 md:px-6 py-0',
                base: 'h-16',
            }}
        >
            {/* Logo */}
            <NavbarBrand>
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src={logo}
                        alt="Logo Distribuidora de Meias"
                        width={60}
                        height={60}
                        className="cursor-pointer"
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
            <NavbarContent justify="end" className="gap-2 md:gap-3">
                {/* Ofertas - Oculto em mobile */}
                <NavbarItem className="hidden lg:flex">
                    <Button
                        as={Link}
                        href="/ofertas"
                        variant="light"
                        size="sm"
                        className="text-gray-700 font-semibold"
                        startContent={<Tag size={16} />}
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
                                    variant="light"
                                    size="sm"
                                    className="text-gray-700 font-semibold gap-2"
                                >
                                    <Avatar
                                        src={user.avatar || undefined}
                                        name={user.nome || user.email}
                                        size="sm"
                                        className="w-6 h-6"
                                    />
                                    <span className="hidden md:inline">{user.nome || 'Conta'}</span>
                                    <ChevronDown size={14} />
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                aria-label="Ações do usuário"
                                variant="flat"
                                classNames={{
                                    base: 'p-1',
                                }}
                            >
                                {menuItems.map((item) => (
                                    <DropdownItem
                                        key={item.key}
                                        className={item.className}
                                        startContent={item.startContent}
                                        onPress={item.onPress}
                                        color={item.color}
                                        isReadOnly={item.isReadOnly}
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
                                href="/login"
                                variant="light"
                                size="sm"
                                className="text-gray-700 font-semibold"
                                startContent={<User size={16} />}
                            >
                                Entrar
                            </Button>
                            <Button
                                as={Link}
                                href="/register"
                                color="primary"
                                size="sm"
                                className="font-semibold hidden md:flex"
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
                        content={cartItemsCount}
                        color="danger"
                        size="sm"
                        placement="top-right"
                        isInvisible={cartItemsCount === 0}
                    >
                        <Button
                            isIconOnly
                            variant="light"
                            size="md"
                            aria-label="Carrinho de compras"
                            onPress={() => setIsCartOpen(true)}
                            className="min-w-10 h-10"
                        >
                            <ShoppingCart size={22} className="text-gray-700" />
                        </Button>
                    </Badge>
                </NavbarItem>
            </NavbarContent>

            {/* Cart Drawer */}
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </Navbar>
    );
}
