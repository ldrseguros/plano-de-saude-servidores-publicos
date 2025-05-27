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

const app = express();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);

// CORS configuration
app.use(
  cors({
    origin: [config.FRONTEND_URL, "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

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
});

export default app;
