import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import config from "./src/config/env.js";
import prisma from "./src/config/database.js";

// Import routes
import userRoutes from "./src/routes/userRoutes.js";
import dependentRoutes from "./src/routes/dependentRoutes.js";
import enrollmentRoutes from "./src/routes/enrollmentRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";

const app = express();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Desabilitar CSP para permitir PDFs em iframes
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs:
    config.NODE_ENV === "development" ? 1000 : config.RATE_LIMIT_WINDOW_MS,
  max: config.NODE_ENV === "development" ? 100 : config.RATE_LIMIT_MAX_REQUESTS,
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) =>
    config.NODE_ENV === "development" && req.method === "OPTIONS",
});

app.use("/api/", limiter);

// CORS configuration
app.use((req, res, next) => {
  // Permitir domínios específicos
  const allowedOrigins = [
    config.FRONTEND_URL,
    "http://localhost:3000",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    config.PRODUCTION_FRONTEND_URL,
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Disposition"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Expose-Headers",
    "Content-Disposition, Content-Type"
  );

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

// Previous CORS middleware (mantido para compatibilidade)
app.use(
  cors({
    origin: [
      config.FRONTEND_URL,
      "http://localhost:3000",
      "http://localhost:8080",
      "http://127.0.0.1:8080",
      config.PRODUCTION_FRONTEND_URL,
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cookie",
      "X-Requested-With",
      "Content-Disposition",
    ],
    exposedHeaders: ["Content-Disposition", "Content-Type"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// Handle OPTIONS requests globally
app.options("*", (req, res) => {
  res.status(200).end();
});

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
      database: "Connected",
    });
  } catch (error) {
    res.status(503).json({
      status: "Error",
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
      database: "Disconnected",
      error: error.message,
    });
  }
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dependents", dependentRoutes);
app.use("/api/enrollment", enrollmentRoutes);
app.use("/api/notifications", notificationRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Brasil Saúde Servidor - CRM API",
    version: "1.0.0",
    status: "Running",
    endpoints: {
      health: "/health",
      auth: "/api/auth",
      users: "/api/users",
      dependents: "/api/dependents",
      enrollment: "/api/enrollment",
      notifications: "/api/notifications",
    },
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);

  res.status(error.status || 500).json({
    success: false,
    message:
      config.NODE_ENV === "development"
        ? error.message
        : "Internal Server Error",
    ...(config.NODE_ENV === "development" && { stack: error.stack }),
  });
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully");
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Brasil Saúde Servidor CRM API running on port ${PORT}`);
  console.log(`📊 Environment: ${config.NODE_ENV}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 API docs: http://localhost:${PORT}/`);
  console.log(`🔗 Frontend URL: ${config.FRONTEND_URL}`);

  if (config.IS_PRODUCTION) {
    console.log("✅ Running in PRODUCTION mode");
    console.log(`🌎 Production API URL: ${config.PRODUCTION_URL}`);
    console.log(
      `🌎 Production Frontend URL: ${config.PRODUCTION_FRONTEND_URL}`
    );
  } else {
    console.log("🛠️ Running in DEVELOPMENT mode");
  }
});

export default app;
