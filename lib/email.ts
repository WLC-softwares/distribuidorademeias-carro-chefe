/**
 * Email Service
 * Serviço para envio de emails usando Resend
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
    try {
        // Se não houver API key, faz fallback para console.log (desenvolvimento)
        if (!process.env.RESEND_API_KEY) {
            console.log('⚠️  RESEND_API_KEY não configurada - modo desenvolvimento');
            console.log('📧 Email simulado:');
            console.log('Para:', to);
            console.log('Assunto:', subject);
            console.log('Conteúdo:', html);
            return { success: true };
        }

        // Enviar email real usando Resend
        const { data, error } = await resend.emails.send({
            from: 'Distribuidora Carro Chefe <onboarding@resend.dev>',
            to,
            subject,
            html,
        });

        if (error) {
            console.error('Erro ao enviar email:', error);
            throw new Error('Erro ao enviar email');
        }

        console.log('✅ Email enviado com sucesso:', data?.id);
        return { success: true, data };
    } catch (error) {
        console.error('Erro ao enviar email:', error);
        throw new Error('Erro ao enviar email');
    }
}

export function generateOrderConfirmationEmail(
    userName: string,
    orderNumber: string,
    orderDetails: {
        items: Array<{ name: string; quantity: number; price: number; total: number }>;
        subtotal: number;
        discount: number;
        total: number;
        paymentMethod: string;
    }
) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const itemsHtml = orderDetails.items
        .map(
            (item) => `
            <tr>
                <td style="padding: 12px 8px; border-bottom: 1px solid #e9e9e9;">
                    <strong>${item.name}</strong>
                </td>
                <td style="padding: 12px 8px; border-bottom: 1px solid #e9e9e9; text-align: center;">
                    ${item.quantity}
                </td>
                <td style="padding: 12px 8px; border-bottom: 1px solid #e9e9e9; text-align: right;">
                    ${formatCurrency(item.price)}
                </td>
                <td style="padding: 12px 8px; border-bottom: 1px solid #e9e9e9; text-align: right;">
                    <strong>${formatCurrency(item.total)}</strong>
                </td>
            </tr>
        `
        )
        .join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .order-number { background: #fff; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; font-size: 20px; font-weight: bold; color: #10b981; }
                .section-title { color: #059669; font-size: 18px; font-weight: bold; margin: 20px 0 10px 0; }
                .table { width: 100%; border-collapse: collapse; background: white; margin: 15px 0; border-radius: 5px; overflow: hidden; }
                .table th { background: #f3f4f6; padding: 12px 8px; text-align: left; font-weight: 600; }
                .summary { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
                .summary-row { display: flex; justify-content: space-between; padding: 8px 0; }
                .summary-row.total { font-size: 18px; font-weight: bold; color: #10b981; border-top: 2px solid #e9e9e9; padding-top: 15px; margin-top: 10px; }
                .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                .info-box { background: #e0f2fe; border-left: 4px solid #0ea5e9; padding: 15px; margin: 15px 0; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Pedido Confirmado!</h1>
                </div>
                <div class="content">
                    <p>Olá ${userName},</p>
                    <p>Seu pedido foi recebido com sucesso e está sendo processado pela <strong>Distribuidora de Meias Carro Chefe</strong>.</p>
                    
                    <div class="order-number">
                        Pedido #${orderNumber}
                    </div>

                    <div class="info-box">
                        <strong>📦 Status:</strong> Pedido recebido e aguardando processamento<br>
                        <strong>💳 Forma de pagamento:</strong> ${orderDetails.paymentMethod}
                    </div>

                    <p class="section-title">📋 Detalhes do Pedido</p>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Produto</th>
                                <th style="text-align: center;">Qtd</th>
                                <th style="text-align: right;">Preço Unit.</th>
                                <th style="text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>

                    <div class="summary">
                        <div class="summary-row">
                            <span>Subtotal:</span>
                            <span>${formatCurrency(orderDetails.subtotal)}</span>
                        </div>
                        ${orderDetails.discount > 0
            ? `
                        <div class="summary-row">
                            <span>Desconto:</span>
                            <span style="color: #10b981;">-${formatCurrency(orderDetails.discount)}</span>
                        </div>
                        `
            : ''
        }
                        <div class="summary-row total">
                            <span>TOTAL:</span>
                            <span>${formatCurrency(orderDetails.total)}</span>
                        </div>
                    </div>

                    <center>
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/user/pedidos" class="button">
                            Acompanhar Pedido
                        </a>
                    </center>

                    <p><strong>O que acontece agora?</strong></p>
                    <ul>
                        <li>✅ Pedido recebido e registrado</li>
                        <li>⏳ Nossa equipe irá processar seu pedido</li>
                        <li>📧 Você receberá atualizações por email</li>
                        <li>🔔 Acompanhe o status na área do cliente</li>
                    </ul>

                    <p>Se tiver alguma dúvida, entre em contato conosco!</p>
                    
                    <p>Atenciosamente,<br>Equipe Distribuidora de Meias Carro Chefe</p>
                </div>
                <div class="footer">
                    <p>© 2025 Distribuidora de Meias Carro Chefe - Todos os direitos reservados</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

export function generatePasswordResetEmail(name: string, resetUrl: string) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Redefinir Senha</h1>
                </div>
                <div class="content">
                    <p>Olá ${name},</p>
                    <p>Recebemos uma solicitação para redefinir a senha da sua conta na <strong>Distribuidora de Meias Carro Chefe</strong>.</p>
                    <p>Para criar uma nova senha, clique no botão abaixo:</p>
                    <center>
                        <a href="${resetUrl}" class="button">Redefinir Senha</a>
                    </center>
                    <p>Ou copie e cole este link no seu navegador:</p>
                    <p style="background: #e9e9e9; padding: 10px; border-radius: 5px; word-break: break-all;">
                        ${resetUrl}
                    </p>
                    <p><strong>Este link expira em 1 hora.</strong></p>
                    <p>Se você não solicitou a redefinição de senha, ignore este email. Sua senha permanecerá inalterada.</p>
                    <p>Atenciosamente,<br>Equipe Distribuidora de Meias Carro Chefe</p>
                </div>
                <div class="footer">
                    <p>© 2025 Distribuidora de Meias Carro Chefe - Todos os direitos reservados</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

export function generateOrderStatusUpdateEmail(
    userName: string,
    orderNumber: string,
    newStatus: string,
    statusMessage: { emoji: string; title: string; description: string }
) {
    const statusColors: Record<string, string> = {
        PROCESSANDO: '#f59e0b',
        PAGA: '#10b981',
        ENVIADA: '#3b82f6',
        ENTREGUE: '#22c55e',
        CANCELADA: '#ef4444',
        REEMBOLSADA: '#f97316',
    };

    const color = statusColors[newStatus] || '#6b7280';

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: ${color}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .status-badge { display: inline-block; background: ${color}; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 15px 0; }
                .info-box { background: #e0f2fe; border-left: 4px solid #3b82f6; padding: 15px; margin: 15px 0; border-radius: 5px; }
                .button { display: inline-block; background: ${color}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div style="font-size: 48px; margin-bottom: 10px;">${statusMessage.emoji}</div>
                    <h1>${statusMessage.title}</h1>
                </div>
                <div class="content">
                    <p>Olá ${userName},</p>
                    <p>O status do seu pedido foi atualizado:</p>
                    
                    <div style="text-align: center;">
                        <p style="margin: 5px 0; color: #666;">Pedido</p>
                        <p style="font-size: 24px; font-weight: bold; color: #333; margin: 5px 0;">#${orderNumber}</p>
                        <div class="status-badge">
                            ${statusMessage.emoji} ${statusMessage.title}
                        </div>
                    </div>

                    <div class="info-box">
                        <strong>📋 Detalhes:</strong><br>
                        ${statusMessage.description}
                    </div>

                    <center>
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/user/pedidos" class="button">
                            Ver Detalhes do Pedido
                        </a>
                    </center>

                    <p>Você pode acompanhar todas as atualizações do seu pedido na área do cliente.</p>
                    
                    <p>Se tiver alguma dúvida, entre em contato conosco!</p>
                    
                    <p>Atenciosamente,<br>Equipe Distribuidora de Meias Carro Chefe</p>
                </div>
                <div class="footer">
                    <p>© 2025 Distribuidora de Meias Carro Chefe - Todos os direitos reservados</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

