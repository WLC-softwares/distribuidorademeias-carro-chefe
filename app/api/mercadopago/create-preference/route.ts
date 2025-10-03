/**
 * API Route: Create Mercado Pago Preference
 * Cria uma preferência de pagamento no Mercado Pago
 */

import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { mercadoPagoPreference } from "@/lib/mercadopago";
import { userRepository } from "@/repositories";

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

    // Buscar dados completos do usuário
    const userData = await userRepository.findById(session.user.id!);

    // Obter URL base - SEMPRE usar domínio de produção fixo
    const productionUrl = "https://distribuidorademeias-carro-chefe.vercel.app";
    const isLocal = request.headers.get("host")?.includes("localhost");
    const baseUrl = isLocal
      ? "http://localhost:3000"
      : process.env.NEXTAUTH_URL || productionUrl;

    // console.log("🔗 Base URL para MP:", baseUrl);

    const backUrls = {
      success: `${baseUrl}/payment/success?saleId=${saleId}`,
      failure: `${baseUrl}/payment/failure?saleId=${saleId}`,
      pending: `${baseUrl}/payment/pending?saleId=${saleId}`,
    };

    console.log("🔙 Back URLs:", backUrls);

    // Preparar telefone (extrair DDD e número)
    let areaCode = "11";
    let phoneNumber = "999999999";

    if (userData?.phone) {
      const cleanPhone = userData.phone.replace(/\D/g, "");

      if (cleanPhone.length >= 10) {
        areaCode = cleanPhone.substring(0, 2);
        phoneNumber = cleanPhone.substring(2);
      }
    }

    // Preparar endereço
    let address: any = {
      zip_code: "01310-100",
      street_name: "Av Paulista",
      street_number: 1000,
    };

    if (userData?.addresses && userData.addresses.length > 0) {
      const primaryAddress =
        userData.addresses.find((e) => e.primary) || userData.addresses[0];

      address = {
        zip_code: primaryAddress.zipCode.replace(/\D/g, ""),
        street_name: primaryAddress.street,
        street_number: parseInt(primaryAddress.number) || 0,
      };
    }

    // Preparar dados da preferência
    const preferenceData: any = {
      items: items.map((item: any) => ({
        title: item.name,
        description: item.description || "",
        quantity: item.quantity,
        unit_price: Number(item.price),
        currency_id: "BRL",
      })),
      payer: {
        name: session.user.name || "",
        email: session.user.email || "",
        phone: {
          area_code: areaCode,
          number: phoneNumber,
        },
        identification: {
          type: "CPF",
          number: userData?.cpf?.replace(/\D/g, "") || "12345678909",
        },
        address: address,
      },
      back_urls: {
        success: backUrls.success,
        failure: backUrls.failure,
        pending: backUrls.pending,
      },
      notification_url: `${baseUrl}/api/mercadopago/webhook`,
      external_reference: saleId || saleNumber || "",
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
