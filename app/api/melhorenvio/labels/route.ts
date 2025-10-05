import { NextRequest, NextResponse } from "next/server";

import * as melhorEnvio from "@/lib/melhor-envio";

/**
 * POST /api/melhorenvio/labels/generate
 * Gerar etiquetas
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderIds, action } = body;

    if (!orderIds || !Array.isArray(orderIds)) {
      return NextResponse.json(
        { error: "orderIds deve ser um array" },
        { status: 400 },
      );
    }

    let result;

    if (action === "generate") {
      result = await melhorEnvio.generateLabels(orderIds);
    } else if (action === "print") {
      const mode = body.mode || "private";

      result = await melhorEnvio.printLabels(orderIds, mode);
    } else {
      return NextResponse.json({ error: "Action inválida" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao processar etiquetas:", error);

    return NextResponse.json(
      { error: "Erro ao processar etiquetas" },
      { status: 500 },
    );
  }
}
