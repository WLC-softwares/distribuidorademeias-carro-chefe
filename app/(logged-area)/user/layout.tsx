"use client";

import { Link } from "@heroui/link";
import {
  LogOut,
  MapPin,
  Menu,
  Package,
  Store,
  User as UserIcon,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const menuItems = [
  {
    title: "Meu Perfil",
    href: "/user/perfil",
    icon: UserIcon,
  },
  {
    title: "Meus Pedidos",
    href: "/user/pedidos",
    icon: Package,
  },
  {
    title: "Endereços",
    href: "/user/enderecos",
    icon: MapPin,
  },
];

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-yellow-400 h-16 flex items-center justify-between px-4 z-40 shadow-md">
        <h1 className="text-xl font-bold text-gray-800">Minha Conta</h1>
        <button
          className="p-2 hover:bg-yellow-300 rounded-md transition-colors"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
                    fixed top-0 left-0 h-screen w-64 bg-white shadow-lg z-50 transition-transform duration-300
                    lg:translate-x-0
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                `}
      >
        {/* Logo/Header */}
        <div className="h-16 bg-yellow-400 flex items-center justify-center">
          <h1 className="text-xl font-bold text-gray-800">Minha Conta</h1>
        </div>

        {/* Botão Voltar para Loja */}
        <div className="p-4 border-b border-gray-200">
          <Link
            as={NextLink}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors font-semibold"
            href="/"
            onClick={() => setSidebarOpen(false)}
          >
            <Store size={20} />
            <span>Voltar para Loja</span>
          </Link>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                as={NextLink}
                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                                    ${
                                      isActive
                                        ? "bg-yellow-100 text-yellow-700 font-semibold"
                                        : "text-gray-700 hover:bg-gray-100"
                                    }
                                `}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button
            className="flex items-center gap-3 px-4 py-3 w-full text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          role="button"
          tabIndex={0}
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setSidebarOpen(false);
            }
          }}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen bg-gray-50">
        <div className="p-6">{children}</div>
      </main>
    </>
  );
}
