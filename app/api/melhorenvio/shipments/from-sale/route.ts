import { NextRequest, NextResponse } from "next/server";

import * as melhorEnvio from "@/lib/melhor-envio";
import { prisma } from "@/lib/prisma";

/**
 * Valida CPF usando o algoritmo oficial
 */
function validateCPF(cpf: string): boolean {
  cpf = cpf.replace(/\D/g, "");

  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false; // Rejeita sequências iguais

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(10, 11))) return false;

  return true;
}

/**
 * POST /api/melhorenvio/shipments/from-sale
 * Criar envio a partir de uma venda
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { saleId, serviceId } = body;

    if (!saleId || !serviceId) {
      return NextResponse.json(
        { error: "saleId e serviceId são obrigatórios" },
        { status: 400 },
      );
    }

    // Buscar venda com dados completos
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!sale) {
      return NextResponse.json(
        { error: "Venda não encontrada" },
        { status: 404 },
      );
    }

    // Verificar se já tem envio criado
    if (sale.melhorEnvioOrderId) {
      return NextResponse.json(
        { error: "Esta venda já possui um envio criado" },
        { status: 400 },
      );
    }

    // Verificar se tem endereço
    if (!sale.shippingZipCode || !sale.shippingStreet) {
      return NextResponse.json(
        { error: "Venda sem endereço de entrega" },
        { status: 400 },
      );
    }

    // Validar variáveis de ambiente obrigatórias
    if (!process.env.COMPANY_DOCUMENT) {
      return NextResponse.json(
        {
          error:
            "COMPANY_DOCUMENT não configurado. Configure o CPF/CNPJ da empresa no arquivo .env",
        },
        { status: 500 },
      );
    }

    // Validar formato do documento (CPF: 11 dígitos, CNPJ: 14 dígitos)
    const companyDocument = process.env.COMPANY_DOCUMENT.replace(/\D/g, "");

    if (companyDocument.length !== 11 && companyDocument.length !== 14) {
      return NextResponse.json(
        {
          error:
            "COMPANY_DOCUMENT inválido. Deve ser um CPF (11 dígitos) ou CNPJ (14 dígitos) válido",
        },
        { status: 500 },
      );
    }

    // Validar CPF se for 11 dígitos
    if (companyDocument.length === 11 && !validateCPF(companyDocument)) {
      return NextResponse.json(
        {
          error: `COMPANY_DOCUMENT inválido. O CPF "${companyDocument}" não é válido. Use um CPF válido como: 39311138053, 47434131074 ou 11144477735`,
        },
        { status: 500 },
      );
    }

    // Calcular peso e dimensões dos produtos
    const totalWeight = sale.items.reduce((acc, item) => {
      const weight = item.product.weight ? Number(item.product.weight) : 0.08; // 80g padrão

      return acc + weight * item.quantity;
    }, 0);

    const packageDimensions = melhorEnvio.calculatePackageDimensions(
      totalWeight,
      sale.items.reduce((acc, item) => acc + item.quantity, 0),
    );

    // Preparar dados do envio
    const payload: melhorEnvio.CartItemParams = {
      service: serviceId,
      from: {
        name: process.env.COMPANY_NAME || "Distribuidora de Meias",
        phone: process.env.COMPANY_PHONE || "(11) 99999-9999",
        email: process.env.COMPANY_EMAIL || "contato@empresa.com",
        document: companyDocument,
        address: process.env.COMPANY_ADDRESS || "Rua Exemplo",
        number: process.env.COMPANY_NUMBER || "123",
        district: process.env.COMPANY_DISTRICT || "Centro",
        city: process.env.COMPANY_CITY || "São Paulo",
        state_abbr: process.env.COMPANY_STATE || "SP",
        country_id: "BR",
        postal_code:
          process.env.MELHOR_ENVIO_ORIGIN_POSTAL_CODE?.replace(/\D/g, "") ||
          "03004001",
      },
      to: {
        name: sale.user.name,
        phone: sale.user.phone || "(11) 00000-0000",
        email: sale.user.email,
        document: sale.user.cpf?.replace(/\D/g, "") || "00000000000",
        address: sale.shippingStreet,
        number: sale.shippingNumber || "S/N",
        complement: sale.shippingComplement || undefined,
        district: sale.shippingNeighborhood || "",
        city: sale.shippingCity || "",
        state_abbr: sale.shippingState || "",
        country_id: "BR",
        postal_code: sale.shippingZipCode.replace(/\D/g, ""),
      },
      products: sale.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        unitary_value: Number(item.unitPrice),
      })),
      volumes: [
        {
          height: packageDimensions.height,
          width: packageDimensions.width,
          length: packageDimensions.length,
          weight: packageDimensions.weight,
        },
      ],
      options: {
        insurance_value: Number(sale.total),
        receipt: false,
        own_hand: false,
        reverse: false,
        non_commercial: false,
        platform: "Distribuidora de Meias",
        tags: [
          {
            tag: sale.saleNumber,
            url: `${process.env.NEXTAUTH_URL}/user/orders/${sale.id}`,
          },
        ],
      },
    };

    // Criar envio no Melhor Envio
    const result = await melhorEnvio.addToCart(payload);

    // Extrair informações da transportadora e serviço
    const shippingCompany = result.company?.name || result.service_name || null;
    const shippingService = result.service_name || result.name || null;
    const shippingCost = result.price ? parseFloat(result.price) : null;

    // Atualizar venda com ID do envio e informações da transportadora
    await prisma.sale.update({
      where: { id: saleId },
      data: {
        melhorEnvioOrderId: result.id,
        shippingCompany: shippingCompany,
        shippingService: shippingService,
        shippingCost: shippingCost,
      },
    });

    return NextResponse.json({ success: true, shipment: result });
  } catch (error) {
    console.error("Erro ao criar envio da venda:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao criar envio da venda",
      },
      { status: 500 },
    );
  }
}
