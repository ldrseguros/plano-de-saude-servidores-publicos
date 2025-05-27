import { PrismaClient } from "./generated/prisma/index.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function resetAdmin() {
  try {
    console.log("Iniciando reset do usuário admin...");

    // Verificar se o admin existe
    const existingAdmin = await prisma.adminUser.findFirst({
      where: {
        username: "admin",
      },
    });

    if (existingAdmin) {
      console.log(`Admin encontrado com ID: ${existingAdmin.id}`);

      // Hash nova senha
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash("admin123", saltRounds);

      // Atualizar senha
      const updatedAdmin = await prisma.adminUser.update({
        where: { id: existingAdmin.id },
        data: { password: hashedPassword },
      });

      console.log(
        `Senha do admin atualizada com sucesso. Nova senha: admin123`
      );
    } else {
      // Criar novo admin
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash("admin123", saltRounds);

      const newAdmin = await prisma.adminUser.create({
        data: {
          username: "admin",
          email: "admin@brasilsaude.com",
          password: hashedPassword,
          name: "Administrador",
          role: "admin",
          isActive: true,
        },
      });

      console.log(`Novo admin criado com ID: ${newAdmin.id}. Senha: admin123`);
    }

    console.log("Operação concluída com sucesso!");
  } catch (error) {
    console.error("Erro ao resetar admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdmin();
