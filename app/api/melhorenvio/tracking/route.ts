import { NextRequest, NextResponse } from "next/server";

import * as melhorEnvio from "@/lib/melhor-envio";

/**
 * POST /api/melhorenvio/tracking
 * Rastrear envios
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orders } = body;

    if (!orders || !Array.isArray(orders)) {
      return NextResponse.json(
        { error: "orders deve ser um array" },
        { status: 400 },
      );
    }

    const result = await melhorEnvio.trackShipment(orders);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao rastrear envios:", error);

    return NextResponse.json(
      { error: "Erro ao rastrear envios" },
      { status: 500 },
    );
  }
}
