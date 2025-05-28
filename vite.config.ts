import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente do arquivo .env correspondente ao modo
  const env = loadEnv(mode, process.cwd());

  // Determina se estamos em produção
  const isProduction = mode === "production";

  // Configura a URL da API baseada no ambiente
  const apiUrl = isProduction
    ? "https://plano-de-saude-servidores-publicos.onrender.com"
    : "http://localhost:5000";

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(
      Boolean
    ),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      // Disponibiliza variáveis de ambiente para o código
      "process.env.NODE_ENV": JSON.stringify(mode),
      "process.env.API_URL": JSON.stringify(apiUrl),
      "process.env.FRONTEND_URL": JSON.stringify(
        isProduction
          ? "https://plano-de-saude-servidores-publicos.vercel.app"
          : "http://localhost:8080"
      ),
    },
    build: {
      sourcemap: !isProduction,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom"],
            mui: ["@mui/material", "@mui/icons-material"],
            ui: [
              "@radix-ui/react-dialog",
              "@radix-ui/react-label",
              "@radix-ui/react-select",
            ],
          },
        },
      },
    },
  };
});
