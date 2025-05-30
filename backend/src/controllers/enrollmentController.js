import prisma from "../config/database.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { enviarNotificacoesAdesao } from "../services/notificationService.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../../uploads");
const pdfDir = path.join(uploadsDir, "pdfs");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, { recursive: true });
}

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
    const { completed, notes, stepData, signatureData } = req.body;

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
        signatureData,
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
    const { notes, stepData, signatureData } = req.body;

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
        signatureData,
      },
      create: {
        userId,
        step,
        completed: true,
        completionDate: new Date(),
        notes,
        stepData,
        signatureData,
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

      // Buscar o documento mais recente gerado para este usuário
      const ultimoDocumento = await prisma.userDocument.findFirst({
        where: {
          userId,
          type: "ENROLLMENT_PDF",
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Enviar notificações de adesão completa de forma assíncrona
      try {
        const documentId = ultimoDocumento?.id || null;
        console.log(
          `Iniciando envio de notificações para usuário ${userId} com documento ${documentId}`
        );

        // Enviar de forma assíncrona para não bloquear a resposta
        setImmediate(async () => {
          try {
            const resultadoNotificacoes = await enviarNotificacoesAdesao(
              userId,
              documentId
            );
            console.log(
              `Notificações processadas para usuário ${userId}:`,
              resultadoNotificacoes
            );
          } catch (notificationError) {
            console.error(
              `Erro ao enviar notificações para usuário ${userId}:`,
              notificationError.message
            );
          }
        });

        console.log(
          `Processo de notificações iniciado para o usuário ${userId}`
        );
      } catch (notificationError) {
        // Log do erro mas não interrompe o fluxo
        console.error(
          `Erro ao iniciar processo de notificações: ${notificationError.message}`
        );
      }
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

// Save PDF document
export const savePdfDocument = async (req, res) => {
  try {
    const { userId } = req.params;
    const { pdfData, fileName } = req.body;

    if (!pdfData || !fileName) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            false,
            400,
            null,
            "PDF data and filename are required"
          )
        );
    }

    // Verify if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res
        .status(404)
        .json(new ApiResponse(false, 404, null, "User not found"));
    }

    console.log("Recebendo PDF data length:", pdfData.length);
    console.log("Primeiros 100 caracteres:", pdfData.substring(0, 100));

    // Verificar se os dados do PDF estão válidos
    if (!pdfData.startsWith("data:application/pdf;base64,")) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            false,
            400,
            null,
            "Invalid PDF data format. Must be a base64 data URI."
          )
        );
    }

    // Extract base64 data from data URI
    const base64Data = pdfData.replace(/^data:application\/pdf;base64,/, "");

    console.log("Base64 data length após extração:", base64Data.length);

    // Verificar se a string base64 tem um tamanho mínimo razoável para um PDF
    if (base64Data.length < 1000) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            false,
            400,
            null,
            "PDF data seems too small to be valid."
          )
        );
    }

    try {
      // Tentar decodificar a string base64 para garantir que é válida
      const testBuffer = Buffer.from(base64Data, "base64");
      console.log("PDF buffer tamanho:", testBuffer.length, "bytes");

      if (testBuffer.length < 1000) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              false,
              400,
              null,
              "Decoded PDF buffer is too small to be valid."
            )
          );
      }

      // Verificar se começa com os bytes de assinatura de um PDF
      const pdfSignature = "%PDF-";
      const bufferStart = testBuffer.toString("ascii", 0, 5);
      console.log("Primeiros 5 bytes do buffer:", bufferStart);

      if (bufferStart !== pdfSignature) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              false,
              400,
              null,
              `Invalid PDF format. Does not start with PDF signature. Got: ${bufferStart}`
            )
          );
      }
    } catch (decodeError) {
      console.error("Erro ao decodificar base64:", decodeError);
      return res
        .status(400)
        .json(
          new ApiResponse(
            false,
            400,
            null,
            `Failed to decode base64 data: ${decodeError.message}`
          )
        );
    }

    // Create safe filename
    const safeFileName = fileName.replace(/[^a-z0-9.-]/gi, "_");
    const filePath = path.join(pdfDir, safeFileName);

    // Save file using buffer para garantir integridade
    const pdfBuffer = Buffer.from(base64Data, "base64");

    try {
      fs.writeFileSync(filePath, pdfBuffer);
      console.log(`Arquivo salvo em ${filePath} com ${pdfBuffer.length} bytes`);
    } catch (writeError) {
      console.error("Erro ao escrever arquivo:", writeError);
      return res
        .status(500)
        .json(
          new ApiResponse(
            false,
            500,
            null,
            `Failed to write PDF file: ${writeError.message}`
          )
        );
    }

    // Verificar se o arquivo foi salvo corretamente
    if (!fs.existsSync(filePath)) {
      return res
        .status(500)
        .json(
          new ApiResponse(
            false,
            500,
            null,
            "Failed to save PDF to disk. File does not exist after save attempt."
          )
        );
    }

    // Verificar tamanho do arquivo salvo
    const fileStats = fs.statSync(filePath);
    console.log("Arquivo salvo tamanho:", fileStats.size, "bytes");

    if (fileStats.size < 1000) {
      return res
        .status(500)
        .json(
          new ApiResponse(
            false,
            500,
            null,
            `Saved PDF file is too small (${fileStats.size} bytes), might be corrupted.`
          )
        );
    }

    // Save file reference in database
    const document = await prisma.userDocument.create({
      data: {
        userId,
        type: "ENROLLMENT_PDF",
        name: fileName,
        path: filePath,
        mimeType: "application/pdf",
        size: pdfBuffer.length,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        type: "DOCUMENT_CREATED",
        description: `Enrollment PDF created: ${fileName}`,
        details: {
          documentId: document.id,
          fileName,
          fileSize: pdfBuffer.length,
        },
      },
    });

    return res.status(201).json(
      new ApiResponse(
        true,
        201,
        {
          documentId: document.id,
          filePath,
          fileSize: pdfBuffer.length,
          fileName,
        },
        "PDF saved successfully"
      )
    );
  } catch (error) {
    console.error("Error saving PDF document:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(
          false,
          500,
          null,
          `Internal Server Error: ${error.message}`
        )
      );
  }
};

