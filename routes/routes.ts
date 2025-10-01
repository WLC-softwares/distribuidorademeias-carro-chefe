/**
 * Constants: Routes
 * Constantes de rotas da aplicação
 */

export const ROUTES = {
  // Públicas
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  CHECKOUT: "/checkout",

  // Admin
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    USUARIOS: "/admin/usuarios",
    PRODUTOS: "/admin/produtos",
    VENDAS: "/admin/vendas",
  },

  // User
  USER: {
    DASHBOARD: "/user/dashboard",
    PERFIL: "/user/perfil",
    PEDIDOS: "/user/pedidos",
    CARRINHO: "/user/carrinho",
    CHECKOUT: "/user/checkout",
    PAGAMENTO: "/user/pagamento",
  },
} as const;

export const PUBLIC_ROUTES = [ROUTES.HOME, ROUTES.LOGIN, ROUTES.REGISTER];

export const ADMIN_ROUTES = Object.values(ROUTES.ADMIN);

export const USER_ROUTES = Object.values(ROUTES.USER);
