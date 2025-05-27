import { PrismaClient } from "../generated/prisma/index.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Create sample users with different statuses
  const users = [
    {
      name: "João Silva Santos",
      email: "joao.silva@anicuns.go.gov.br",
      phone: "(64) 99999-1234",
      cpf: "123.456.789-01",
      birthDate: new Date("1985-03-15"),
      address: "Rua das Flores, 123",
      city: "Anicuns",
      state: "GO",
      zipCode: "76170-000",
      organization: "Prefeitura Municipal de Anicuns",
      position: "Servidor Público",
      employeeId: "PM001",
      leadStatus: "GREEN",
      currentStep: "APPROVAL",
    },
    {
      name: "Maria Oliveira Costa",
      email: "maria.oliveira@anicuns.go.gov.br",
      phone: "(64) 99999-5678",
      cpf: "987.654.321-02",
      birthDate: new Date("1990-07-22"),
      address: "Avenida Central, 456",
      city: "Anicuns",
      state: "GO",
      zipCode: "76170-000",
      organization: "Câmara Municipal de Anicuns",
      position: "Assessora",
      employeeId: "CM002",
      leadStatus: "YELLOW",
      currentStep: "DOCUMENTS",
    },
    {
      name: "Carlos Eduardo Ferreira",
      email: "carlos.ferreira@anicuns.go.gov.br",
      phone: "(64) 99999-9012",
      cpf: "456.789.123-03",
      birthDate: new Date("1978-11-08"),
      address: "Rua do Comércio, 789",
      city: "Anicuns",
      state: "GO",
      zipCode: "76170-000",
      organization: "Secretaria de Saúde",
      position: "Enfermeiro",
      employeeId: "SS003",
      leadStatus: "RED",
      currentStep: "PERSONAL_DATA",
    },
    {
      name: "Ana Paula Rodrigues",
      email: "ana.rodrigues@anicuns.go.gov.br",
      phone: "(64) 99999-3456",
      cpf: "789.123.456-04",
      birthDate: new Date("1982-05-30"),
      address: "Praça da Matriz, 321",
      city: "Anicuns",
      state: "GO",
      zipCode: "76170-000",
      organization: "Secretaria de Educação",
      position: "Professora",
      employeeId: "SE004",
      leadStatus: "YELLOW",
      currentStep: "PLAN_SELECTION",
    },
    {
      name: "Roberto Lima Souza",
      email: "roberto.lima@anicuns.go.gov.br",
      phone: "(64) 99999-7890",
      cpf: "321.654.987-05",
      birthDate: new Date("1975-12-12"),
      address: "Rua da Paz, 654",
      city: "Anicuns",
      state: "GO",
      zipCode: "76170-000",
      organization: "Secretaria de Obras",
      position: "Engenheiro",
      employeeId: "SO005",
      leadStatus: "GREEN",
      currentStep: "APPROVAL",
    },
  ];

  const createdUsers = [];

  for (const userData of users) {
    const user = await prisma.user.create({
      data: userData,
    });
    createdUsers.push(user);
    console.log(`✅ Created user: ${user.name}`);
  }

  // Create dependents for some users
  const dependentsData = [
    {
      userId: createdUsers[0].id,
      name: "Maria Silva Santos",
      cpf: "111.222.333-44",
      birthDate: new Date("1987-08-20"),
      relationship: "Cônjuge",
      planType: "PRIVATE_ROOM",
    },
    {
      userId: createdUsers[0].id,
      name: "Pedro Silva Santos",
      cpf: "555.666.777-88",
      birthDate: new Date("2010-04-10"),
      relationship: "Filho",
      planType: "WARD",
    },
    {
      userId: createdUsers[1].id,
      name: "José Oliveira Costa",
      cpf: "999.888.777-66",
      birthDate: new Date("1988-12-05"),
      relationship: "Cônjuge",
      planType: "PRIVATE_ROOM",
    },
    {
      userId: createdUsers[3].id,
      name: "Lucas Rodrigues Silva",
      cpf: "444.333.222-11",
      birthDate: new Date("2015-09-18"),
      relationship: "Filho",
      planType: "WARD",
    },
  ];

  for (const dependentData of dependentsData) {
    const dependent = await prisma.dependent.create({
      data: dependentData,
    });
    console.log(`✅ Created dependent: ${dependent.name}`);
  }

  // Create enrollment steps for users
  const stepOrder = [
    "PERSONAL_DATA",
    "DEPENDENTS_DATA",
    "PLAN_SELECTION",
    "DOCUMENTS",
    "PAYMENT",
    "ANALYSIS",
    "APPROVAL",
  ];

  for (const user of createdUsers) {
    const currentStepIndex = stepOrder.indexOf(user.currentStep);

    for (let i = 0; i <= currentStepIndex; i++) {
      const step = stepOrder[i];
      const completed =
        i < currentStepIndex ||
        (i === currentStepIndex && user.leadStatus === "GREEN");

      await prisma.userEnrollmentStep.create({
        data: {
          userId: user.id,
          step,
          completed,
          completionDate: completed
            ? new Date(
                Date.now() - (currentStepIndex - i) * 24 * 60 * 60 * 1000
              )
            : null,
          notes: completed ? `Step ${step} completed successfully` : null,
          stepData: {
            automated: true,
            seedData: true,
          },
        },
      });
    }
    console.log(`✅ Created enrollment steps for: ${user.name}`);
  }

  // Create activity logs
  const activityTypes = [
    "CREATION",
    "UPDATE",
    "STEP_COMPLETED",
    "DOCUMENT_SENT",
    "CONTACT_MADE",
  ];

  for (const user of createdUsers) {
    // Create initial activity log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        type: "CREATION",
        description: "Lead created in the system",
        details: {
          source: "seed",
          initialData: { name: user.name, email: user.email },
        },
      },
    });

    // Create additional activity logs based on user status
    const numActivities = Math.floor(Math.random() * 5) + 2;

    for (let i = 0; i < numActivities; i++) {
      const randomType =
        activityTypes[Math.floor(Math.random() * activityTypes.length)];
      const daysAgo = Math.floor(Math.random() * 30);

      await prisma.activityLog.create({
        data: {
          userId: user.id,
          type: randomType,
          description: `${randomType.toLowerCase().replace("_", " ")} activity`,
          details: {
            automated: true,
            seedData: true,
            randomActivity: true,
          },
          createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        },
      });
    }
    console.log(`✅ Created activity logs for: ${user.name}`);
  }

  // Create admin user
  const adminExists = await prisma.adminUser.findFirst({
    where: {
      username: "admin",
    },
  });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash("brasil123", 12);

    const admin = await prisma.adminUser.create({
      data: {
        username: "admin",
        email: "admin@brasilsaude.com",
        password: hashedPassword,
        name: "Administrador",
        role: "admin",
      },
    });

    console.log(`Created admin user with id: ${admin.id}`);
  } else {
    console.log("Admin user already exists");
  }

  console.log("🎉 Database seeding completed successfully!");
  console.log(`📊 Created ${createdUsers.length} users`);
  console.log(`👨‍👩‍👧‍👦 Created ${dependentsData.length} dependents`);
  console.log("📋 Created enrollment steps and activity logs");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