// Get user documents
export const getUserDocuments = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return res
        .status(404)
        .json(new ApiResponse(false, 404, null, "User not found"));
    }

    // Get all documents for the user
    const documents = await prisma.userDocument.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          true,
          200,
          documents,
          "User documents retrieved successfully"
        )
      );
  } catch (error) {
    console.error("Error getting user documents:", error);
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, "Internal Server Error"));
  }
};

// Diagnóstico de documentos
export const getDocumentDiagnostics = async (req, res) => {
  try {
    const { documentId } = req.params;

    // Encontrar o documento
    const document = await prisma.userDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return res
        .status(404)
        .json(new ApiResponse(false, 404, null, "Documento não encontrado"));
    }

    // Verificar informações do arquivo
    let fileInfo = {
      exists: false,
      size: 0,
      stats: null,
      directory: pdfDir,
      fullPath: document.path,
      canRead: false,
    };

    if (fs.existsSync(document.path)) {
      fileInfo.exists = true;

      try {
        const stats = fs.statSync(document.path);
        fileInfo.stats = {
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime,
          isFile: stats.isFile(),
          isDirectory: stats.isDirectory(),
        };
        fileInfo.size = stats.size;

        // Verificar permissão de leitura
        try {
          fs.accessSync(document.path, fs.constants.R_OK);
          fileInfo.canRead = true;
        } catch (err) {
          fileInfo.canRead = false;
        }
      } catch (statError) {
        fileInfo.statError = statError.message;
      }
    }

    // Verificar diretório de uploads
    const directoryInfo = {
      exists: fs.existsSync(pdfDir),
      path: pdfDir,
      files: [],
    };

    if (directoryInfo.exists) {
      try {
        directoryInfo.files = fs.readdirSync(pdfDir).slice(0, 10); // Listar até 10 arquivos
      } catch (err) {
        directoryInfo.readError = err.message;
      }
    }

    return res.status(200).json(
      new ApiResponse(
        true,
        200,
        {
          document,
          fileInfo,
          directoryInfo,
        },
        "Diagnóstico de documento concluído"
      )
    );
  } catch (error) {
    console.error("Erro ao realizar diagnóstico:", error);
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, "Erro interno do servidor"));
  }
};

