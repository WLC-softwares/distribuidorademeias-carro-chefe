import { NextRequest, NextResponse } from "next/server";

import * as melhorEnvio from "@/lib/melhor-envio";

/**
 * GET /api/melhorenvio/cart
 * Listar itens do carrinho
 */
export async function GET() {
  try {
    const result = await melhorEnvio.getCartItems();

    // A API retorna um objeto paginado { data: [...], total: X, ... }
    // Extrair apenas o array de itens
    const items = result.data || [];

    return NextResponse.json(items);
  } catch (error) {
    console.error("Erro ao listar carrinho:", error);

    return NextResponse.json(
      { error: "Erro ao listar carrinho" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/melhorenvio/cart?itemId=xxx
 * Remover item do carrinho
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { error: "itemId obrigatório" },
        { status: 400 },
      );
    }

    const result = await melhorEnvio.removeFromCart(itemId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao remover do carrinho:", error);

    return NextResponse.json(
      { error: "Erro ao remover do carrinho" },
      { status: 500 },
    );
  }
}
