import axios from "axios";
import dotenv from "dotenv";

// Carrega variáveis de ambiente
dotenv.config();

/**
 * Envia uma mensagem de WhatsApp utilizando API de terceiros
 * Esta implementação usa uma API genérica e deve ser adaptada para o serviço escolhido
 * Opções populares: Twilio, MessageBird, WhatsApp Business API, etc.
 *
 * @param {Object} adesaoData - Dados da adesão
 * @param {string} adesaoData.nome - Nome do cliente
 * @param {string} adesaoData.plano - Plano contratado
 * @param {string} adesaoData.valor - Valor do plano
 * @param {string} adesaoData.data - Data da adesão
 * @returns {Promise<Object>} Resultado do envio
 */
export const enviarWhatsAppAdesao = async (adesaoData) => {
  try {
    // Número de telefone para onde enviar a notificação (setor comercial/administrativo)
    const numeroDestino =
      process.env.WHATSAPP_NUMERO_DESTINO || "+5511999999999";

    // Construir a mensagem
    const mensagem = formatarMensagem(adesaoData);

    // Configurações da API
    const apiUrl = process.env.WHATSAPP_API_URL;
    const apiKey = process.env.WHATSAPP_API_KEY;
    const apiType = process.env.WHATSAPP_API_TYPE || "generic";

    if (!apiUrl || !apiKey) {
      console.warn("Configuração de WhatsApp não encontrada. Simulando envio.");
      console.log("Mensagem que seria enviada:", mensagem);
      return {
        success: true,
        simulated: true,
        message:
          "Envio simulado com sucesso - configure WHATSAPP_API_URL e WHATSAPP_API_KEY",
        data: { mensagem, numeroDestino },
      };
    }

    let response;

    // Diferentes implementações baseadas no tipo de API configurado
    switch (apiType.toLowerCase()) {
      case "twilio":
        response = await enviarViaTwilio(
          apiUrl,
          apiKey,
          numeroDestino,
          mensagem
        );
        break;

      case "messagebird":
        response = await enviarViaMessageBird(
          apiUrl,
          apiKey,
          numeroDestino,
          mensagem
        );
        break;

      case "whatsapp-business":
        response = await enviarViaWhatsAppBusiness(
          apiUrl,
          apiKey,
          numeroDestino,
          mensagem
        );
        break;

      default:
        // API genérica
        response = await enviarViaApiGenerica(
          apiUrl,
          apiKey,
          numeroDestino,
          mensagem
        );
        break;
    }

    console.log("WhatsApp enviado com sucesso:", response.data);

    return {
      success: true,
      messageId:
        response.data.messageId || response.data.id || `whatsapp-${Date.now()}`,
      provider: apiType,
    };
  } catch (error) {
    console.error("Erro ao enviar WhatsApp de adesão:", error);
    throw error;
  }
};

/**
 * Implementação para Twilio
 */
const enviarViaTwilio = async (apiUrl, apiKey, numeroDestino, mensagem) => {
  const response = await axios.post(
    apiUrl,
    {
      To: numeroDestino,
      From: process.env.WHATSAPP_NUMERO_ORIGEM,
      Body: mensagem,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response;
};

/**
 * Implementação para MessageBird
 */
const enviarViaMessageBird = async (
  apiUrl,
  apiKey,
  numeroDestino,
  mensagem
) => {
  const response = await axios.post(
    apiUrl,
    {
      to: numeroDestino,
      from: process.env.WHATSAPP_NUMERO_ORIGEM,
      type: "text",
      content: {
        text: mensagem,
      },
    },
    {
      headers: {
        Authorization: `AccessKey ${apiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response;
};

/**
 * Implementação para WhatsApp Business API
 */
const enviarViaWhatsAppBusiness = async (
  apiUrl,
  apiKey,
  numeroDestino,
  mensagem
) => {
  const response = await axios.post(
    `${apiUrl}/messages`,
    {
      messaging_product: "whatsapp",
      to: numeroDestino.replace("+", ""),
      type: "text",
      text: {
        body: mensagem,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response;
};

/**
 * Implementação genérica para outras APIs
 */
const enviarViaApiGenerica = async (
  apiUrl,
  apiKey,
  numeroDestino,
  mensagem
) => {
  const response = await axios.post(
    apiUrl,
    {
      to: numeroDestino,
      message: mensagem,
      from: process.env.WHATSAPP_NUMERO_ORIGEM,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response;
};

/**
 * Testa a configuração do WhatsApp
 * @returns {Promise<Object>} Resultado do teste
 */
export const testarConfiguracaoWhatsApp = async () => {
  try {
    const apiUrl = process.env.WHATSAPP_API_URL;
    const apiKey = process.env.WHATSAPP_API_KEY;

    if (!apiUrl || !apiKey) {
      return {
        success: false,
        message:
          "Configuração incompleta - configure WHATSAPP_API_URL e WHATSAPP_API_KEY",
      };
    }

    // Teste básico de conectividade
    const response = await axios.get(apiUrl.replace("/messages", "/health"), {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      timeout: 5000,
    });

    return {
      success: true,
      message: "Configuração de WhatsApp válida",
      status: response.status,
    };
  } catch (error) {
    console.error("Erro na configuração de WhatsApp:", error.message);
    return {
      success: false,
      error: error.message,
      message: "Erro ao testar configuração do WhatsApp",
    };
  }
};

const formatarMensagem = (adesaoData) => {
  let mensagem = `🎉 *NOVA ADESÃO REALIZADA*\n\n`;
  mensagem += `👤 *Cliente:* ${adesaoData.nome}\n`;
  mensagem += `📧 *Email:* ${adesaoData.email}\n`;
  mensagem += `📱 *Telefone:* ${adesaoData.telefone}\n\n`;

  mensagem += `💊 *Plano:* ${adesaoData.plano}\n`;

  if (adesaoData.dadosPlano) {
    mensagem += `💰 *Valor Titular:* ${adesaoData.dadosPlano.valorTitular}\n`;

    if (adesaoData.dadosPlano.quantidadeDependentes > 0) {
      mensagem += `👥 *Dependentes:* ${adesaoData.dadosPlano.quantidadeDependentes}\n`;
      mensagem += `💰 *Valor Dependentes:* ${adesaoData.dadosPlano.valorDependentes}\n`;
      mensagem += `\n*Lista de Dependentes:*\n`;
      adesaoData.dadosPlano.detalhes.dependentes.forEach((dep, index) => {
        mensagem += `${index + 1}. ${dep.nome} (${dep.parentesco})\n`;
      });
    }

    mensagem += `\n💸 *VALOR TOTAL MENSAL: ${adesaoData.valor}*\n`;

    if (adesaoData.dadosPlano.odontologico) {
      mensagem += `🦷 ✅ *Com Cobertura Odontológica*\n`;
    } else {
      mensagem += `🦷 ❌ *Sem Cobertura Odontológica*\n`;
    }
  } else {
    mensagem += `💰 *Valor:* ${adesaoData.valor}\n`;
  }

  mensagem += `📅 *Data:* ${adesaoData.data}\n\n`;

  if (adesaoData.pdfUrl) {
    mensagem += `📄 *PDF da adesão disponível para download*\n`;
  }

  mensagem += `---\n📊 *Sistema de Gestão de Adesões*`;

  return mensagem;
};
