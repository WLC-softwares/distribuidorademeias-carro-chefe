import { NextResponse } from "next/server";

/**
 * GET /api/melhorenvio/cancel-reasons
 * Buscar motivos de cancelamento disponíveis
 */
export async function GET() {
  try {
    const token = process.env.MELHOR_ENVIO_TOKEN;
    const apiUrl = process.env.MELHOR_ENVIO_API_URL;

    if (!token) {
      return NextResponse.json(
        { error: "Token não configurado" },
        { status: 500 },
      );
    }

    // Tentar buscar na API de informações
    const response = await fetch(`${apiUrl}/me/shipment/cancel-reasons`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "Distribuidora de Meias",
      },
    });

    if (!response.ok) {
      console.error("Erro ao buscar motivos:", response.status);

      // Retornar motivos padrão se a API falhar
      return NextResponse.json({
        reasons: [
          { id: 1, label: "Desistência da compra" },
          { id: 2, label: "Erro no pedido" },
          { id: 3, label: "Produto indisponível" },
          { id: 4, label: "Endereço incorreto" },
          { id: 5, label: "Outro motivo" },
        ],
      });
    }

    const data = await response.json();

    return NextResponse.json({ reasons: data });
  } catch (error) {
    console.error("Erro ao buscar motivos de cancelamento:", error);

    // Retornar motivos padrão em caso de erro
    return NextResponse.json({
      reasons: [
        { id: 1, label: "Desistência da compra" },
        { id: 2, label: "Erro no pedido" },
        { id: 3, label: "Produto indisponível" },
        { id: 4, label: "Endereço incorreto" },
        { id: 5, label: "Outro motivo" },
      ],
    });
  }
}
