/**
 * Lib: Mercado Pago Client
 * Cliente singleton do Mercado Pago
 */

import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

// Configurar cliente Mercado Pago
const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
    options: {
        timeout: 5000,
    },
});

// Exportar instâncias dos serviços
export const mercadoPagoPayment = new Payment(client);
export const mercadoPagoPreference = new Preference(client);

export { client as mercadoPagoClient };

