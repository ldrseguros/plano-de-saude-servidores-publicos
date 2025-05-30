import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/database.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import config from "../config/env.js";

// Create new user/lead
export const createUser = async (req, res) => {
  const {
    name,
    email,
    phone,
    cpf,
    birthDate,
    address,
    city,
    state,
    zipCode,
    organization,
    position,
    employeeId,
  } = req.body;

  try {
    // Validate required fields
    if (!name || !email) {
      return res
        .status(400)
        .json(new ApiResponse(false, 400, {}, "Name and email are required"));
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email }, ...(cpf ? [{ cpf: cpf }] : [])],
      },
    });

    if (existingUser) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            false,
            400,
            {},
            "User with this email or CPF already exists"
          )
        );
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        cpf,
        birthDate: birthDate ? new Date(birthDate) : null,
        address,
        city,
        state,
        zipCode,
        organization,
        position,
        employeeId,
        leadStatus: "RED",
        currentStep: "PERSONAL_DATA",
      },
      include: {
        dependents: true,
        enrollmentSteps: true,
        activityLogs: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId: newUser.id,
        type: "CREATION",
        description: "Lead created in the system",
        details: {
          source: "website",
          initialData: { name, email, phone },
        },
      },
    });

    return res
      .status(201)
      .json(new ApiResponse(true, 201, newUser, "User created successfully"));
  } catch (error) {
    console.error("Error creating user:", error);
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, "Internal Server Error"));
  }
};

// Get all users/leads with filtering and pagination
export const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      step,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};

    if (status) {
      where.leadStatus = status;
    }

    if (step) {
      where.currentStep = step;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { cpf: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get users with pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          dependents: true,
          enrollmentSteps: {
            where: { completed: true },
            orderBy: { completionDate: "desc" },
          },
          activityLogs: {
            orderBy: { createdAt: "desc" },
            take: 3,
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    return res.status(200).json(
      new ApiResponse(
        true,
        200,
        {
          users,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalCount,
            hasNext: parseInt(page) < totalPages,
            hasPrev: parseInt(page) > 1,
          },
        },
        "Users retrieved successfully"
      )
    );
  } catch (error) {
    console.error("Error getting users:", error);
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, "Internal Server Error"));
  }
};

// Get single user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        dependents: true,
        enrollmentSteps: {
          orderBy: { createdAt: "asc" },
        },
        activityLogs: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!user) {
      return res
        .status(404)
        .json(new ApiResponse(false, 404, null, "User not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(true, 200, user, "User retrieved successfully"));
  } catch (error) {
    console.error("Error getting user:", error);
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, "Internal Server Error"));
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    // Remove fields that don't exist in the User model
    delete updateData.planType;
    delete updateData.hasOdontologico;

    // Handle birthDate conversion
    if (updateData.birthDate) {
      updateData.birthDate = new Date(updateData.birthDate);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        lastActivityDate: new Date(),
      },
      include: {
        dependents: true,
        enrollmentSteps: true,
        activityLogs: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId: id,
        type: "UPDATE",
        description: "User information updated",
        details: { updatedFields: Object.keys(updateData) },
      },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(true, 200, updatedUser, "User updated successfully")
      );
  } catch (error) {
    console.error("Error updating user:", error);
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, "Internal Server Error"));
  }
};

