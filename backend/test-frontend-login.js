import fetch from "node-fetch";

async function testFrontendLogin() {
  try {
    console.log("Simulando o comportamento do frontend...");

    // URL e dados de login
    const url = "http://localhost:5000/api/auth/login";
    const data = {
      username: "admin",
      password: "admin123",
    };

    console.log("Enviando requisição:", {
      url,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    // Fazer a requisição
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    // Ler resposta
    const responseData = await response.json();

    console.log("\nResposta:");
    console.log("Status:", response.status);
    console.log(
      "Headers:",
      Object.fromEntries([...response.headers.entries()])
    );
    console.log("Body:", JSON.stringify(responseData, null, 2));

    // Verificar estrutura da resposta
    console.log("\nVerificando estrutura da resposta:");

    if (responseData.success === true) {
      console.log("✅ success: true");
    } else {
      console.error("❌ success não é true:", responseData.success);
    }

    if (responseData.statusCode === 200) {
      console.log("✅ statusCode: 200");
    } else {
      console.error("❌ statusCode não é 200:", responseData.statusCode);
    }

    if (responseData.data && typeof responseData.data === "object") {
      console.log("✅ data é um objeto");

      if (
        responseData.data.admin &&
        typeof responseData.data.admin === "object"
      ) {
        console.log("✅ data.admin é um objeto");
        console.log("Admin:", responseData.data.admin);
      } else {
        console.error(
          "❌ data.admin não é um objeto:",
          responseData.data.admin
        );
      }

      if (
        responseData.data.token &&
        typeof responseData.data.token === "string"
      ) {
        console.log("✅ data.token é uma string");
        console.log(
          "Token (primeiros 20 caracteres):",
          responseData.data.token.substring(0, 20) + "..."
        );
      } else {
        console.error(
          "❌ data.token não é uma string:",
          responseData.data.token
        );
      }
    } else {
      console.error("❌ data não é um objeto:", responseData.data);
    }

    // Simular o processamento no frontend
    console.log("\nSimulando o processamento no frontend:");
    if (responseData.success && responseData.data && responseData.data.token) {
      console.log("✅ Frontend processaria isso como um login bem-sucedido");
    } else {
      console.error("❌ Frontend processaria isso como um erro de login");
      if (!responseData.success) console.error("  - success não é true");
      if (!responseData.data) console.error("  - data não existe ou é null");
      if (responseData.data && !responseData.data.token)
        console.error("  - token não existe");
    }
  } catch (error) {
    console.error("Erro durante o teste:", error);
  }
}

testFrontendLogin();
