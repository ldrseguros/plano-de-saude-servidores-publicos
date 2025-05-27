import fetch from "node-fetch";

async function testApiLogin() {
  try {
    console.log("Testando API de login...");

    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "admin",
        password: "admin123",
      }),
    });

    const data = await response.json();

    console.log("Status:", response.status);
    console.log("Resposta:", data);

    if (response.ok) {
      console.log("✅ Login bem-sucedido via API!");
    } else {
      console.error("❌ Falha no login via API!");
    }
  } catch (error) {
    console.error("Erro ao testar API:", error);
  }
}

testApiLogin();