// Update user status
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { leadStatus, currentStep, notes } = req.body;

    console.log(`Atualizando status do usuário ${id}:`, {
      leadStatus,
      currentStep,
      notes,
    });

    // Garantir que o leadStatus seja um valor válido (GREEN, YELLOW, RED)
    if (leadStatus && !["GREEN", "YELLOW", "RED"].includes(leadStatus)) {
      console.error(`Status inválido fornecido: ${leadStatus}`);
      return res
        .status(400)
        .json(
          new ApiResponse(
            false,
            400,
            null,
            `Status inválido: ${leadStatus}. Use GREEN, YELLOW ou RED.`
          )
        );
    }

    // Buscar usuário antes da atualização para log
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { leadStatus: true, currentStep: true },
    });

    if (!existingUser) {
      console.error(`Usuário com ID ${id} não encontrado`);
      return res
        .status(404)
        .json(new ApiResponse(false, 404, null, "Usuário não encontrado"));
    }

    console.log(
      `Status atual do usuário: ${existingUser.leadStatus}, etapa: ${existingUser.currentStep}`
    );

    // Não permitir rebaixar um status GREEN (finalizado) para YELLOW ou RED
    let finalLeadStatus = leadStatus;
    if (
      leadStatus &&
      existingUser.leadStatus === "GREEN" &&
      (leadStatus === "YELLOW" || leadStatus === "RED")
    ) {
      console.log(
        `Tentativa de rebaixar status GREEN para ${leadStatus}. Mantendo GREEN.`
      );
      finalLeadStatus = "GREEN";
    }

    // Aplicar a atualização
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(finalLeadStatus && { leadStatus: finalLeadStatus }),
        ...(currentStep && { currentStep }),
        lastActivityDate: new Date(),
      },
      include: {
        dependents: true,
        enrollmentSteps: true,
      },
    });

    console.log(
      `Status atualizado para: ${updatedUser.leadStatus}, etapa: ${updatedUser.currentStep}`
    );

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId: id,
        type: "UPDATE",
        description: `Status updated to ${finalLeadStatus || "same"}, step: ${
          currentStep || "same"
        }`,
        details: {
          previousStatus: existingUser.leadStatus,
          newStatus: finalLeadStatus || existingUser.leadStatus,
          previousStep: existingUser.currentStep,
          newStep: currentStep || existingUser.currentStep,
          notes,
        },
      },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          true,
          200,
          updatedUser,
          "User status updated successfully"
        )
      );
  } catch (error) {
    console.error("Error updating user status:", error);
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, "Internal Server Error"));
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`Tentando excluir usuário com ID: ${id}`);

    // Primeiro, verificar se o usuário existe fora da transação
    const userExists = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!userExists) {
      console.log(`Usuário com ID ${id} não encontrado`);
      return res
        .status(404)
        .json(new ApiResponse(false, 404, null, "User not found"));
    }

    // Criar uma transação para garantir que todas as operações sejam concluídas ou nenhuma
    await prisma.$transaction(async (prismaClient) => {
      console.log("Excluindo documentos do usuário...");
      // 1. Excluir documentos do usuário
      await prismaClient.userDocument.deleteMany({
        where: { userId: id },
      });

      console.log("Excluindo etapas de adesão do usuário...");
      // 2. Excluir etapas de adesão
      await prismaClient.userEnrollmentStep.deleteMany({
        where: { userId: id },
      });

      console.log("Excluindo logs de atividade do usuário...");
      // 3. Excluir logs de atividade
      await prismaClient.activityLog.deleteMany({
        where: { userId: id },
      });

      console.log("Excluindo logs de notificação do usuário...");
      // 4. Excluir logs de notificação
      await prismaClient.notificationLog.deleteMany({
        where: { userId: id },
      });

      console.log("Excluindo dependentes do usuário...");
      // 5. Excluir dependentes
      await prismaClient.dependent.deleteMany({
        where: { userId: id },
      });

      console.log("Excluindo usuário principal...");
      // 6. Finalmente, excluir o usuário
      await prismaClient.user.delete({
        where: { id },
      });
    });

    console.log(`Usuário ${id} excluído com sucesso`);
    return res
      .status(200)
      .json(new ApiResponse(true, 200, null, "User deleted successfully"));
  } catch (error) {
    console.error("Error deleting user:", error);

    // Se for um erro específico do Prisma (P2025 = Record not found)
    if (error.code === "P2025") {
      return res
        .status(404)
        .json(new ApiResponse(false, 404, null, "User not found"));
    }

    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, "Internal Server Error"));
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalLeads,
      greenLeads,
      yellowLeads,
      redLeads,
      recentActivity,
      stepStats,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { leadStatus: "GREEN" } }),
      prisma.user.count({ where: { leadStatus: "YELLOW" } }),
      prisma.user.count({ where: { leadStatus: "RED" } }),
      prisma.activityLog.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),
      prisma.user.groupBy({
        by: ["currentStep"],
        _count: true,
      }),
    ]);

    const stats = {
      totalLeads,
      statusDistribution: {
        green: greenLeads,
        yellow: yellowLeads,
        red: redLeads,
      },
      conversionRate:
        totalLeads > 0 ? ((greenLeads / totalLeads) * 100).toFixed(2) : 0,
      recentActivity,
      stepDistribution: stepStats.reduce((acc, item) => {
        acc[item.currentStep] = item._count;
        return acc;
      }, {}),
    };

    return res
      .status(200)
      .json(
        new ApiResponse(
          true,
          200,
          stats,
          "Dashboard stats retrieved successfully"
        )
      );
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, "Internal Server Error"));
  }
};

