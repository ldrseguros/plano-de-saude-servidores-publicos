import prisma from "../config/database.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Get user enrollment steps
export const getUserEnrollmentSteps = async (req, res) => {
  try {
    const { userId } = req.params;

    const steps = await prisma.userEnrollmentStep.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    // Define all possible steps
    const allSteps = [
      "PERSONAL_DATA",
      "DEPENDENTS_DATA",
      "PLAN_SELECTION",
      "DOCUMENTS",
      "PAYMENT",
      "ANALYSIS",
      "APPROVAL",
    ];

    // Create missing steps
    const existingSteps = steps.map((step) => step.step);
    const missingSteps = allSteps.filter(
      (step) => !existingSteps.includes(step)
    );

    for (const step of missingSteps) {
      await prisma.userEnrollmentStep.create({
        data: {
          userId,
          step,
          completed: false,
        },
      });
    }

    // Get updated steps
    const updatedSteps = await prisma.userEnrollmentStep.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          true,
          200,
          updatedSteps,
          "Enrollment steps retrieved successfully"
        )
      );
  } catch (error) {
    console.error("Error getting enrollment steps:", error);
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, "Internal Server Error"));
  }
};

// Update enrollment step
export const updateEnrollmentStep = async (req, res) => {
  try {
    const { userId, step } = req.params;
    const { completed, notes, stepData } = req.body;

    // Find or create the step
    let enrollmentStep = await prisma.userEnrollmentStep.findUnique({
      where: {
        userId_step: {
          userId,
          step,
        },
      },
    });

    if (!enrollmentStep) {
      enrollmentStep = await prisma.userEnrollmentStep.create({
        data: {
          userId,
          step,
          completed: false,
        },
      });
    }

    // Update the step
    const updatedStep = await prisma.userEnrollmentStep.update({
      where: {
        userId_step: {
          userId,
          step,
        },
      },
      data: {
        completed:
          completed !== undefined ? completed : enrollmentStep.completed,
        completionDate: completed ? new Date() : enrollmentStep.completionDate,
        notes,
        stepData,
      },
    });

    // Update user's current step and last activity
    if (completed) {
      const stepOrder = [
        "PERSONAL_DATA",
        "DEPENDENTS_DATA",
        "PLAN_SELECTION",
        "DOCUMENTS",
        "PAYMENT",
        "ANALYSIS",
        "APPROVAL",
      ];

      const currentStepIndex = stepOrder.indexOf(step);
      const nextStep = stepOrder[currentStepIndex + 1];

      // Update user status based on completion
      let newStatus = "YELLOW"; // In progress
      if (step === "APPROVAL" && completed) {
        newStatus = "GREEN"; // Completed
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          currentStep: nextStep || step,
          leadStatus: newStatus,
          lastActivityDate: new Date(),
        },
      });
    }

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId,
        type: "STEP_COMPLETED",
        description: `Step ${step} ${completed ? "completed" : "updated"}`,
        details: {
          step,
          completed,
          notes,
          stepData,
        },
      },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          true,
          200,
          updatedStep,
          "Enrollment step updated successfully"
        )
      );
  } catch (error) {
    console.error("Error updating enrollment step:", error);
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, "Internal Server Error"));
  }
};

// Complete enrollment step
export const completeEnrollmentStep = async (req, res) => {
  try {
    const { userId, step } = req.params;
    const { notes, stepData } = req.body;

    console.log(`Completando etapa ${step} para o usuário ${userId}`);

    // Update the step as completed
    const updatedStep = await prisma.userEnrollmentStep.upsert({
      where: {
        userId_step: {
          userId,
          step,
        },
      },
      update: {
        completed: true,
        completionDate: new Date(),
        notes,
        stepData,
      },
      create: {
        userId,
        step,
        completed: true,
        completionDate: new Date(),
        notes,
        stepData,
      },
    });

    // Update user progress
    const stepOrder = [
      "PERSONAL_DATA",
      "DEPENDENTS_DATA",
      "PLAN_SELECTION",
      "DOCUMENTS",
      "PAYMENT",
      "ANALYSIS",
      "APPROVAL",
    ];

    const currentStepIndex = stepOrder.indexOf(step);
    const nextStep = stepOrder[currentStepIndex + 1];

    // Determine new status
    let newStatus = "YELLOW"; // Default: In progress

    // Se a etapa atual for APPROVAL, status deve ser GREEN
    if (step === "APPROVAL") {
      newStatus = "GREEN"; // Completed successfully
      console.log(
        `Adesão finalizada com sucesso. Atualizando status para GREEN`
      );
    }
    // Se estamos na primeira etapa, status deve ser YELLOW (iniciado)
    else if (currentStepIndex === 0) {
      newStatus = "YELLOW"; // Started
      console.log(`Iniciando processo de adesão. Status: YELLOW`);
    }
    // Caso contrário, mantém YELLOW para em progresso
    else {
      console.log(
        `Processo de adesão em andamento. Status: YELLOW, Etapa: ${step}`
      );
    }

    // Obter status atual antes da atualização
    const userBefore = await prisma.user.findUnique({
      where: { id: userId },
      select: { leadStatus: true, currentStep: true },
    });

    console.log(
      `Status atual antes da atualização: ${userBefore.leadStatus}, Etapa: ${userBefore.currentStep}`
    );

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        currentStep: nextStep || step,
        leadStatus: newStatus,
        lastActivityDate: new Date(),
      },
    });

    console.log(
      `Status atualizado: ${updatedUser.leadStatus}, Nova etapa: ${updatedUser.currentStep}`
    );

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId,
        type: "STEP_COMPLETED",
        description: `Step ${step} completed, status changed from ${userBefore.leadStatus} to ${newStatus}`,
        details: {
          step,
          previousStatus: userBefore.leadStatus,
          newStatus,
          previousStep: userBefore.currentStep,
          newStep: nextStep || step,
          notes,
          stepData,
        },
      },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          true,
          200,
          { updatedStep, updatedUser },
          "Enrollment step completed successfully"
        )
      );
  } catch (error) {
    console.error("Error completing enrollment step:", error);
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, "Internal Server Error"));
  }
};

// Get enrollment progress
export const getEnrollmentProgress = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        enrollmentSteps: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!user) {
      return res
        .status(404)
        .json(new ApiResponse(false, 404, null, "User not found"));
    }

    const stepOrder = [
      "PERSONAL_DATA",
      "DEPENDENTS_DATA",
      "PLAN_SELECTION",
      "DOCUMENTS",
      "PAYMENT",
      "ANALYSIS",
      "APPROVAL",
    ];

    const completedSteps = user.enrollmentSteps.filter(
      (step) => step.completed
    ).length;
    const totalSteps = stepOrder.length;
    const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

    const progress = {
      userId,
      currentStep: user.currentStep,
      leadStatus: user.leadStatus,
      completedSteps,
      totalSteps,
      progressPercentage,
      steps: stepOrder.map((stepName) => {
        const stepData = user.enrollmentSteps.find((s) => s.step === stepName);
        return {
          step: stepName,
          completed: stepData?.completed || false,
          completionDate: stepData?.completionDate,
          notes: stepData?.notes,
          stepData: stepData?.stepData,
        };
      }),
    };

    return res
      .status(200)
      .json(
        new ApiResponse(
          true,
          200,
          progress,
          "Enrollment progress retrieved successfully"
        )
      );
  } catch (error) {
    console.error("Error getting enrollment progress:", error);
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, "Internal Server Error"));
  }
};
