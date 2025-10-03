/**
 * API Route: Mercado Pago Webhook
 * Recebe notificações de pagamento do Mercado Pago
 */

import { NextRequest, NextResponse } from "next/server";

import { generateOrderConfirmationEmail, sendEmail } from "@/lib/email";
import { mercadoPagoPayment } from "@/lib/mercadopago";
import { prisma } from "@/lib/prisma";
import { NotificationService } from "@/services/notification/notification.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // console.log("Webhook MP recebido:", body);

    // Mercado Pago envia diferentes tipos de notificações
    const { type, data } = body;

    // Processar apenas notificações de pagamento
    if (type !== "payment") {
      // console.log("Ignorando evento do tipo:", type);
      return NextResponse.json({ received: true, ignored: true });
    }

    const paymentId = data.id;

    // Buscar informações do pagamento
    const payment = await mercadoPagoPayment.get({ id: paymentId });

    // console.log("Pagamento MP:", payment);

    const saleId = payment.external_reference;
    const status = payment.status;

    // Atualizar status da venda no banco
    if (saleId) {
      const newStatus =
        status === "approved"
          ? "PAGA"
          : status === "pending"
            ? "PENDENTE"
            : status === "rejected"
              ? "CANCELADA"
              : "PENDENTE";

      await prisma.sale.update({
        where: { id: saleId },
        data: {
          status: newStatus as any,
          paymentMethod: "PIX",
          completedAt: status === "approved" ? new Date() : undefined,
        },
      });

      // console.log(`Venda ${saleId} atualizada para status: ${newStatus}`);

      // 📧 Enviar email e notificação apenas quando pagamento for aprovado
      if (status === "approved") {
        try {
          // Buscar dados da venda para atualizar estoque e enviar email
          const sale = await prisma.sale.findUnique({
            where: { id: saleId },
            include: {
              items: {
                include: {
                  product: true,
                },
              },
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          });

          if (sale) {
            // 📦 Atualizar estoque dos produtos
            for (const item of sale.items) {
              const produto = await prisma.product.findUnique({
                where: { id: item.productId },
                select: { quantity: true, name: true },
              });

              if (produto) {
                const novaQuantidade = Math.max(
                  0,
                  produto.quantity - item.quantity,
                );

                await prisma.product.update({
                  where: { id: item.productId },
                  data: {
                    quantity: novaQuantidade,
                  },
                });

                // console.log(`📦 Estoque do produto ${item.produto.nome} atualizado: ${produto.quantidade} -> ${novaQuantidade}`);
              }
            }

            // 📧 Enviar email de confirmação se houver usuário
            if (sale.user) {
              // 📧 Enviar email de confirmação de pagamento
              const emailHtml = generateOrderConfirmationEmail(
                sale.user.name,
                sale.saleNumber,
                {
                  items: sale.items.map((item) => ({
                    name: item.product.name,
                    quantity: item.quantity,
                    price: Number(item.unitPrice),
                    total: Number(item.total),
                  })),
                  subtotal: Number(sale.subtotal),
                  discount: Number(sale.discount),
                  total: Number(sale.total),
                  paymentMethod: "Mercado Pago",
                },
              );

              await sendEmail({
                to: sale.user.email,
                subject: `✅ Pagamento Confirmado - Pedido #${sale.saleNumber} - Distribuidora Carro Chefe`,
                html: emailHtml,
              });

              // console.log(`📧 Email de confirmação enviado for ${sale.user.email}`);

              // 🔔 Criar notificação de pagamento confirmado
              const notificationService = new NotificationService();

              await notificationService.createOrderStatusNotification(
                sale.userId,
                sale.saleNumber,
                saleId,
                "PAID",
                "PENDING",
              );

              // console.log(`🔔 Notificação de pagamento criada para venda ${saleId}`);
            }
          }
        } catch (error) {
          console.error("Error processing approved sale:", error);
          // Não bloqueia o processamento do webhook
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing MP webhook:", error);

    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 },
    );
  }
}

// Webhook do MP envia GET também para validação
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
