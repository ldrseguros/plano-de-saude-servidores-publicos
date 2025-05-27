import { PrismaClient } from "./generated/prisma/index.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function testLogin() {
  try {
    console.log("Testando login manualmente...");

    const username = "admin";
    const password = "admin123";

    console.log(`Tentando login com: ${username} / ${password}`);

    // Verificar se o admin existe
    const admin = await prisma.adminUser.findFirst({
      where: {
        OR: [{ username: username }, { email: username }],
        isActive: true,
      },
    });

    if (!admin) {
      console.error("❌ Usuário não encontrado!");
      return;
    }

    console.log("✅ Usuário encontrado no banco:");
    console.log({
      id: admin.id,
      username: admin.username,
      email: admin.email,
      passwordHash: admin.password
        ? admin.password.substring(0, 20) + "..."
        : "undefined",
      isActive: admin.isActive,
    });

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (isPasswordValid) {
      console.log("✅ Senha válida! Login bem-sucedido!");
    } else {
      console.error("❌ Senha inválida!");

      // Debugar problema de hash
      console.log("\nInformações para diagnóstico:");
      console.log(`Senha fornecida: ${password}`);
      console.log(`Hash armazenado: ${admin.password}`);

      // Testar criação de nova hash com a mesma senha
      const newHash = await bcrypt.hash(password, 12);
      console.log(`Nova hash com mesma senha: ${newHash}`);
      console.log(
        `Comparação nova hash com armazenada: ${await bcrypt.compare(
          password,
          admin.password
        )}`
      );
    }
  } catch (error) {
    console.error("Erro durante teste de login:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
