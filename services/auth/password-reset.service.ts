/**
 * Service: Password Reset
 * Lógica de negócio para recuperação de senha
 */

import crypto from "crypto";

import bcrypt from "bcryptjs";

import { generatePasswordResetEmail, sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

/**
 * Solicitar recuperação de senha
 */
export async function requestPasswordReset(email: string) {
  try {
    // Verificar se usuário existe
    const user = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!user) {
      // Por segurança, não informar se o email existe ou não
      return {
        success: true,
        message:
          "Se o email existir, você receberá instruções para redefinir sua senha.",
      };
    }

    // Gerar token único
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // Token expira em 1 hora
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    // Salvar token no banco
    await prisma.usuario.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry,
      },
    });

    // Gerar URL de reset
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/redefinir-senha?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Enviar email
    const emailHtml = generatePasswordResetEmail(user.nome, resetUrl);

    await sendEmail({
      to: email,
      subject: "Redefinir Senha - Distribuidora de Meias",
      html: emailHtml,
    });

    return {
      success: true,
      message:
        "Se o email existir, você receberá instruções para redefinir sua senha.",
    };
  } catch (error) {
    console.error("Erro ao solicitar reset de senha:", error);
    throw new Error("Erro ao processar solicitação");
  }
}

/**
 * Verificar se o token é válido
 */
export async function verifyResetToken(email: string, token: string) {
  try {
    const user = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!user || !user.resetToken || !user.resetTokenExpiry) {
      return { valid: false, message: "Token inválido ou expirado" };
    }

    // Verificar se token expirou
    if (new Date() > user.resetTokenExpiry) {
      return { valid: false, message: "Token expirado" };
    }

    // Verificar se token corresponde
    const isValid = await bcrypt.compare(token, user.resetToken);

    if (!isValid) {
      return { valid: false, message: "Token inválido" };
    }

    return { valid: true, userId: user.id };
  } catch (error) {
    console.error("Erro ao verificar token:", error);

    return { valid: false, message: "Erro ao verificar token" };
  }
}

/**
 * Redefinir senha
 */
export async function resetPassword(
  email: string,
  token: string,
  newPassword: string,
) {
  try {
    // Verificar token
    const verification = await verifyResetToken(email, token);

    if (!verification.valid) {
      throw new Error(verification.message);
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha e limpar token
    await prisma.usuario.update({
      where: { id: verification.userId },
      data: {
        senha: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return { success: true, message: "Senha redefinida com sucesso!" };
  } catch (error) {
    console.error("Erro ao redefinir senha:", error);
    throw error;
  }
}
