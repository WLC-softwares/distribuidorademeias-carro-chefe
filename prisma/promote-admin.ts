import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];

    if (!email) {
        console.error("❌ Por favor, forneça um email:");
        console.log("   npm run promote-admin -- email@example.com");
        process.exit(1);
    }

    try {
        const user = await prisma.usuario.findUnique({
            where: { email },
        });

        if (!user) {
            console.error(`❌ Usuário com email ${email} não encontrado`);
            process.exit(1);
        }

        await prisma.usuario.update({
            where: { email },
            data: { role: "ADMIN" },
        });

        console.log(`✅ Usuário ${email} promovido a ADMIN com sucesso!`);
        console.log(`   Nome: ${user.nome}`);
        console.log(`   Role: ADMIN`);
    } catch (error) {
        console.error("❌ Erro:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();

