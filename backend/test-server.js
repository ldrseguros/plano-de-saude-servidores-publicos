import { spawn } from "child_process";
import { setTimeout } from "timers/promises";

const API_BASE = "http://localhost:3000";

// Função para fazer requisições HTTP
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    return {
      status: response.status,
      ok: response.ok,
      data,
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message,
    };
  }
}

// Função para testar endpoints
async function testEndpoint(name, url, options = {}) {
  console.log(`\n🧪 Testing ${name}...`);
  console.log(`   URL: ${url}`);

  const result = await makeRequest(url, options);

  if (result.ok) {
    console.log(`   ✅ SUCCESS (${result.status})`);
    if (options.showData !== false) {
      console.log(`   📄 Response:`, JSON.stringify(result.data, null, 2));
    }
  } else {
    console.log(`   ❌ FAILED (${result.status})`);
    console.log(`   📄 Error:`, result.error || result.data);
  }

  return result;
}

// Função principal de teste
async function runTests() {
  console.log("🚀 Starting automated server tests...\n");

  // Iniciar o servidor
  console.log("📡 Starting server...");
  const serverProcess = spawn("node", ["server.js"], {
    stdio: "pipe",
    shell: true,
  });

  let serverStarted = false;

  serverProcess.stdout.on("data", (data) => {
    const output = data.toString();
    console.log("📟 Server:", output.trim());
    if (output.includes("running on port")) {
      serverStarted = true;
    }
  });

  serverProcess.stderr.on("data", (data) => {
    console.log("❌ Server Error:", data.toString().trim());
  });

  // Aguardar o servidor iniciar
  console.log("⏳ Waiting for server to start...");
  let attempts = 0;
  while (!serverStarted && attempts < 30) {
    await setTimeout(1000);
    attempts++;
  }

  if (!serverStarted) {
    console.log("❌ Server failed to start within 30 seconds");
    serverProcess.kill();
    return;
  }

  console.log("✅ Server started successfully!\n");

  // Aguardar mais um pouco para garantir que está pronto
  await setTimeout(2000);

  try {
    // Testes básicos
    await testEndpoint("Root endpoint", `${API_BASE}/`);
    await testEndpoint("Health check", `${API_BASE}/health`);

    // Testes de usuários
    console.log("\n📋 Testing User endpoints...");
    await testEndpoint("Get all users", `${API_BASE}/api/users`);
    await testEndpoint(
      "Get dashboard stats",
      `${API_BASE}/api/users/dashboard/stats`
    );

    // Teste de criação de usuário
    const newUser = {
      name: "Teste Automatizado",
      email: "teste@anicuns.go.gov.br",
      phone: "(64) 99999-0000",
      cpf: "000.000.000-00",
      birthDate: "1990-01-01",
      address: "Rua Teste, 123",
      city: "Anicuns",
      state: "GO",
      zipCode: "76170-000",
      organization: "Teste",
      position: "Testador",
      employeeId: "TEST001",
    };

    const createResult = await testEndpoint(
      "Create new user",
      `${API_BASE}/api/users`,
      {
        method: "POST",
        body: JSON.stringify(newUser),
      }
    );

    let userId = null;
    if (createResult.ok && createResult.data.data) {
      userId = createResult.data.data.id;
      console.log(`   📝 Created user with ID: ${userId}`);

      // Testar busca por ID
      await testEndpoint(
        `Get user by ID (${userId})`,
        `${API_BASE}/api/users/${userId}`
      );

      // Testar atualização
      await testEndpoint(
        `Update user status`,
        `${API_BASE}/api/users/${userId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({
            leadStatus: "GREEN",
            currentStep: "APPROVAL",
          }),
        }
      );
    }

    // Testes de dependentes
    console.log("\n👨‍👩‍👧‍👦 Testing Dependent endpoints...");
    await testEndpoint("Get all dependents", `${API_BASE}/api/dependents`);

    if (userId) {
      const newDependent = {
        userId: userId,
        name: "Dependente Teste",
        cpf: "111.111.111-11",
        birthDate: "2010-01-01",
        relationship: "Filho",
        planType: "WARD",
      };

      await testEndpoint("Create new dependent", `${API_BASE}/api/dependents`, {
        method: "POST",
        body: JSON.stringify(newDependent),
      });
    }

    // Testes de enrollment
    console.log("\n📝 Testing Enrollment endpoints...");
    await testEndpoint(
      "Get enrollment steps",
      `${API_BASE}/api/enrollment/steps`
    );

    if (userId) {
      await testEndpoint(
        `Get user enrollment steps`,
        `${API_BASE}/api/enrollment/steps/${userId}`
      );
    }

    // Testes de endpoints inexistentes
    console.log("\n🔍 Testing error handling...");
    await testEndpoint("Non-existent endpoint", `${API_BASE}/api/nonexistent`);
    await testEndpoint("Non-existent user", `${API_BASE}/api/users/99999`);

    console.log("\n🎉 All tests completed!");
  } catch (error) {
    console.log("\n❌ Test suite failed:", error.message);
  } finally {
    // Parar o servidor
    console.log("\n🛑 Stopping server...");
    serverProcess.kill();
    await setTimeout(2000);
    console.log("✅ Server stopped");
  }
}

// Executar os testes
runTests().catch(console.error);
