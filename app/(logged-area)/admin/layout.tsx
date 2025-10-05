"use client";

import { Link } from "@heroui/link";
import { Spinner } from "@heroui/spinner";
import {
  Box,
  LayoutDashboard,
  LogOut,
  Menu,
  ShoppingBag,
  Truck,
  Users,
  X,
} from "lucide-react";
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
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-primary h-16 flex items-center justify-between px-4 z-40 shadow-md">
        <h1 className="text-xl font-bold text-white">Admin Panel</h1>
        <button
          className="p-2 hover:bg-gray-800 rounded-md transition-colors text-white"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
                    fixed left-0 h-screen w-64 bg-white border-r border-gray-200 shadow-lg  transition-transform duration-300
                    lg:translate-x-0
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                `}
      >
        {/* Logo/Header */}
        <div className="h-16 flex items-center justify-center">
          <h1 className="text-xl font-bold text-dark">Admin Panel</h1>
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
                                        ? "bg-primary text-white font-semibold"
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
          <button className="flex items-center gap-3 px-4 py-3 w-full text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
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
