import { NextRequest, NextResponse } from "next/server";

import * as melhorEnvio from "@/lib/melhor-envio";

/**
 * GET /api/melhorenvio/info?type=carriers|agencies|balance
 * Obter informações do Melhor Envio
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");

    let result;

    switch (type) {
      case "carriers":
        result = await melhorEnvio.listCarriers();
        break;
      case "agencies": {
        const company = searchParams.get("company");
        const state = searchParams.get("state");
        const city = searchParams.get("city");

        result = await melhorEnvio.listAgencies({
          company: company ? parseInt(company) : undefined,
          state: state || undefined,
          city: city || undefined,
        });
        break;
      }
      case "balance":
        result = await melhorEnvio.getBalance();
        break;
      default:
        return NextResponse.json({ error: "Type inválido" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao buscar informações:", error);

    return NextResponse.json(
      { error: "Erro ao buscar informações" },
      { status: 500 },
    );
  }
}
