import prisma from "../config/database.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Create dependent with userId in body (for frontend compatibility)
export const createDependentFromBody = async (req, res) => {
  try {
    const { userId, name, cpf, birthDate, relationship, planType } = req.body;

    // Validate required fields
    if (!userId || !name || !birthDate || !relationship) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            false,
            400,
            {},
            "UserId, name, birth date, and relationship are required"
          )
        );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res
        .status(404)
        .json(new ApiResponse(false, 404, null, "User not found"));
    }

    // Create dependent
    const dependent = await prisma.dependent.create({
      data: {
        name,
        cpf,
        birthDate: new Date(birthDate),
        relationship,
        planType,
        userId,
      },
    });

    // Update user's last activity
    await prisma.user.update({
      where: { id: userId },
      data: { lastActivityDate: new Date() },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId,
        type: "UPDATE",
        description: `Dependent ${name} added`,
        details: {
          dependentId: dependent.id,
          dependentName: name,
          relationship,
        },
      },
    });

    return res
      .status(201)
      .json(
        new ApiResponse(true, 201, dependent, "Dependent added successfully")
      );
  } catch (error) {
    console.error("Error adding dependent:", error);
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, "Internal Server Error"));
  }
};

// Add dependent to user
export const addDependent = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, cpf, birthDate, relationship, planType } = req.body;

    // Validate required fields
    if (!name || !birthDate || !relationship) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            false,
            400,
            {},
            "Name, birth date, and relationship are required"
          )
        );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res
        .status(404)
        .json(new ApiResponse(false, 404, null, "User not found"));
    }

    // Create dependent
    const dependent = await prisma.dependent.create({
      data: {
        name,
        cpf,
        birthDate: new Date(birthDate),
        relationship,
        planType,
        userId,
      },
    });

    // Update user's last activity
    await prisma.user.update({
      where: { id: userId },
      data: { lastActivityDate: new Date() },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId,
        type: "UPDATE",
        description: `Dependent ${name} added`,
        details: {
          dependentId: dependent.id,
          dependentName: name,
          relationship,
        },
      },
    });

    return res
      .status(201)
      .json(
        new ApiResponse(true, 201, dependent, "Dependent added successfully")
      );
  } catch (error) {
    console.error("Error adding dependent:", error);
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, "Internal Server Error"));
  }
};

// Get user dependents
export const getUserDependents = async (req, res) => {
  try {
    const { userId } = req.params;

    const dependents = await prisma.dependent.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          true,
          200,
          dependents,
          "Dependents retrieved successfully"
        )
      );
  } catch (error) {
    console.error("Error getting dependents:", error);
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, "Internal Server Error"));
  }
};

// Update dependent
export const updateDependent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.userId;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    // Handle birthDate conversion
    if (updateData.birthDate) {
      updateData.birthDate = new Date(updateData.birthDate);
    }

    const dependent = await prisma.dependent.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    // Update user's last activity
    await prisma.user.update({
      where: { id: dependent.userId },
      data: { lastActivityDate: new Date() },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId: dependent.userId,
        type: "UPDATE",
        description: `Dependent ${dependent.name} updated`,
        details: {
          dependentId: dependent.id,
          updatedFields: Object.keys(updateData),
        },
      },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(true, 200, dependent, "Dependent updated successfully")
      );
  } catch (error) {
    console.error("Error updating dependent:", error);
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, "Internal Server Error"));
  }
};

// Delete dependent
export const deleteDependent = async (req, res) => {
  try {
    const { id } = req.params;

    // Get dependent info before deletion
    const dependent = await prisma.dependent.findUnique({
      where: { id },
      select: { userId: true, name: true },
    });

    if (!dependent) {
      return res
        .status(404)
        .json(new ApiResponse(false, 404, null, "Dependent not found"));
    }

    await prisma.dependent.delete({
      where: { id },
    });

    // Update user's last activity
    await prisma.user.update({
      where: { id: dependent.userId },
      data: { lastActivityDate: new Date() },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId: dependent.userId,
        type: "UPDATE",
        description: `Dependent ${dependent.name} removed`,
        details: {
          dependentId: id,
          dependentName: dependent.name,
        },
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(true, 200, null, "Dependent deleted successfully"));
  } catch (error) {
    console.error("Error deleting dependent:", error);
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, "Internal Server Error"));
  }
};

