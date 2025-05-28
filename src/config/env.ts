// Configuração de ambiente para o frontend

// Detectar ambiente
const isProduction = process.env.NODE_ENV === "production";
const isDevelopment = !isProduction;

// URLs base por ambiente
const PRODUCTION_API_URL =
  "https://plano-de-saude-servidores-publicos.onrender.com";
const DEVELOPMENT_API_URL = "http://localhost:5000";

// Configurações
const config = {
  // API
  API_URL: isProduction ? PRODUCTION_API_URL : DEVELOPMENT_API_URL,

  // Ambiente
  IS_PRODUCTION: isProduction,
  IS_DEVELOPMENT: isDevelopment,

  // Frontend
  FRONTEND_URL: isProduction
    ? "https://plano-de-saude-servidores-publicos.vercel.app"
    : "http://localhost:8080",
};

export default config;
