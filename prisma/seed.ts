import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@distribuidora.com" },
    update: {},
    create: {
      name: "Administrator",
      email: "admin@distribuidora.com",
      password: hashedPassword,
      role: "ADMIN",
      phone: "(11) 99999-9999",
    },
  });

  console.log("✅ Admin user created:", admin.email);

  // Create sample products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "Black Dress Socks",
        description: "High quality black dress socks for men",
        retailPrice: 15.9,
        wholesalePrice: 12.9,
        quantity: 100,
        category: "DRESS_SOCKS",
        sku: "DS-001",
        images: {
          create: [
            {
              url: "https://via.placeholder.com/400x400?text=Black+Dress+Socks",
              alt: "Black Dress Socks",
              order: 0,
              primary: true,
            },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: "White Sports Socks",
        description: "Sports socks ideal for running and gym",
        retailPrice: 25.9,
        wholesalePrice: 20.9,
        quantity: 150,
        category: "SPORTS_SOCKS",
        sku: "SS-001",
        images: {
          create: [
            {
              url: "https://via.placeholder.com/400x400?text=Sports+Socks",
              alt: "White Sports Socks",
              order: 0,
              primary: true,
            },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: "Colorful Kids Socks",
        description: "Kids socks with fun print",
        retailPrice: 12.9,
        wholesalePrice: 9.9,
        quantity: 200,
        category: "KIDS_SOCKS",
        sku: "KS-001",
        images: {
          create: [
            {
              url: "https://via.placeholder.com/400x400?text=Kids+Socks",
              alt: "Colorful Kids Socks",
              order: 0,
              primary: true,
            },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: "Thermal Winter Socks",
        description: "Thermal socks for cold days",
        retailPrice: 35.9,
        wholesalePrice: 28.9,
        quantity: 80,
        category: "THERMAL_SOCKS",
        sku: "TS-001",
        images: {
          create: [
            {
              url: "https://via.placeholder.com/400x400?text=Thermal+Socks",
              alt: "Thermal Socks",
              order: 0,
              primary: true,
            },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: "Patterned Women's Socks",
        description: "Women's socks with modern pattern",
        retailPrice: 18.9,
        wholesalePrice: 14.9,
        quantity: 120,
        category: "WOMENS_SOCKS",
        sku: "WS-001",
        images: {
          create: [
            {
              url: "https://via.placeholder.com/400x400?text=Womens+Socks",
              alt: "Patterned Women's Socks",
              order: 0,
              primary: true,
            },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: "Striped Men's Socks",
        description: "Men's socks with modern stripes",
        retailPrice: 16.9,
        wholesalePrice: 13.9,
        quantity: 90,
        category: "MENS_SOCKS",
        sku: "MS-001",
        images: {
          create: [
            {
              url: "https://via.placeholder.com/400x400?text=Mens+Socks",
              alt: "Striped Men's Socks",
              order: 0,
              primary: true,
            },
          ],
        },
      },
    }),
  ]);

  console.log(`✅ ${products.length} products created`);

  // Create address for admin
  const address = await prisma.address.create({
    data: {
      userId: admin.id,
      zipCode: "01310-100",
      street: "Av. Paulista",
      number: "1000",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
      primary: true,
    },
  });

  console.log("✅ Address created for admin");

  console.log("🎉 Seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Error in seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
