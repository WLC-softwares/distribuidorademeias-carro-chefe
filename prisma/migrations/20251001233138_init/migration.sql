-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER', 'GUEST');

-- CreateEnum
CREATE TYPE "StatusProduto" AS ENUM ('ATIVO', 'INATIVO', 'ESGOTADO', 'DESCONTINUADO');

-- CreateEnum
CREATE TYPE "CategoriaProduto" AS ENUM ('MEIAS_MASCULINAS', 'MEIAS_FEMININAS', 'MEIAS_INFANTIS', 'MEIAS_ESPORTIVAS', 'MEIAS_SOCIAIS', 'MEIAS_TERMICAS', 'ACESSORIOS', 'OUTROS');

-- CreateEnum
CREATE TYPE "StatusVenda" AS ENUM ('PENDENTE', 'PROCESSANDO', 'PAGA', 'ENVIADA', 'ENTREGUE', 'CANCELADA', 'REEMBOLSADA');

-- CreateEnum
CREATE TYPE "FormaPagamento" AS ENUM ('DINHEIRO', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'PIX', 'BOLETO', 'TRANSFERENCIA');

-- CreateEnum
CREATE TYPE "TipoVenda" AS ENUM ('VAREJO', 'ATACADO');

-- CreateEnum
CREATE TYPE "TipoNotificacao" AS ENUM ('PEDIDO_CRIADO', 'PEDIDO_PROCESSANDO', 'PEDIDO_PAGO', 'PEDIDO_ENVIADO', 'PEDIDO_ENTREGUE', 'PEDIDO_CANCELADO', 'SISTEMA');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "telefone" TEXT,
    "cpf" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "avatar" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "reset_token" TEXT,
    "reset_token_expiry" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enderecos" (
    "id" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "logradouro" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "complemento" TEXT,
    "bairro" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "pais" TEXT NOT NULL DEFAULT 'Brasil',
    "principal" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "usuario_id" TEXT NOT NULL,

    CONSTRAINT "enderecos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "preco" DECIMAL(10,2) NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 0,
    "status" "StatusProduto" NOT NULL DEFAULT 'ATIVO',
    "categoria" "CategoriaProduto" NOT NULL,
    "sku" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imagens_produto" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "principal" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "produto_id" TEXT NOT NULL,

    CONSTRAINT "imagens_produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendas" (
    "id" TEXT NOT NULL,
    "numero_venda" TEXT NOT NULL,
    "status" "StatusVenda" NOT NULL DEFAULT 'PENDENTE',
    "subtotal" DECIMAL(10,2) NOT NULL,
    "desconto" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "forma_pagamento" "FormaPagamento" NOT NULL,
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "finalizada_em" TIMESTAMP(3),
    "cancelada_em" TIMESTAMP(3),
    "usuario_id" TEXT NOT NULL,

    CONSTRAINT "vendas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_venda" (
    "id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "preco_unitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "desconto" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "tipo_venda" "TipoVenda" NOT NULL DEFAULT 'VAREJO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "venda_id" TEXT NOT NULL,
    "produto_id" TEXT NOT NULL,

    CONSTRAINT "itens_venda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacoes" (
    "id" TEXT NOT NULL,
    "tipo" "TipoNotificacao" NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_id" TEXT NOT NULL,

    CONSTRAINT "notificacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_cpf_key" ON "usuarios"("cpf");

-- CreateIndex
CREATE INDEX "enderecos_usuario_id_idx" ON "enderecos"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "produtos_sku_key" ON "produtos"("sku");

-- CreateIndex
CREATE INDEX "produtos_categoria_idx" ON "produtos"("categoria");

-- CreateIndex
CREATE INDEX "produtos_status_idx" ON "produtos"("status");

-- CreateIndex
CREATE INDEX "imagens_produto_produto_id_idx" ON "imagens_produto"("produto_id");

-- CreateIndex
CREATE INDEX "imagens_produto_principal_idx" ON "imagens_produto"("principal");

-- CreateIndex
CREATE UNIQUE INDEX "vendas_numero_venda_key" ON "vendas"("numero_venda");

-- CreateIndex
CREATE INDEX "vendas_usuario_id_idx" ON "vendas"("usuario_id");

-- CreateIndex
CREATE INDEX "vendas_status_idx" ON "vendas"("status");

-- CreateIndex
CREATE INDEX "vendas_created_at_idx" ON "vendas"("created_at");

-- CreateIndex
CREATE INDEX "itens_venda_venda_id_idx" ON "itens_venda"("venda_id");

-- CreateIndex
CREATE INDEX "itens_venda_produto_id_idx" ON "itens_venda"("produto_id");

-- CreateIndex
CREATE INDEX "notificacoes_usuario_id_idx" ON "notificacoes"("usuario_id");

-- CreateIndex
CREATE INDEX "notificacoes_lida_idx" ON "notificacoes"("lida");

-- CreateIndex
CREATE INDEX "notificacoes_created_at_idx" ON "notificacoes"("created_at");

-- AddForeignKey
ALTER TABLE "enderecos" ADD CONSTRAINT "enderecos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagens_produto" ADD CONSTRAINT "imagens_produto_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_venda" ADD CONSTRAINT "itens_venda_venda_id_fkey" FOREIGN KEY ("venda_id") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_venda" ADD CONSTRAINT "itens_venda_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacoes" ADD CONSTRAINT "notificacoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
