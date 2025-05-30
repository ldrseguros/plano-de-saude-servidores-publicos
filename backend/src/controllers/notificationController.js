import { ApiResponse } from "../utils/ApiResponse.js";
import {
  enviarNotificacoesAdesao,
  reenviarNotificacoesFalhadas,
  buscarHistoricoNotificacoes,
} from "../services/notificationService.js";
import { testarConfiguracaoEmail } from "../services/emailService.js";
import { testarConfiguracaoWhatsApp } from "../services/whatsappService.js";

/**
 * Busca histórico de notificações de um usuário
 */
export const getHistoricoNotificacoes = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20 } = req.query;

    const historico = await buscarHistoricoNotificacoes(
      userId,
      parseInt(limit)
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          true,
          200,
          historico,
          "Histórico de notificações recuperado com sucesso"
        )
      );
  } catch (error) {
    console.error("Erro ao buscar histórico de notificações:", error);
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, "Erro interno do servidor"));
  }
};

/**
 * Reenviar notificações que falharam para um usuário
 */
export const reenviarNotificacoes = async (req, res) => {
  try {
    const { userId } = req.params;

    const resultado = await reenviarNotificacoesFalhadas(userId);

    const statusCode = resultado.success ? 200 : 500;
    const message = resultado.success
      ? `${resultado.reenviadas} notificações reenviadas com sucesso`
      : "Erro ao reenviar notificações";

    return res
      .status(statusCode)
      .json(new ApiResponse(resultado.success, statusCode, resultado, message));
  } catch (error) {
    console.error("Erro ao reenviar notificações:", error);
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, "Erro interno do servidor"));
  }
};

/**
 * Enviar notificações manualmente para um usuário
 */
export const enviarNotificacaoManual = async (req, res) => {
  try {
    const { userId } = req.params;
    const { documentId } = req.body;

    const resultado = await enviarNotificacoesAdesao(userId, documentId);

    const statusCode = resultado.success ? 200 : 500;
    const message = resultado.success
      ? `${resultado.sucessos}/${resultado.totalEnvios} notificações enviadas com sucesso`
      : "Erro ao enviar notificações";

    return res
      .status(statusCode)
      .json(new ApiResponse(resultado.success, statusCode, resultado, message));
  } catch (error) {
    console.error("Erro ao enviar notificação manual:", error);
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, "Erro interno do servidor"));
  }
};

/**
 * Testar configurações de email
 */
export const testarEmail = async (req, res) => {
  try {
    const resultado = await testarConfiguracaoEmail();

    const statusCode = resultado.success ? 200 : 400;

    return res
      .status(statusCode)
      .json(
        new ApiResponse(
          resultado.success,
          statusCode,
          resultado,
          resultado.message || "Teste de configuração de email concluído"
        )
      );
  } catch (error) {
    console.error("Erro ao testar configuração de email:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(
          false,
          500,
          { error: error.message },
          "Erro ao testar configuração de email"
        )
      );
  }
};

/**
 * Testar configurações de WhatsApp
 */
export const testarWhatsApp = async (req, res) => {
  try {
    const resultado = await testarConfiguracaoWhatsApp();

    const statusCode = resultado.success ? 200 : 400;

    return res
      .status(statusCode)
      .json(
        new ApiResponse(
          resultado.success,
          statusCode,
          resultado,
          resultado.message || "Teste de configuração de WhatsApp concluído"
        )
      );
  } catch (error) {
    console.error("Erro ao testar configuração de WhatsApp:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(
          false,
          500,
          { error: error.message },
          "Erro ao testar configuração de WhatsApp"
        )
      );
  }
};

/**
 * Testar ambas as configurações (email e WhatsApp)
 */
export const testarConfiguracoes = async (req, res) => {
  try {
    const [resultadoEmail, resultadoWhatsApp] = await Promise.allSettled([
      testarConfiguracaoEmail(),
      testarConfiguracaoWhatsApp(),
    ]);

    const email =
      resultadoEmail.status === "fulfilled"
        ? resultadoEmail.value
        : { success: false, error: resultadoEmail.reason?.message };

    const whatsapp =
      resultadoWhatsApp.status === "fulfilled"
        ? resultadoWhatsApp.value
        : { success: false, error: resultadoWhatsApp.reason?.message };

    const todosSucessos = email.success && whatsapp.success;

    return res
      .status(200)
      .json(
        new ApiResponse(
          true,
          200,
          { email, whatsapp, todosSucessos },
          "Teste de configurações concluído"
        )
      );
  } catch (error) {
    console.error("Erro ao testar configurações:", error);
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, "Erro interno do servidor"));
  }
};
