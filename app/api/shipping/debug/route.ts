import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/shipping/debug
 * Verifica configuração do Melhor Envio
 */
export async function GET(_request: NextRequest) {
    const hasToken = !!process.env.MELHOR_ENVIO_TOKEN;
    const hasCepOrigem = !!process.env.MELHOR_ENVIO_CEP_ORIGEM;
    const apiUrl = process.env.MELHOR_ENVIO_API_URL || "https://melhorenvio.com.br/api/v2";

    return NextResponse.json({
        config: {
            hasToken,
            tokenLength: hasToken ? process.env.MELHOR_ENVIO_TOKEN?.length : 0,
            hasCepOrigem,
            cepOrigem: hasCepOrigem ? process.env.MELHOR_ENVIO_CEP_ORIGEM : null,
            apiUrl,
        },
        mode: hasToken ? "production" : "simulated",
        message: hasToken
            ? "✅ Configurado para usar API do Melhor Envio"
            : "⚠️ Modo simulado - configure MELHOR_ENVIO_TOKEN no .env",
    });
}

