import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Carrega variáveis de ambiente
dotenv.config();

// Configuração do transporter do Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // App password para Gmail
  },
});

/**
 * Gera o HTML do email de nova adesão
 * @param {Object} adesaoData - Dados da adesão
 * @returns {string} HTML do email
 */
const gerarHtmlEmail = (adesaoData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Nova Adesão - Plano de Saúde</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .section { background: white; margin: 20px 0; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; }
        .highlight { background: #e3f2fd; padding: 15px; border-radius: 6px; margin: 10px 0; }
        .value { font-weight: bold; color: #1976d2; font-size: 18px; }
        .dependentes { background: #f1f8e9; padding: 15px; border-radius: 6px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .details-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .details-table th, .details-table td { padding: 10px; border: 1px solid #ddd; text-align: left; }
        .details-table th { background: #f5f5f5; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🧑‍⚕️ Nova Adesão Recebida!</h1>
          <p>Um novo servidor aderiu ao plano de saúde</p>
        </div>
        
        <div class="content">
          <div class="section">
            <h2>📋 Dados do Cliente:</h2>
            <p><strong>Nome:</strong> ${adesaoData.nome}</p>
            <p><strong>E-mail:</strong> <a href="mailto:${adesaoData.email}">${
    adesaoData.email
  }</a></p>
            <p><strong>Telefone:</strong> ${adesaoData.telefone}</p>
          </div>
          
          <div class="section">
            <h2>💰 Dados da Adesão:</h2>
            <div class="highlight">
              <p><strong>Plano:</strong> ${adesaoData.plano}</p>
              ${
                adesaoData.dadosPlano
                  ? `
                <table class="details-table">
                  <tr>
                    <th>Descrição</th>
                    <th>Quantidade</th>
                    <th>Valor</th>
                  </tr>
                  <tr>
                    <td>Titular - ${
                      adesaoData.dadosPlano.detalhes.planoBase
                    }</td>
                    <td>1</td>
                    <td>${adesaoData.dadosPlano.valorTitular}</td>
                  </tr>
                  ${
                    adesaoData.dadosPlano.quantidadeDependentes > 0
                      ? `
                    <tr>
                      <td>Dependentes - ${adesaoData.dadosPlano.detalhes.planoBase}</td>
                      <td>${adesaoData.dadosPlano.quantidadeDependentes}</td>
                      <td>${adesaoData.dadosPlano.valorDependentes}</td>
                    </tr>
                  `
                      : ""
                  }
                  <tr style="background: #f0f8ff; font-weight: bold;">
                    <td>VALOR TOTAL MENSAL</td>
                    <td>-</td>
                    <td>${adesaoData.valor}</td>
                  </tr>
                </table>
                
                ${
                  adesaoData.dadosPlano.odontologico
                    ? `
                  <p style="color: #4caf50; font-weight: bold;">✓ Inclui cobertura odontológica (+R$ 25,00 por pessoa)</p>
                `
                    : `
                  <p style="color: #ff9800;">❌ Sem cobertura odontológica</p>
                `
                }
              `
                  : ""
              }
            </div>
            
            ${
              adesaoData.dadosPlano &&
              adesaoData.dadosPlano.quantidadeDependentes > 0
                ? `
              <div class="dependentes">
                <h3>👥 Dependentes (${
                  adesaoData.dadosPlano.quantidadeDependentes
                }):</h3>
                <ul>
                  ${adesaoData.dadosPlano.detalhes.dependentes
                    .map(
                      (dep) =>
                        `<li><strong>${dep.nome}</strong> - ${dep.parentesco}</li>`
                    )
                    .join("")}
                </ul>
              </div>
            `
                : ""
            }
            
            <p><strong>Data da Adesão:</strong> ${adesaoData.data}</p>
          </div>
          
          ${
            adesaoData.pdfUrl
              ? `
            <div class="section">
              <h2>📄 Documento:</h2>
              <p>PDF da adesão disponível para download:</p>
              <p><a href="${adesaoData.pdfUrl}" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">📥 Baixar PDF</a></p>
            </div>
          `
              : ""
          }
        </div>
        
        <div class="footer">
          <p>Sistema de Gestão de Adesões - Plano de Saúde para Servidores</p>
          <p>Email enviado automaticamente em ${new Date().toLocaleString(
            "pt-BR"
          )}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Envia um e-mail de notificação de nova adesão
 * @param {Object} adesaoData - Dados da adesão
 * @param {string} adesaoData.nome - Nome do cliente
 * @param {string} adesaoData.email - Email do cliente
 * @param {string} adesaoData.telefone - Telefone do cliente
 * @param {string} adesaoData.plano - Plano contratado
 * @param {string} adesaoData.valor - Valor do plano
 * @param {string} adesaoData.data - Data da adesão
 * @param {string} [adesaoData.pdfUrl] - URL para o PDF gerado (opcional)
 * @param {Buffer} [pdfBuffer] - Buffer do PDF para anexo (opcional)
 * @returns {Promise<Object>} Resultado do envio
 */
export const enviarEmailAdesao = async (adesaoData, pdfBuffer = null) => {
  try {
    const emailDestino = process.env.EMAIL_NOTIFICACAO || "adesoes@empresa.com";

    // Configuração dos anexos (se houver PDF)
    const attachments = [];
    if (pdfBuffer) {
      attachments.push({
        filename: `adesao-${adesaoData.nome.replace(/\s+/g, "-")}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      });
    }

    // Configuração do e-mail
    const mailOptions = {
      from: `"Sistema de Adesão" <${process.env.EMAIL_USER}>`,
      to: emailDestino,
      subject: "Nova adesão realizada",
      html: gerarHtmlEmail(adesaoData),
      attachments,
    };

    // Envia o e-mail
    const info = await transporter.sendMail(mailOptions);
    console.log("E-mail enviado com sucesso:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Erro ao enviar e-mail de adesão:", error);
    throw error;
  }
};

/**
 * Testa a configuração do email
 * @returns {Promise<Object>} Resultado do teste
 */
export const testarConfiguracaoEmail = async () => {
  try {
    await transporter.verify();
    return { success: true, message: "Configuração de email válida" };
  } catch (error) {
    console.error("Erro na configuração de email:", error);
    return { success: false, error: error.message };
  }
};
