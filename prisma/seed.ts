import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // Criar usuário admin
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.usuario.upsert({
    where: { email: "admin@distribuidora.com" },
    update: {},
    create: {
      nome: "Administrador",
      email: "admin@distribuidora.com",
      senha: hashedPassword,
      role: "ADMIN",
      telefone: "(11) 99999-9999",
    },
  });

  console.log("✅ Usuário admin criado:", admin.email);

  // Criar produtos de exemplo
  const produtos = await Promise.all([
    prisma.produto.create({
      data: {
        nome: "Meia Social Preta",
        descricao: "Meia social masculina preta de alta qualidade",
        preco: 15.9,
        quantidade: 100,
        categoria: "MEIAS_SOCIAIS",
        sku: "MS-001",
        imagens: {
          create: [
            {
              url: "https://via.placeholder.com/400x400?text=Meia+Social+Preta",
              alt: "Meia Social Preta",
              ordem: 0,
              principal: true,
            },
          ],
        },
      },
    }),
    prisma.produto.create({
      data: {
        nome: "Meia Esportiva Branca",
        descricao: "Meia esportiva ideal para corrida e academia",
        preco: 25.9,
        quantidade: 150,
        categoria: "MEIAS_ESPORTIVAS",
        sku: "ME-001",
        imagens: {
          create: [
            {
              url: "https://via.placeholder.com/400x400?text=Meia+Esportiva",
              alt: "Meia Esportiva Branca",
              ordem: 0,
              principal: true,
            },
          ],
        },
      },
    }),
    prisma.produto.create({
      data: {
        nome: "Meia Infantil Colorida",
        descricao: "Meia infantil com estampa divertida",
        preco: 12.9,
        quantidade: 200,
        categoria: "MEIAS_INFANTIS",
        sku: "MI-001",
        imagens: {
          create: [
            {
              url: "https://via.placeholder.com/400x400?text=Meia+Infantil",
              alt: "Meia Infantil Colorida",
              ordem: 0,
              principal: true,
            },
          ],
        },
      },
    }),
    prisma.produto.create({
      data: {
        nome: "Meia Térmica Inverno",
        descricao: "Meia térmica para dias frios",
        preco: 35.9,
        quantidade: 80,
        categoria: "MEIAS_TERMICAS",
        sku: "MT-001",
        imagens: {
          create: [
            {
              url: "https://via.placeholder.com/400x400?text=Meia+Termica",
              alt: "Meia Térmica",
              ordem: 0,
              principal: true,
            },
          ],
        },
      },
    }),
    prisma.produto.create({
      data: {
        nome: "Meia Feminina Estampada",
        descricao: "Meia feminina com estampa moderna",
        preco: 18.9,
        quantidade: 120,
        categoria: "MEIAS_FEMININAS",
        sku: "MF-001",
        imagens: {
          create: [
            {
              url: "https://via.placeholder.com/400x400?text=Meia+Feminina",
              alt: "Meia Feminina Estampada",
              ordem: 0,
              principal: true,
            },
          ],
        },
      },
    }),
    prisma.produto.create({
      data: {
        nome: "Meia Masculina Listrada",
        descricao: "Meia masculina com listras modernas",
        preco: 16.9,
        quantidade: 90,
        categoria: "MEIAS_MASCULINAS",
        sku: "MM-001",
        imagens: {
          create: [
            {
              url: "https://via.placeholder.com/400x400?text=Meia+Masculina",
              alt: "Meia Masculina Listrada",
              ordem: 0,
              principal: true,
            },
          ],
        },
      },
    }),
  ]);

  console.log(`✅ ${produtos.length} produtos criados`);

  // Criar endereço para o admin
  const endereco = await prisma.endereco.create({
    data: {
      usuarioId: admin.id,
      cep: "01310-100",
      logradouro: "Av. Paulista",
      numero: "1000",
      bairro: "Bela Vista",
      cidade: "São Paulo",
      estado: "SP",
      principal: true,
    },
  });

  console.log("✅ Endereço criado para admin");

  console.log("🎉 Seed concluído!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
