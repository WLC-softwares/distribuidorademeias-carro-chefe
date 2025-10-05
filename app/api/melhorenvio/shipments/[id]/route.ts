import { NextRequest, NextResponse } from "next/server";

import * as melhorEnvio from "@/lib/melhor-envio";

/**
 * GET /api/melhorenvio/shipments/[id]
 * Buscar envio específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = await melhorEnvio.getShipment(id);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao buscar envio:", error);

    return NextResponse.json(
      { error: "Erro ao buscar envio" },
      { status: 500 },
    );
  }
}
