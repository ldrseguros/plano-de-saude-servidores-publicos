import { spawn } from "child_process";

console.log("🚀 Quick Server Test\n");

// Iniciar servidor
console.log("📡 Starting server...");
const server = spawn("node", ["server.js"], {
  stdio: "inherit",
  shell: true,
});

// Aguardar 3 segundos e fazer teste básico
setTimeout(async () => {
  console.log("\n🧪 Testing basic endpoints...");

  try {
    // Teste básico
    const response = await fetch("http://localhost:3000/health");
    const data = await response.json();

    if (response.ok) {
      console.log("✅ Health check: OK");
      console.log("📄 Response:", data);
    } else {
      console.log("❌ Health check failed");
    }

    // Teste de usuários
    const usersResponse = await fetch("http://localhost:3000/api/users");
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log(
        `✅ Users endpoint: OK (${usersData.data?.length || 0} users found)`
      );
    } else {
      console.log("❌ Users endpoint failed");
    }
  } catch (error) {
    console.log("❌ Test failed:", error.message);
  }

  console.log("\n✅ Quick test completed!");
  console.log("🌐 Server is running at: http://localhost:3000");
  console.log("📋 API endpoints available at: http://localhost:3000/api/");
  console.log("\n💡 Press Ctrl+C to stop the server");
}, 3000);
