import {
  enviarEmailAdesao,
  testarConfiguracaoEmail,
} from "./src/services/emailService.js";
import dotenv from "dotenv";

// Carrega variáveis de ambiente
dotenv.config();

console.log("🔍 DIAGNÓSTICO DE EMAIL - TESTANDO NOVO FORMATO\n");
console.log("=".repeat(50));

// 1. Verificar variáveis de ambiente
console.log("📋 1. VERIFICANDO CONFIGURAÇÕES:");
console.log("   EMAIL_HOST:", process.env.EMAIL_HOST || "❌ NÃO CONFIGURADO");
console.log("   EMAIL_PORT:", process.env.EMAIL_PORT || "❌ NÃO CONFIGURADO");
console.log(
  "   EMAIL_SECURE:",
  process.env.EMAIL_SECURE || "❌ NÃO CONFIGURADO"
);
console.log("   EMAIL_USER:", process.env.EMAIL_USER || "❌ NÃO CONFIGURADO");
console.log(
  "   EMAIL_PASSWORD:",
  process.env.EMAIL_PASSWORD ? "✅ CONFIGURADO (****)" : "❌ NÃO CONFIGURADO"
);
console.log(
  "   EMAIL_NOTIFICACAO:",
  process.env.EMAIL_NOTIFICACAO || "❌ NÃO CONFIGURADO"
);
console.log();

// 2. Testar configuração
console.log("🧪 2. TESTANDO CONFIGURAÇÃO SMTP:");
try {
  const testeConfig = await testarConfiguracaoEmail();
  if (testeConfig.success) {
    console.log("   ✅ Configuração SMTP válida!");
  } else {
    console.log("   ❌ Erro na configuração:", testeConfig.error);
    process.exit(1);
  }
} catch (error) {
  console.log("   ❌ Erro ao testar configuração:", error.message);
  process.exit(1);
}
console.log();

// 3. Dados de teste com formato atualizado
const adesaoTeste = {
  nome: "Maria Silva Santos (TESTE DIAGNÓSTICO)",
  email: "maria.teste@email.com",
  telefone: "(62) 99999-8888",
  plano: "Plano Apartamento + Odontológico",
  valor: "R$ 683,00",
  data: new Date().toLocaleDateString("pt-BR"),
  pdfUrl: null,
  dadosPlano: {
    nome: "Plano Apartamento + Odontológico",
    valorTitular: "R$ 236,00",
    valorDependentes: "R$ 472,00",
    valorTotal: "R$ 708,00",
    quantidadeDependentes: 2,
    odontologico: true,
    detalhes: {
      planoBase: "Plano Apartamento",
      precoBase: 211,
      adicionalOdonto: 25,
      dependentes: [
        { nome: "João Silva Santos", parentesco: "Cônjuge" },
        { nome: "Ana Silva Santos", parentesco: "Filha" },
      ],
    },
  },
};

console.log("📧 3. ENVIANDO EMAIL DE TESTE COM NOVO FORMATO:");
console.log("   De:", process.env.EMAIL_USER);
console.log("   Para:", process.env.EMAIL_NOTIFICACAO);
console.log("   Dados:", JSON.stringify(adesaoTeste, null, 2));
console.log();

// 4. Enviar email
try {
  console.log("   ⏳ Enviando email...");
  const resultado = await enviarEmailAdesao(adesaoTeste);

  if (resultado.success) {
    console.log("   ✅ EMAIL ENVIADO COM SUCESSO!");
    console.log("   📨 Message ID:", resultado.messageId);
    console.log("   🎯 Verifique o email em:", process.env.EMAIL_NOTIFICACAO);
    console.log("   📁 Também verifique a pasta SPAM/LIXO ELETRÔNICO");
    console.log("   📊 O email deve conter:");
    console.log("     - Dados detalhados do plano");
    console.log("     - Lista de dependentes");
    console.log("     - Valores discriminados");
    console.log("     - Layout moderno e profissional");
  } else {
    console.log("   ❌ Falha no envio:", resultado);
  }
} catch (error) {
  console.log("   ❌ ERRO NO ENVIO:");
  console.log("   📄 Mensagem:", error.message);
  console.log("   🔍 Código:", error.code);
  console.log("   🌐 Comando:", error.command);

  // Erros comuns
  if (error.code === "EAUTH") {
    console.log("\n💡 SOLUÇÃO PROVÁVEL:");
    console.log("   1. Verifique se a senha de app está correta");
    console.log("   2. Confirme que a verificação em 2 etapas está ativa");
    console.log("   3. Gere uma nova senha de app se necessário");
  } else if (error.code === "ETIMEDOUT" || error.code === "ENOTFOUND") {
    console.log("\n💡 SOLUÇÃO PROVÁVEL:");
    console.log("   1. Verifique sua conexão com a internet");
    console.log("   2. Confirme as configurações de HOST e PORT");
  } else if (error.code === "ECONNECTION") {
    console.log("\n💡 SOLUÇÃO PROVÁVEL:");
    console.log(
      "   1. Verifique se EMAIL_SECURE está configurado corretamente"
    );
    console.log('   2. Para Gmail use: EMAIL_SECURE="false"');
  }
}

console.log("\n" + "=".repeat(50));
console.log("🎉 TESTE CONCLUÍDO");
