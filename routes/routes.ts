/**
 * Constants: Routes
 * Application route constants
 */

export const ROUTES = {
  // Public
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  CHECKOUT: "/checkout",

  // Admin
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/users",
    PRODUCTS: "/admin/products",
    SALES: "/admin/sales",
  },

  // User
  USER: {
    DASHBOARD: "/user/dashboard",
    PROFILE: "/user/profile",
    ORDERS: "/user/orders",
    ADDRESSES: "/user/addresses",
    CART: "/user/cart",
    CHECKOUT: "/user/checkout",
    PAYMENT: "/user/payment",
  },
} as const;

export const PUBLIC_ROUTES = [ROUTES.HOME, ROUTES.LOGIN, ROUTES.REGISTER];

export const ADMIN_ROUTES = Object.values(ROUTES.ADMIN);

export const USER_ROUTES = Object.values(ROUTES.USER);
