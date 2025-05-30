import prisma from "../config/database.js";
import { enviarEmailAdesao } from "./emailService.js";
import { enviarWhatsAppAdesao } from "./whatsappService.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Formata um valor para apresentação em moeda (R$)
 * @param {number|string} valor - Valor a ser formatado
 * @returns {string} Valor formatado
 */
const formatarValor = (valor) => {
  if (!valor) return "R$ 0,00";

  if (typeof valor === "string") {
    // Se já for uma string formatada, retorna diretamente
    if (valor.includes("R$")) return valor;

    // Tenta converter para número
    valor = parseFloat(valor.replace(/[^\d,.-]/g, "").replace(",", "."));
  }

  if (isNaN(valor)) return "R$ 0,00";

  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

/**
 * Formata uma data para o formato brasileiro
 * @param {Date|string} data - Data a ser formatada
 * @returns {string} Data formatada (DD/MM/AAAA)
 */
const formatarData = (data) => {
  const dataObj = data instanceof Date ? data : new Date(data);
  return dataObj.toLocaleDateString("pt-BR");
};

/**
 * Extrai informações do plano dos dados do usuário
 * @param {Object} usuario - Dados do usuário com dependentes
 * @returns {Object} Dados do plano extraídos
 */
const extrairDadosPlano = (usuario) => {
  const dadosDefault = {
    nome: "Plano não especificado",
    valorTitular: "R$ 0,00",
    valorDependentes: "R$ 0,00",
    valorTotal: "R$ 0,00",
    quantidadeDependentes: 0,
    odontologico: false,
  };

  if (!usuario) return dadosDefault;

  try {
    // Mapeamento dos tipos de plano
    const planosInfo = {
      WARD: { nome: "Plano Enfermaria", preco: 169 },
      PRIVATE_ROOM: { nome: "Plano Apartamento", preco: 211 },
      DENTAL: { nome: "Plano Odontológico", preco: 25 },
    };

    const planoInfo = planosInfo[usuario.planType] || planosInfo.WARD;
    const odontologico = usuario.hasOdontologico || false;
    const quantidadeDependentes = usuario.dependents?.length || 0;

    // Calcular valores
    const valorPlano = planoInfo.preco;
    const valorOdonto = odontologico ? 25 : 0;
    const valorTitular = valorPlano + valorOdonto;
    const valorDependentes = quantidadeDependentes * valorTitular;
    const valorTotal = valorTitular + valorDependentes;

    // Montar nome do plano completo
    let nomePlano = planoInfo.nome;
    if (odontologico && usuario.planType !== "DENTAL") {
      nomePlano += " + Odontológico";
    }

    return {
      nome: nomePlano,
      valorTitular: formatarValor(valorTitular),
      valorDependentes: formatarValor(valorDependentes),
      valorTotal: formatarValor(valorTotal),
      quantidadeDependentes,
      odontologico,
      detalhes: {
        planoBase: planoInfo.nome,
        precoBase: valorPlano,
        adicionalOdonto: valorOdonto,
        dependentes:
          usuario.dependents?.map((dep) => ({
            nome: dep.name,
            parentesco: dep.relationship,
          })) || [],
      },
    };
  } catch (error) {
    console.warn("Erro ao extrair dados do plano:", error);
    return dadosDefault;
  }
};

/**
 * Envia notificações de nova adesão (email e WhatsApp)
 * @param {string} userId - ID do usuário
 * @param {string} [documentId] - ID do documento PDF (opcional)
 * @returns {Promise<Object>} Resultado do envio
 */
export const enviarNotificacoesAdesao = async (userId, documentId = null) => {
  try {
    console.log(`Iniciando envio de notificações para usuário ${userId}`);

    // Buscar informações do usuário e do plano selecionado
    const usuario = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        dependents: true,
        enrollmentSteps: {
          where: { step: "PLAN_SELECTION" },
        },
      },
    });

    if (!usuario) {
      throw new Error(`Usuário não encontrado: ${userId}`);
    }

    console.log(`Usuário encontrado: ${usuario.name}`);

    // Buscar documento (PDF) se tiver ID
    let pdfBuffer = null;
    let pdfUrl = null;

    if (documentId) {
      try {
        const documento = await prisma.userDocument.findUnique({
          where: { id: documentId },
        });

        if (documento) {
          console.log(`Documento encontrado: ${documento.name}`);

          try {
            // Lê o arquivo como buffer para anexar no email
            pdfBuffer = await fs.readFile(documento.path);
            console.log(`PDF lido com sucesso: ${pdfBuffer.length} bytes`);

            // URL para acesso ao documento
            pdfUrl = `${
              process.env.BASE_URL || "http://localhost:3001"
            }/api/enrollment/documents/${documentId}/download`;
          } catch (readError) {
            console.warn(
              `Não foi possível ler o arquivo PDF: ${readError.message}`
            );
          }
        }
      } catch (docError) {
        console.warn(`Erro ao buscar documento: ${docError.message}`);
      }
    }

    // Extrair dados do plano selecionado
    let dadosPlano = extrairDadosPlano(usuario);

    console.log(`Dados do plano extraídos:`, dadosPlano);

    // Preparar dados para envio das notificações
    const adesaoData = {
      nome: usuario.name,
      email: usuario.email,
      telefone: usuario.phone || "Não informado",
      plano: dadosPlano.nome,
      valor: dadosPlano.valorTotal,
      data: formatarData(new Date()),
      pdfUrl: pdfUrl,
      dadosPlano: dadosPlano,
    };

    console.log(`Dados preparados para notificação:`, adesaoData);

    // Criar logs de notificação no banco de dados
    const logEmail = await prisma.notificationLog.create({
      data: {
        userId,
        type: "EMAIL",
        status: "PENDING",
        message: "Nova adesão realizada",
        data: adesaoData,
      },
    });

    const logWhatsapp = await prisma.notificationLog.create({
      data: {
        userId,
        type: "WHATSAPP",
        status: "PENDING",
        message: "Nova adesão realizada",
        data: adesaoData,
      },
    });

    console.log(
      `Logs de notificação criados - Email: ${logEmail.id}, WhatsApp: ${logWhatsapp.id}`
    );

    // Enviar notificações de forma assíncrona
    const resultados = await Promise.allSettled([
      // Email
      enviarEmailAdesao(adesaoData, pdfBuffer)
        .then(async (result) => {
          await prisma.notificationLog.update({
            where: { id: logEmail.id },
            data: {
              status: "SENT",
              responseData: result,
            },
          });
          console.log("Email enviado com sucesso:", result);
          return { tipo: "email", success: true, ...result };
        })
        .catch(async (error) => {
          await prisma.notificationLog.update({
            where: { id: logEmail.id },
            data: {
              status: "ERROR",
              responseData: { error: error.message },
            },
          });
          console.error("Erro ao enviar email:", error);
          return { tipo: "email", success: false, error: error.message };
        }),

      // WhatsApp
      enviarWhatsAppAdesao(adesaoData)
        .then(async (result) => {
          await prisma.notificationLog.update({
            where: { id: logWhatsapp.id },
            data: {
              status: "SENT",
              responseData: result,
            },
          });
          console.log("WhatsApp enviado com sucesso:", result);
          return { tipo: "whatsapp", success: true, ...result };
        })
        .catch(async (error) => {
          await prisma.notificationLog.update({
            where: { id: logWhatsapp.id },
            data: {
              status: "ERROR",
              responseData: { error: error.message },
            },
          });
          console.error("Erro ao enviar WhatsApp:", error);
          return { tipo: "whatsapp", success: false, error: error.message };
        }),
    ]);

    // Processar resultados
    const resultadosProcessados = resultados.map((resultado, index) => {
      const tipo = index === 0 ? "email" : "whatsapp";

      if (resultado.status === "fulfilled") {
        return resultado.value;
      } else {
        return {
          tipo,
          success: false,
          error: resultado.reason?.message || "Erro desconhecido",
        };
      }
    });

    const sucessos = resultadosProcessados.filter((r) => r.success).length;
    const totalEnvios = resultadosProcessados.length;

    console.log(
      `Notificações processadas: ${sucessos}/${totalEnvios} enviadas com sucesso`
    );

    return {
      success: sucessos > 0,
      totalEnvios,
      sucessos,
      falhas: totalEnvios - sucessos,
      resultados: resultadosProcessados,
      logs: {
        email: logEmail.id,
        whatsapp: logWhatsapp.id,
      },
    };
  } catch (error) {
    console.error("Erro ao enviar notificações de adesão:", error);
    throw error;
  }
};