// Search users by email or CPF
export const searchUsers = async (req, res) => {
  try {
    const { email, cpf } = req.query;

    if (!email && !cpf) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            false,
            400,
            null,
            "Email or CPF is required for search"
          )
        );
    }

    // Build search criteria
    const where = {
      OR: [],
    };

    if (email) {
      where.OR.push({ email: { equals: email, mode: "insensitive" } });
    }

    if (cpf) {
      where.OR.push({ cpf: { equals: cpf } });
    }

    // Find users matching criteria
    const users = await prisma.user.findMany({
      where,
      include: {
        dependents: true,
      },
      take: 5,
    });

    console.log(
      `Busca por usuário: ${email || cpf}, encontrados: ${users.length}`
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          true,
          200,
          users,
          `${users.length} users found matching criteria`
        )
      );
  } catch (error) {
    console.error("Error searching users:", error);
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, "Internal Server Error"));
  }
};

// Force update lead statuses (helper function for fixing inconsistencies)
export const forceUpdateLeadStatuses = async (req, res) => {
  try {
    console.log("Iniciando atualização forçada de status de leads...");

    // Obter todos os usuários
    const users = await prisma.user.findMany({
      include: {
        enrollmentSteps: true,
        dependents: true,
      },
    });

    console.log(
      `Encontrados ${users.length} usuários para atualização de status`
    );

    const updates = [];

    // Para cada usuário, determinar o status correto
    for (const user of users) {
      let newStatus = "RED"; // Padrão: não iniciou
      let changed = false;

      // Se estiver na etapa de aprovação, deve ser GREEN
      if (user.currentStep === "APPROVAL") {
        newStatus = "GREEN";
      }
      // Se tiver qualquer progresso além da etapa inicial, deve ser YELLOW
      else if (
        user.currentStep !== "PERSONAL_DATA" ||
        user.dependents.length > 0
      ) {
        newStatus = "YELLOW";
      }

      // Verificar se o status precisa ser atualizado
      if (user.leadStatus !== newStatus) {
        console.log(
          `Atualizando usuário ${user.id} (${user.name}): ${user.leadStatus} -> ${newStatus}`
        );

        // Atualizar o status
        await prisma.user.update({
          where: { id: user.id },
          data: {
            leadStatus: newStatus,
            lastActivityDate: new Date(),
          },
        });

        // Registrar a atividade
        await prisma.activityLog.create({
          data: {
            userId: user.id,
            type: "UPDATE",
            description: `Status forcefully updated from ${user.leadStatus} to ${newStatus}`,
            details: {
              reason: "Bulk status correction",
              previousStatus: user.leadStatus,
              newStatus,
              currentStep: user.currentStep,
            },
          },
        });

        updates.push({
          id: user.id,
          name: user.name,
          previousStatus: user.leadStatus,
          newStatus,
          currentStep: user.currentStep,
        });

        changed = true;
      }
    }

    return res.status(200).json(
      new ApiResponse(
        true,
        200,
        {
          totalUsers: users.length,
          updatedUsers: updates.length,
          updates,
        },
        `Updated status for ${updates.length} users`
      )
    );
  } catch (error) {
    console.error("Error updating lead statuses:", error);
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, "Internal Server Error"));
  }
};
