import { NextRequest, NextResponse } from "next/server";

import * as melhorEnvio from "@/lib/melhor-envio";

/**
 * POST /api/melhorenvio/cancel
 * Cancelar envio
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, reasonId, description } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId obrigatório" },
        { status: 400 },
      );
    }

    // Se não fornecido, usa ENDERECO_INCORRETO (4) como padrão
    const reason = reasonId || melhorEnvio.CancelReasonId.ENDERECO_INCORRETO;

    const result = await melhorEnvio.cancelShipment(
      orderId,
      reason,
      description,
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao cancelar envio:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erro ao cancelar envio",
      },
      { status: 500 },
    );
  }
}
