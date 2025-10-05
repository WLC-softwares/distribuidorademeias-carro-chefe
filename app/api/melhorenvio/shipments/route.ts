import { NextRequest, NextResponse } from "next/server";

import * as melhorEnvio from "@/lib/melhor-envio";

/**
 * GET /api/melhorenvio/shipments
 * Listar todos os envios
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page");
    const perPage = searchParams.get("per_page");
    const status = searchParams.get("status");

    const result = await melhorEnvio.listShipments({
      page: page ? parseInt(page) : undefined,
      per_page: perPage ? parseInt(perPage) : undefined,
      status: status || undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao listar envios:", error);

    return NextResponse.json(
      { error: "Erro ao listar envios" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/melhorenvio/shipments
 * Criar novo envio (adicionar ao carrinho)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await melhorEnvio.addToCart(body);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao criar envio:", error);

    return NextResponse.json({ error: "Erro ao criar envio" }, { status: 500 });
  }
}