// Bulk update/create dependents for a user
export const updateDependents = async (req, res) => {
  try {
    const { userId } = req.params;
    const { dependents } = req.body;

    if (!Array.isArray(dependents)) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            false,
            400,
            null,
            "The dependents field must be an array"
          )
        );
    }

    console.log(
      `Recebido pedido para atualizar ${dependents.length} dependentes para o usuário ${userId}`
    );

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res
        .status(404)
        .json(new ApiResponse(false, 404, null, "User not found"));
    }

    // Get existing dependents
    const existingDependents = await prisma.dependent.findMany({
      where: { userId },
    });

    console.log(
      `Usuário tem ${existingDependents.length} dependentes existentes`
    );

    // Process each dependent in the request
    const results = [];

    for (const dependentData of dependents) {
      try {
        // Check if the dependent exists by CPF or ID
        const existingDependent = existingDependents.find(
          (d) =>
            (dependentData.id && d.id === dependentData.id) ||
            (dependentData.cpf && d.cpf === dependentData.cpf)
        );

        // Prepare data for creation/update
        const data = {
          name: dependentData.name,
          cpf: dependentData.cpf,
          birthDate: dependentData.birthDate
            ? new Date(dependentData.birthDate)
            : undefined,
          relationship: dependentData.relationship,
          planType: dependentData.planType,
          userId,
        };

        let result;

        if (existingDependent) {
          // Update existing dependent
          console.log(
            `Atualizando dependente existente: ${existingDependent.id} (${dependentData.name})`
          );

          result = await prisma.dependent.update({
            where: { id: existingDependent.id },
            data,
          });

          results.push({ action: "updated", dependent: result });
        } else {
          // Create new dependent
          console.log(`Criando novo dependente: ${dependentData.name}`);

          result = await prisma.dependent.create({
            data,
          });

          results.push({ action: "created", dependent: result });
        }
      } catch (error) {
        console.error(
          `Erro ao processar dependente: ${dependentData.name}`,
          error
        );
        results.push({
          action: "error",
          dependent: dependentData,
          error: error.message,
        });
      }
    }

    // Remove dependents that are not in the request
    if (req.query.replaceAll === "true") {
      console.log(
        "Modo replaceAll ativado - removendo dependentes não incluídos na solicitação"
      );

      const dependentIdsInRequest = dependents
        .map((d) => d.id)
        .filter((id) => id); // Filter out undefined ids

      const dependentCpfsInRequest = dependents
        .map((d) => d.cpf)
        .filter((cpf) => cpf); // Filter out undefined cpfs

      const dependentsToRemove = existingDependents.filter(
        (d) =>
          !dependentIdsInRequest.includes(d.id) &&
          !dependentCpfsInRequest.includes(d.cpf)
      );

      for (const dependent of dependentsToRemove) {
        console.log(
          `Removendo dependente não incluído na solicitação: ${dependent.id} (${dependent.name})`
        );

        await prisma.dependent.delete({
          where: { id: dependent.id },
        });

        results.push({
          action: "deleted",
          dependent: { id: dependent.id, name: dependent.name },
        });
      }
    }

    // Update user's last activity
    await prisma.user.update({
      where: { id: userId },
      data: { lastActivityDate: new Date() },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId,
        type: "UPDATE",
        description: `Bulk update of ${results.length} dependents`,
        details: {
          created: results.filter((r) => r.action === "created").length,
          updated: results.filter((r) => r.action === "updated").length,
          deleted: results.filter((r) => r.action === "deleted").length,
          errors: results.filter((r) => r.action === "error").length,
        },
      },
    });

    return res.status(200).json(
      new ApiResponse(
        true,
        200,
        {
          results,
          summary: {
            total: results.length,
            created: results.filter((r) => r.action === "created").length,
            updated: results.filter((r) => r.action === "updated").length,
            deleted: results.filter((r) => r.action === "deleted").length,
            errors: results.filter((r) => r.action === "error").length,
          },
        },
        "Dependents processed successfully"
      )
    );
  } catch (error) {
    console.error("Error in bulk update of dependents:", error);
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, "Internal Server Error"));
  }
};
