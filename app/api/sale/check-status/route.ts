/**
 * API Route: Check Sale Status
 * Verifica o status atual de uma venda
 */

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const saleId = searchParams.get("saleId");
    const saleNumber = searchParams.get("saleNumber");

    if (!saleId && !saleNumber) {
      return NextResponse.json(
        { error: "ID ou número da venda é obrigatório" },
        { status: 400 },
      );
    }

    const sale = await prisma.venda.findFirst({
      where: saleId
        ? { id: saleId }
        : { numeroVenda: saleNumber! },
      select: {
        id: true,
        numeroVenda: true,
        status: true,
        total: true,
        createdAt: true,
      },
    });

    if (!sale) {
      return NextResponse.json(
        { error: "Venda não encontrada" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      id: sale.id,
      numeroVenda: sale.numeroVenda,
      status: sale.status,
      total: sale.total,
      createdAt: sale.createdAt,
    });
  } catch (error) {
    console.error("Erro ao verificar status da venda:", error);

    return NextResponse.json(
      { error: "Erro ao verificar status da venda" },
      { status: 500 },
    );
  }
}

