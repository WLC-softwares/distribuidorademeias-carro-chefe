import { NextRequest, NextResponse } from "next/server";

import {
  calculatePackageDimensions,
  calculateShipping,
  validateCEP,
} from "@/lib/melhor-envio";

/**
 * POST /api/shipping/calculate
 * Calcula o frete baseado no CEP de destino e itens do carrinho
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cepDestino, items } = body;

    // Validar CEP
    if (!cepDestino || !validateCEP(cepDestino)) {
      return NextResponse.json(
        { error: "CEP de destino inválido" },
        { status: 400 },
      );
    }

    // Validar items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Carrinho vazio ou inválido" },
        { status: 400 },
      );
    }

    // Calcular peso total e quantidade total
    let totalWeight = 0;
    let totalItems = 0;

    for (const item of items) {
      const productWeight = item.product.weight || 0.08;

      totalWeight += productWeight * item.quantity;
      totalItems += item.quantity;
    }

    // Se o peso total for zero, usar peso mínimo
    if (totalWeight === 0) {
      totalWeight = 0.08 * totalItems; // 80g por item como padrão
    }

    // Calcular dimensões do pacote
    const packageDimensions = calculatePackageDimensions(
      totalWeight,
      totalItems,
    );

    // CEP de origem (Brás - São Paulo)
    const cepOrigem = process.env.MELHOR_ENVIO_CEP_ORIGEM || "03020000";

    // Calcular frete usando Melhor Envio
    const shippingOptions = await calculateShipping({
      from: {
        postal_code: cepOrigem,
      },
      to: {
        postal_code: cepDestino.replace(/\D/g, ""),
      },
      package: {
        weight: packageDimensions.weight,
        width: packageDimensions.width,
        height: packageDimensions.height,
        length: packageDimensions.length,
      },
    });

    return NextResponse.json({
      success: true,
      shippingOptions,
      packageInfo: {
        weight: packageDimensions.weight,
        dimensions: {
          length: packageDimensions.length,
          width: packageDimensions.width,
          height: packageDimensions.height,
        },
        itemCount: totalItems,
      },
    });
  } catch (error) {
    console.error("Erro ao calcular frete:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao calcular frete. Tente novamente.",
      },
      { status: 500 },
    );
  }
}
