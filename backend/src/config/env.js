import dotenv from "dotenv";

dotenv.config();

// Detectar ambiente
const isProd = process.env.NODE_ENV === "production";

const config = {
  // Ambiente
  IS_PRODUCTION: isProd,

  // Database
  DATABASE_URL: process.env.DATABASE_URL,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  // Server
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",

  // CORS
  FRONTEND_URL:
    process.env.FRONTEND_URL ||
    (isProd
      ? "https://plano-de-saude-servidores-publicos.vercel.app"
      : "http://localhost:8080"),

  // URLs de produção
  PRODUCTION_URL: "https://plano-de-saude-servidores-publicos.onrender.com",
  PRODUCTION_FRONTEND_URL:
    "https://plano-de-saude-servidores-publicos.vercel.app",

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,

  // Email (for future implementations)
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
};

// Validate required environment variables
const requiredEnvVars = ["DATABASE_URL"];

for (const envVar of requiredEnvVars) {
  if (!config[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Definir um valor padrão para JWT_SECRET se não estiver definido
if (!config.JWT_SECRET) {
  if (isProd) {
    // Em produção, lançar erro se não tiver JWT_SECRET
    throw new Error("JWT_SECRET is required in production environment");
  } else {
    console.warn(
      "WARNING: JWT_SECRET not found in environment variables, using default value. This is not secure for production!"
    );
    config.JWT_SECRET = "brasil_saude_jwt_secret_key_development_2024";
  }
}

export default config;
