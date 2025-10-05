"use client";

import { Link } from "@heroui/link";
import { Spinner } from "@heroui/spinner";
import {
  Box,
  LayoutDashboard,
  LogOut,
  ShoppingBag,
  Truck,
  Users,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useSession } from "@/hooks";

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Produtos",
    href: "/admin/products",
    icon: Box,
  },
  {
    title: "Usuários",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Vendas",
    href: "/admin/sales",
    icon: ShoppingBag,
  },
  {
    title: "Frete",
    href: "/admin/shippings",
    icon: Truck,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (!isLoading && user && user.role !== "ADMIN") {
      router.replace("/user/profile");
    }
  }, [user, isLoading, router]);

  // Fechar sidebar ao mudar de rota
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Escutar evento de toggle do header
  useEffect(() => {
    const handleToggle = () => {
      setSidebarOpen((prev) => !prev);
    };

    window.addEventListener("toggleAdminSidebar", handleToggle);

    return () => window.removeEventListener("toggleAdminSidebar", handleToggle);
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  };

  // Mostrar loading enquanto verifica
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner color="warning" size="lg" />
      </div>
    );
  }

  // Se não é admin, não renderizar nada (vai redirecionar)
  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:pt-20 bg-white border-r border-gray-200 shadow-sm z-40">
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto pt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                as={NextLink}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive
                    ? "bg-blue-50 text-blue-700 font-semibold shadow-sm"
                    : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                  }
                `}
                href={item.href}
              >
                <Icon size={20} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            className="flex items-center gap-3 px-4 py-3 w-full text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between h-20 px-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <h1 className="text-lg font-bold text-white">Admin Panel</h1>
          <button
            className="p-2 text-white hover:bg-blue-800 rounded-lg transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-160px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                as={NextLink}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive
                    ? "bg-blue-50 text-blue-700 font-semibold shadow-sm"
                    : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
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
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <button
            className="flex items-center gap-3 px-4 py-3 w-full text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Overlay para Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
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

      {/* Main Content - Scroll natural */}
      <main className="lg:pl-64 pt-20">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
