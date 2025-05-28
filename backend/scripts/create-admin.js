import bcrypt from "bcryptjs";
import prisma from "../src/config/database.js";

async function createAdminUser() {
  try {
    const username = "admin";
    const email = "admin@brasilsaude.com";
    const password = "brasil123";
    const name = "Admin User";
    const role = "admin";

    // Check if admin already exists
    const existingAdmin = await prisma.adminUser.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingAdmin) {
      console.log("Admin user already exists:", {
        id: existingAdmin.id,
        username: existingAdmin.username,
        email: existingAdmin.email,
      });
      await prisma.$disconnect();
      return;
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log("Password hash generated:", hashedPassword);

    // Create new admin user
    const newAdmin = await prisma.adminUser.create({
      data: {
        username,
        email,
        password: hashedPassword,
        name,
        role,
      },
    });

    console.log("Admin user created successfully:", {
      id: newAdmin.id,
      username: newAdmin.username,
      email: newAdmin.email,
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
