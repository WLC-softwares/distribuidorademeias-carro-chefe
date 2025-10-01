import "@/styles/globals.css";
import clsx from "clsx";
import { Metadata, Viewport } from "next";

import { Providers } from "./providers";

import Header from "@/components/header/header";
import { fontSans } from "@/config/fonts";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "Distribuidora de Meias Carro Chefe",
    template: `%s - Distribuidora de Meias Carro Chefe`,
  },
  description: "Distribuidora de Meias Carro Chefe",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en" className="overflow-x-hidden">
      <head />
      <body
        className={clsx(
          "min-h-screen text-foreground bg-background font-sans antialiased overflow-x-hidden",
          fontSans.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
          <Toaster position="top-right" richColors />
          <div className="relative flex flex-col min-h-screen w-full overflow-x-hidden">
            <Header />
            <main className="flex-grow w-full">
              {children}
            </main>
            <footer className="w-full bg-white border-t border-gray-200 py-6">
              <div className="container mx-auto px-2 sm:px-4 text-center text-sm text-gray-600">
                <p>© 2025 Distribuidora de Meias Carro Chefe - Todos os direitos reservados</p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