/**
 * Reenviar notificações que falharam
 * @param {string} userId - ID do usuário
 * @returns {Promise<Object>} Resultado do reenvio
 */
export const reenviarNotificacoesFalhadas = async (userId) => {
  try {
    // Buscar notificações com erro para este usuário
    const notificacoesFalhadas = await prisma.notificationLog.findMany({
      where: {
        userId,
        status: "ERROR",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10, // Últimas 10 tentativas com erro
    });

    if (notificacoesFalhadas.length === 0) {
      return {
        success: true,
        message: "Nenhuma notificação com erro encontrada",
        reenviadas: 0,
      };
    }

    console.log(
      `Encontradas ${notificacoesFalhadas.length} notificações com erro para reenvio`
    );

    const resultados = [];

    for (const notificacao of notificacoesFalhadas) {
      try {
        const adesaoData = notificacao.data;
        let resultado;

        // Marcar como tentativa de reenvio
        await prisma.notificationLog.update({
          where: { id: notificacao.id },
          data: { status: "RETRYING" },
        });

        if (notificacao.type === "EMAIL") {
          resultado = await enviarEmailAdesao(adesaoData);
        } else if (notificacao.type === "WHATSAPP") {
          resultado = await enviarWhatsAppAdesao(adesaoData);
        }

        // Marcar como enviado
        await prisma.notificationLog.update({
          where: { id: notificacao.id },
          data: {
            status: "SENT",
            responseData: resultado,
          },
        });

        resultados.push({
          id: notificacao.id,
          type: notificacao.type,
          success: true,
          resultado,
        });
      } catch (error) {
        // Marcar erro novamente
        await prisma.notificationLog.update({
          where: { id: notificacao.id },
          data: {
            status: "ERROR",
            responseData: { error: error.message, retriedAt: new Date() },
          },
        });

        resultados.push({
          id: notificacao.id,
          type: notificacao.type,
          success: false,
          error: error.message,
        });
      }
    }

    const sucessos = resultados.filter((r) => r.success).length;

    return {
      success: sucessos > 0,
      reenviadas: sucessos,
      falhas: resultados.length - sucessos,
      resultados,
    };
  } catch (error) {
    console.error("Erro ao reenviar notificações:", error);
    throw error;
  }
};

/**
 * Buscar histórico de notificações de um usuário
 * @param {string} userId - ID do usuário
 * @param {number} [limit=20] - Limite de registros
 * @returns {Promise<Array>} Histórico de notificações
 */
export const buscarHistoricoNotificacoes = async (userId, limit = 20) => {
  try {
    const notificacoes = await prisma.notificationLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return notificacoes;
  } catch (error) {
    console.error("Erro ao buscar histórico de notificações:", error);
    throw error;
  }
};
