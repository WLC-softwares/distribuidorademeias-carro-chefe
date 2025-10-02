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

        console.log("Webhook MP recebido:", body);

        // Mercado Pago envia diferentes tipos de notificações
        const { type, data } = body;

        // Processar apenas notificações de pagamento
        if (type === "payment") {
            const paymentId = data.id;

            // Buscar informações do pagamento
            const payment = await mercadoPagoPayment.get({ id: paymentId });

            console.log("Pagamento MP:", payment);

            const saleId = payment.external_reference;
            const status = payment.status;

            // Atualizar status da venda no banco
            if (saleId) {
                const newStatus = status === "approved"
                    ? "PAGO"
                    : status === "pending"
                        ? "PENDENTE"
                        : status === "rejected"
                            ? "CANCELADO"
                            : "PENDENTE";

                await prisma.venda.update({
                    where: { id: saleId },
                    data: {
                        status: newStatus as any,
                        formaPagamento: "PIX", // Mercado Pago processa via PIX/cartão
                    },
                });

                console.log(`Venda ${saleId} atualizada para status: ${newStatus}`);

                // 📧 Enviar email e notificação apenas quando pagamento for aprovado
                if (status === "approved") {
                    try {
                        // Buscar dados da venda para email
                        const venda = await prisma.venda.findUnique({
                            where: { id: saleId },
                            include: {
                                itens: {
                                    include: {
                                        produto: true,
                                    },
                                },
                                usuario: {
                                    select: {
                                        nome: true,
                                        email: true,
                                    },
                                },
                            },
                        });

                        if (venda && venda.usuario) {
                            // 📧 Enviar email de confirmação de pagamento
                            const emailHtml = generateOrderConfirmationEmail(
                                venda.usuario.nome,
                                venda.numeroVenda,
                                {
                                    items: venda.itens.map((item) => ({
                                        name: item.produto.nome,
                                        quantity: item.quantidade,
                                        price: Number(item.precoUnit),
                                        total: Number(item.total),
                                    })),
                                    subtotal: Number(venda.subtotal),
                                    discount: Number(venda.desconto),
                                    total: Number(venda.total),
                                    paymentMethod: "Mercado Pago",
                                },
                            );

                            await sendEmail({
                                to: venda.usuario.email,
                                subject: `✅ Pagamento Confirmado - Pedido #${venda.numeroVenda} - Distribuidora Carro Chefe`,
                                html: emailHtml,
                            });

                            console.log(`📧 Email de confirmação enviado para ${venda.usuario.email}`);

                            // 🔔 Criar notificação de pagamento confirmado
                            const notificationService = new NotificationService();
                            await notificationService.createOrderStatusNotification(
                                venda.usuarioId,
                                venda.numeroVenda,
                                saleId,
                                "PAGO",
                                "PENDENTE",
                            );

                            console.log(`🔔 Notificação de pagamento criada para venda ${saleId}`);
                        }
                    } catch (error) {
                        console.error("Erro ao enviar email/notificação:", error);
                        // Não bloqueia o processamento do webhook
                    }
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Erro ao processar webhook MP:", error);
        return NextResponse.json(
            { error: "Erro ao processar webhook" },
            { status: 500 },
        );
    }
}

// Webhook do MP envia GET também para validação
export async function GET() {
    return NextResponse.json({ status: "ok" });
}

