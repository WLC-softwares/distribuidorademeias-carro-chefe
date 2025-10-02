/**
 * API Route: Create Mercado Pago Preference
 * Cria uma preferência de pagamento no Mercado Pago
 */

import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { mercadoPagoPreference } from "@/lib/mercadopago";

export async function POST(request: NextRequest) {
    try {
        // Verificar autenticação
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const body = await request.json();
        const { items, saleId, saleNumber } = body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { error: "Items são obrigatórios" },
                { status: 400 },
            );
        }

        // Obter URL base (funciona tanto local quanto em produção)
        const host = request.headers.get("host") || "localhost:3000";
        const protocol = host.includes("localhost") ? "http" : "https";
        const baseUrl = process.env.NEXTAUTH_URL || `${protocol}://${host}`;

        console.log("🔗 Base URL para MP:", baseUrl);

        const backUrls = {
            success: `${baseUrl}/payment/success`,
            failure: `${baseUrl}/payment/failure`,
            pending: `${baseUrl}/payment/pending`,
        };

        console.log("🔙 Back URLs:", backUrls);

        // Preparar dados da preferência
        const preferenceData: any = {
            items: items.map((item: any) => ({
                title: item.nome,
                description: item.descricao || "",
                quantity: item.quantidade,
                unit_price: Number(item.preco),
                currency_id: "BRL",
            })),
            payer: {
                name: session.user.name || "",
                email: session.user.email || "",
            },
            back_urls: backUrls,
            external_reference: saleId || saleNumber || "",
            notification_url: `${baseUrl}/api/mercadopago/webhook`,
            statement_descriptor: "DISTRIBUIDORA MEIAS",
            payment_methods: {
                installments: 12,
                default_installments: 1,
            },
        };

        console.log("📦 Enviando para MP:", JSON.stringify(preferenceData, null, 2));

        // Criar preferência no Mercado Pago
        const preference = await mercadoPagoPreference.create({
            body: preferenceData,
        });

        return NextResponse.json({
            preferenceId: preference.id,
            initPoint: preference.init_point,
            sandboxInitPoint: preference.sandbox_init_point,
        });
    } catch (error) {
        console.error("Erro ao criar preferência MP:", error);
        return NextResponse.json(
            { error: "Erro ao criar preferência de pagamento" },
            { status: 500 },
        );
    }
}

