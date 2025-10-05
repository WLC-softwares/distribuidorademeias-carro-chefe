import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de dados de teste...");

  // Hash de senha padrão (senha: "teste123")
  const passwordHash = await bcrypt.hash("teste123", 10);

  // =====================================================
  // USUÁRIOS
  // =====================================================
  console.log("👤 Criando usuários...");

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@distribuidora.com" },
    update: {},
    create: {
      name: "Admin Sistema",
      email: "admin@distribuidora.com",
      password: passwordHash,
      phone: "(11) 98765-4321",
      cpf: "12345678909",
      role: "ADMIN",
      active: true,
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: "wesley.limacosta@hotmail.com" },
    update: {},
    create: {
      name: "Wesley Lima Costa",
      email: "wesley.limacosta@hotmail.com",
      password: passwordHash,
      phone: "(11) 96166-7767",
      cpf: "43274567809",
      role: "USER",
      active: true,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "maria.silva@email.com" },
    update: {},
    create: {
      name: "Maria Silva Santos",
      email: "maria.silva@email.com",
      password: passwordHash,
      phone: "(11) 99887-7665",
      cpf: "98765432100",
      role: "USER",
      active: true,
    },
  });

  console.log("✅ Usuários criados!");

  // =====================================================
  // ENDEREÇOS
  // =====================================================
  console.log("📍 Criando endereços...");

  await prisma.address.upsert({
    where: { id: "addr-test-001" },
    update: {},
    create: {
      id: "addr-test-001",
      zipCode: "06381470",
      street: "Rua Avelino Antônio da Silva",
      number: "219",
      complement: "CASA 2",
      neighborhood: "Vila Silviânia",
      city: "Carapicuíba",
      state: "SP",
      country: "Brasil",
      primary: true,
      userId: user1.id,
    },
  });

  await prisma.address.upsert({
    where: { id: "addr-test-002" },
    update: {},
    create: {
      id: "addr-test-002",
      zipCode: "06381290",
      street: "Rua Barbosa",
      number: "25",
      neighborhood: "Jardim dos Manacás",
      city: "Carapicuíba",
      state: "SP",
      country: "Brasil",
      primary: false,
      userId: user1.id,
    },
  });

  await prisma.address.upsert({
    where: { id: "addr-test-003" },
    update: {},
    create: {
      id: "addr-test-003",
      zipCode: "01310100",
      street: "Avenida Paulista",
      number: "1578",
      complement: "Apto 502",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
      country: "Brasil",
      primary: true,
      userId: user2.id,
    },
  });

  console.log("✅ Endereços criados!");

  // =====================================================
  // PRODUTOS
  // =====================================================
  console.log("📦 Criando produtos...");

  const product1 = await prisma.product.upsert({
    where: { id: "prod-test-001" },
    update: {},
    create: {
      id: "prod-test-001",
      name: "MEIA DO HULK",
      description: "MEIA TESTE HULK",
      retailPrice: 5.0,
      wholesalePrice: 3.5,
      quantity: 100,
      weight: 0.08,
      status: "ACTIVE",
      category: "MENS_SOCKS",
      sku: "HULK-001",
      active: true,
    },
  });

  const product2 = await prisma.product.upsert({
    where: { id: "prod-test-002" },
    update: {},
    create: {
      id: "prod-test-002",
      name: "Meia Social Preta",
      description: "Meia social masculina em algodão",
      retailPrice: 12.9,
      wholesalePrice: 8.5,
      quantity: 200,
      weight: 0.06,
      status: "ACTIVE",
      category: "DRESS_SOCKS",
      sku: "SOCIAL-001",
      active: true,
    },
  });

  const product3 = await prisma.product.upsert({
    where: { id: "prod-test-003" },
    update: {},
    create: {
      id: "prod-test-003",
      name: "Meia Esportiva Branca",
      description: "Meia esportiva para corrida e treinos",
      retailPrice: 18.9,
      wholesalePrice: 12.0,
      quantity: 150,
      weight: 0.1,
      status: "ACTIVE",
      category: "SPORTS_SOCKS",
      sku: "SPORT-001",
      active: true,
    },
  });

  // Imagens dos produtos
  await prisma.productImage.upsert({
    where: { id: "img-test-001" },
    update: {},
    create: {
      id: "img-test-001",
      url: "/placeholder-product.png",
      alt: "Meia do Hulk",
      order: 0,
      primary: true,
      productId: product1.id,
    },
  });

  await prisma.productImage.upsert({
    where: { id: "img-test-002" },
    update: {},
    create: {
      id: "img-test-002",
      url: "/placeholder-product.png",
      alt: "Meia Social",
      order: 0,
      primary: true,
      productId: product2.id,
    },
  });

  await prisma.productImage.upsert({
    where: { id: "img-test-003" },
    update: {},
    create: {
      id: "img-test-003",
      url: "/placeholder-product.png",
      alt: "Meia Esportiva",
      order: 0,
      primary: true,
      productId: product3.id,
    },
  });

  console.log("✅ Produtos criados!");

  // =====================================================
  // VENDAS
  // =====================================================
  console.log("💰 Criando vendas...");

  // Venda 1 - Pendente
  const sale1 = await prisma.sale.upsert({
    where: { saleNumber: "20251004-TEST1" },
    update: {},
    create: {
      saleNumber: "20251004-TEST1",
      status: "PENDING",
      subtotal: 5.0,
      discount: 0,
      total: 5.0,
      paymentMethod: "PIX",
      notes: "Primeira venda de teste - aguardando pagamento",
      shippingZipCode: "06381470",
      shippingStreet: "Rua Avelino Antônio da Silva",
      shippingNumber: "219",
      shippingComplement: "CASA 2",
      shippingNeighborhood: "Vila Silviânia",
      shippingCity: "Carapicuíba",
      shippingState: "SP",
      shippingCountry: "Brasil",
      userId: user1.id,
    },
  });

  // Venda 2 - Paga (pronta para criar envio)
  const sale2 = await prisma.sale.upsert({
    where: { saleNumber: "20251004-TEST2" },
    update: {},
    create: {
      saleNumber: "20251004-TEST2",
      status: "PAID",
      subtotal: 25.8,
      discount: 0,
      total: 25.8,
      paymentMethod: "CREDIT_CARD",
      notes: "Venda paga - pronta para envio",
      shippingZipCode: "06381470",
      shippingStreet: "Rua Avelino Antônio da Silva",
      shippingNumber: "219",
      shippingComplement: "CASA 2",
      shippingNeighborhood: "Vila Silviânia",
      shippingCity: "Carapicuíba",
      shippingState: "SP",
      shippingCountry: "Brasil",
      userId: user1.id,
    },
  });

  // Venda 3 - Cliente 2
  const sale3 = await prisma.sale.upsert({
    where: { saleNumber: "20251004-TEST3" },
    update: {},
    create: {
      saleNumber: "20251004-TEST3",
      status: "PAID",
      subtotal: 37.8,
      discount: 0,
      total: 37.8,
      paymentMethod: "PIX",
      notes: "Pedido urgente para evento",
      shippingZipCode: "01310100",
      shippingStreet: "Avenida Paulista",
      shippingNumber: "1578",
      shippingComplement: "Apto 502",
      shippingNeighborhood: "Bela Vista",
      shippingCity: "São Paulo",
      shippingState: "SP",
      shippingCountry: "Brasil",
      userId: user2.id,
    },
  });

  console.log("✅ Vendas criadas!");

  // =====================================================
  // ITENS DAS VENDAS
  // =====================================================
  console.log("🛒 Criando itens das vendas...");

  await prisma.saleItem.upsert({
    where: { id: "item-test-001" },
    update: {},
    create: {
      id: "item-test-001",
      quantity: 1,
      unitPrice: 5.0,
      subtotal: 5.0,
      discount: 0,
      total: 5.0,
      saleType: "RETAIL",
      saleId: sale1.id,
      productId: product1.id,
    },
  });

  await prisma.saleItem.upsert({
    where: { id: "item-test-002" },
    update: {},
    create: {
      id: "item-test-002",
      quantity: 2,
      unitPrice: 12.9,
      subtotal: 25.8,
      discount: 0,
      total: 25.8,
      saleType: "RETAIL",
      saleId: sale2.id,
      productId: product2.id,
    },
  });

  await prisma.saleItem.upsert({
    where: { id: "item-test-003" },
    update: {},
    create: {
      id: "item-test-003",
      quantity: 2,
      unitPrice: 18.9,
      subtotal: 37.8,
      discount: 0,
      total: 37.8,
      saleType: "RETAIL",
      saleId: sale3.id,
      productId: product3.id,
    },
  });

  console.log("✅ Itens criados!");

  // =====================================================
  // NOTIFICAÇÕES
  // =====================================================
  console.log("🔔 Criando notificações...");

  await prisma.notification.upsert({
    where: { id: "notif-test-001" },
    update: {},
    create: {
      id: "notif-test-001",
      type: "ORDER_CREATED",
      title: "Pedido Criado",
      message: "Seu pedido #20251004-TEST1 foi criado com sucesso!",
      read: false,
      link: "/user/orders/sale-test-001",
      metadata: { saleNumber: "20251004-TEST1" },
      userId: user1.id,
    },
  });

  await prisma.notification.upsert({
    where: { id: "notif-test-002" },
    update: {},
    create: {
      id: "notif-test-002",
      type: "ORDER_PAID",
      title: "Pagamento Confirmado",
      message: "O pagamento do pedido #20251004-TEST2 foi confirmado!",
      read: false,
      link: "/user/orders/sale-test-002",
      metadata: { saleNumber: "20251004-TEST2" },
      userId: user1.id,
    },
  });

  console.log("✅ Notificações criadas!");

  // =====================================================
  // RESUMO
  // =====================================================
  console.log("\n📊 RESUMO DOS DADOS CRIADOS:");
  console.log("════════════════════════════════════════");

  const counts = await Promise.all([
    prisma.user.count(),
    prisma.address.count(),
    prisma.product.count(),
    prisma.productImage.count(),
    prisma.sale.count(),
    prisma.saleItem.count(),
    prisma.notification.count(),
  ]);

  console.log(`👤 Usuários: ${counts[0]}`);
  console.log(`📍 Endereços: ${counts[1]}`);
  console.log(`📦 Produtos: ${counts[2]}`);
  console.log(`🖼️  Imagens: ${counts[3]}`);
  console.log(`💰 Vendas: ${counts[4]}`);
  console.log(`🛒 Itens de Venda: ${counts[5]}`);
  console.log(`🔔 Notificações: ${counts[6]}`);

  console.log("\n📋 CREDENCIAIS DE ACESSO:");
  console.log("════════════════════════════════════════");
  console.log("👤 Admin:");
  console.log("   Email: admin@distribuidora.com");
  console.log("   Senha: teste123");
  console.log("\n👤 Cliente 1:");
  console.log("   Email: wesley.limacosta@hotmail.com");
  console.log("   Senha: teste123");
  console.log("\n👤 Cliente 2:");
  console.log("   Email: maria.silva@email.com");
  console.log("   Senha: teste123");

  console.log("\n🎯 PRÓXIMOS PASSOS:");
  console.log("════════════════════════════════════════");
  console.log("1. Faça login como admin");
  console.log("2. Acesse /admin/sales");
  console.log("3. Clique em 'Criar Envio' na venda #20251004-TEST2");
  console.log("4. Teste o fluxo completo de envio!");

  console.log("\n✅ Seed concluído com sucesso!\n");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao executar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