// Download a document
export const downloadDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    console.log(`Tentando baixar documento com ID: ${documentId}`);

    // Find the document
    const document = await prisma.userDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      console.log(`Documento não encontrado: ${documentId}`);
      return res
        .status(404)
        .json(new ApiResponse(false, 404, null, "Document not found"));
    }

    console.log(
      `Documento encontrado: ${document.name}, caminho: ${document.path}`
    );

    // Check if file exists
    if (!fs.existsSync(document.path)) {
      console.log(`Arquivo não existe no caminho: ${document.path}`);
      return res
        .status(404)
        .json(new ApiResponse(false, 404, null, "Document file not found"));
    }

    // Get file stats
    const stats = fs.statSync(document.path);
    console.log(`Tamanho do arquivo: ${stats.size} bytes`);

    if (stats.size < 100) {
      console.log(
        `Arquivo parece estar corrompido (muito pequeno): ${stats.size} bytes`
      );
      return res
        .status(500)
        .json(
          new ApiResponse(
            false,
            500,
            null,
            "Document file appears to be corrupted (too small)"
          )
        );
    }

    try {
      // Tentar ler os primeiros bytes para verificar se é um PDF válido
      const fileHeader = Buffer.alloc(5);
      const fd = fs.openSync(document.path, "r");
      fs.readSync(fd, fileHeader, 0, 5, 0);
      fs.closeSync(fd);

      const pdfSignature = "%PDF-";
      const headerStr = fileHeader.toString("ascii");
      console.log(`Cabeçalho do arquivo: "${headerStr}"`);

      if (headerStr !== pdfSignature) {
        console.log(`Arquivo não é um PDF válido. Cabeçalho: "${headerStr}"`);
        return res
          .status(500)
          .json(
            new ApiResponse(
              false,
              500,
              null,
              `Document is not a valid PDF. Header: "${headerStr}"`
            )
          );
      }
    } catch (readError) {
      console.error("Erro ao verificar cabeçalho do arquivo:", readError);
    }

    // Verificar permissões de leitura
    try {
      fs.accessSync(document.path, fs.constants.R_OK);
    } catch (accessError) {
      console.log(`Sem permissão para ler o arquivo: ${accessError.message}`);
      return res
        .status(500)
        .json(
          new ApiResponse(
            false,
            500,
            null,
            `No permission to read document file: ${accessError.message}`
          )
        );
    }

    // Ler o arquivo em memória
    try {
      console.log("Lendo arquivo em memória...");
      const fileBuffer = fs.readFileSync(document.path);
      console.log(`Arquivo lido com sucesso: ${fileBuffer.length} bytes`);

      // Adicionar cabeçalhos CORS específicos para arquivos
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Content-Disposition"
      );
      res.setHeader(
        "Access-Control-Expose-Headers",
        "Content-Disposition, Content-Type"
      );

      // Definir MIME type correto para PDF
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Length", fileBuffer.length);

      // Modificar para "attachment" para forçar download em vez de visualização no navegador
      // res.setHeader(
      //   "Content-Disposition",
      //   `inline; filename="${document.name}"`
      // );

      // Usando "attachment" para forçar download - se continuar com problemas, tente descomentando esta linha
      // e comentando a inline acima
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${document.name}"`
      );

      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");

      // Adicionar log para verificar cabeçalhos de resposta
      console.log("Cabeçalhos da resposta:", res._headers);

      // Enviar buffer diretamente
      return res.send(fileBuffer);
    } catch (readError) {
      console.error("Erro ao ler arquivo:", readError);
      return res
        .status(500)
        .json(
          new ApiResponse(
            false,
            500,
            null,
            `Error reading document file: ${readError.message}`
          )
        );
    }
  } catch (error) {
    console.error("Error downloading document:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(
          false,
          500,
          null,
          `Internal Server Error: ${error.message}`
        )
      );
  }
};
