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
      : (process.env.NEXTAUTH_URL || productionUrl);

    // console.log("🔗 Base URL para MP:", baseUrl);

    const backUrls = {
      success: `${baseUrl}/payment/success`,
      failure: `${baseUrl}/payment/failure`,
      pending: `${baseUrl}/payment/pending`,
    };

    // console.log("🔙 Back URLs:", backUrls);

    // Preparar telefone (extrair DDD e número)
    let areaCode = "11";
    let phoneNumber = "999999999";

    if (userData?.telefone) {
      const cleanPhone = userData.telefone.replace(/\D/g, "");

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

    if (userData?.enderecos && userData.enderecos.length > 0) {
      const primaryAddress =
        userData.enderecos.find((e) => e.principal) || userData.enderecos[0];

      address = {
        zip_code: primaryAddress.cep.replace(/\D/g, ""),
        street_name: primaryAddress.logradouro,
        street_number: parseInt(primaryAddress.numero) || 0,
      };
    }

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
      back_urls: backUrls,
      auto_return: "approved",
      external_reference: saleId || saleNumber || "",
      notification_url: `${baseUrl}/api/mercadopago/webhook`,
      statement_descriptor: "DISTRIBUIDORA MEIAS",
      payment_methods: {
        installments: 12,
        default_installments: 1,
      },
    };

    // console.log("📦 Enviando para MP:", JSON.stringify(preferenceData, null, 2));

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
