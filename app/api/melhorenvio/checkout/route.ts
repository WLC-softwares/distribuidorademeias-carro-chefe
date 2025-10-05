import { NextRequest, NextResponse } from "next/server";

import * as melhorEnvio from "@/lib/melhor-envio";

/**
 * POST /api/melhorenvio/checkout
 * Comprar fretes (checkout)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderIds } = body;

    if (!orderIds || !Array.isArray(orderIds)) {
      return NextResponse.json(
        { error: "orderIds deve ser um array" },
        { status: 400 },
      );
    }

    const result = await melhorEnvio.checkoutShipments(orderIds);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao fazer checkout:", error);

    return NextResponse.json(
      { error: "Erro ao fazer checkout" },
      { status: 500 },
    );
  }
}
